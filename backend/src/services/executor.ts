import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface CodeExecutionRequest {
  code: string;
  language: string;
  testCases: Array<{ input: string; expectedOutput: string }>;
}

export interface TestResult {
  passed: boolean;
  testCase: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  executionTime: number;
}

export interface ExecutionResult {
  success: boolean;
  passed: number;
  total: number;
  results: TestResult[];
  error?: string;
  totalTime: number;
}

export class CodeExecutor {
  private tmpDir = path.join(process.cwd(), '.code-execution');

  constructor() {
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }
  }

  async executeCode(req: CodeExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    let passed = 0;

    try {
      for (let i = 0; i < req.testCases.length; i++) {
        const testCase = req.testCases[i];
        const testStartTime = Date.now();

        try {
          const result = await this.runTest(req.code, req.language, testCase.input);
          const executionTime = Date.now() - testStartTime;
          const actualOutput = result.trim();
          const expectedOutput = testCase.expectedOutput.trim();

          const testPassed = actualOutput === expectedOutput;
          if (testPassed) passed++;

          results.push({
            passed: testPassed,
            testCase: i + 1,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: actualOutput,
            executionTime
          });
        } catch (error: any) {
          results.push({
            passed: false,
            testCase: i + 1,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            error: error.message || 'Execution failed',
            executionTime: Date.now() - testStartTime
          });
        }
      }

      return {
        success: passed === req.testCases.length,
        passed,
        total: req.testCases.length,
        results,
        totalTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        success: false,
        passed: 0,
        total: req.testCases.length,
        results,
        error: error.message,
        totalTime: Date.now() - startTime
      };
    }
  }

  private async runTest(code: string, language: string, input: string): Promise<string> {
    let filename: string;
    let command: string;

    switch (language) {
      case 'javascript':
      case 'typescript':
        filename = path.join(this.tmpDir, `code_${Date.now()}.js`);
        fs.writeFileSync(filename, this.wrapJSCode(code, input));
        command = `node "${filename}"`;
        break;

      case 'python':
        filename = path.join(this.tmpDir, `code_${Date.now()}.py`);
        fs.writeFileSync(filename, this.wrapPythonCode(code, input));
        command = `python "${filename}"`;
        break;

      case 'cpp':
        filename = path.join(this.tmpDir, `code_${Date.now()}.cpp`);
        const exePath = filename.replace('.cpp', '.exe');
        fs.writeFileSync(filename, this.wrapCppCode(code, input));
        command = `g++ -o "${exePath}" "${filename}" && "${exePath}"`;
        break;

      case 'java':
        filename = path.join(this.tmpDir, 'Solution.java');
        fs.writeFileSync(filename, this.wrapJavaCode(code, input));
        command = `cd "${this.tmpDir}" && javac Solution.java && java Solution`;
        break;

      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 5000, maxBuffer: 1024 * 1024 });
      
      if (stderr) {
        throw new Error(stderr);
      }

      return stdout;
    } finally {
      // Cleanup
      try {
        if (fs.existsSync(filename)) fs.unlinkSync(filename);
        if (language === 'cpp') {
          const exePath = filename.replace('.cpp', '.exe');
          if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  private wrapJSCode(code: string, input: string): string {
    return `
const input = \`${input.replace(/`/g, '\\`')}\`;
const lines = input.trim().split('\\n');
let lineIndex = 0;

function readLine() {
  return lines[lineIndex++] || '';
}

function print(str) {
  console.log(str);
}

${code}
`;
  }

  private wrapPythonCode(code: string, input: string): string {
    return `
import sys
input_data = """${input.replace(/"/g, '\\"')}""".strip().split('\\n')
input_index = 0

def read_line():
    global input_index
    if input_index < len(input_data):
        line = input_data[input_index]
        input_index += 1
        return line
    return ""

def print_out(x):
    print(x)

${code}
`;
  }

  private wrapCppCode(code: string, input: string): string {
    return `
#include <iostream>
#include <sstream>
#include <vector>
using namespace std;

string input_str = "${input.replace(/"/g, '\\"')}";
istringstream input_stream(input_str);

string read_line() {
    string line;
    getline(input_stream, line);
    return line;
}

${code}
`;
  }

  private wrapJavaCode(code: string, input: string): string {
    return `
import java.util.*;
import java.io.*;

public class Solution {
    static String[] inputLines = """${input.replace(/"/g, '\\"')}""".trim().split("\\n");
    static int lineIndex = 0;
    
    static String readLine() {
        return lineIndex < inputLines.length ? inputLines[lineIndex++] : "";
    }
    
    static void print(Object o) {
        System.out.println(o);
    }
    
    public static void main(String[] args) throws Exception {
        ${code}
    }
}
`;
  }
}
