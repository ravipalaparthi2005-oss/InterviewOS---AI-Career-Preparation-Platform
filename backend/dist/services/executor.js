"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExecutor = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class CodeExecutor {
    tmpDir = path.join(process.cwd(), '.code-execution');
    constructor() {
        if (!fs.existsSync(this.tmpDir)) {
            fs.mkdirSync(this.tmpDir, { recursive: true });
        }
    }
    async executeCode(req) {
        const startTime = Date.now();
        const results = [];
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
                    if (testPassed)
                        passed++;
                    results.push({
                        passed: testPassed,
                        testCase: i + 1,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: actualOutput,
                        executionTime
                    });
                }
                catch (error) {
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
        }
        catch (error) {
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
    async runTest(code, language, input) {
        let filename;
        let command;
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
        }
        finally {
            // Cleanup
            try {
                if (fs.existsSync(filename))
                    fs.unlinkSync(filename);
                if (language === 'cpp') {
                    const exePath = filename.replace('.cpp', '.exe');
                    if (fs.existsSync(exePath))
                        fs.unlinkSync(exePath);
                }
            }
            catch (e) {
                // Ignore cleanup errors
            }
        }
    }
    wrapJSCode(code, input) {
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
    wrapPythonCode(code, input) {
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
    wrapCppCode(code, input) {
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
    wrapJavaCode(code, input) {
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
exports.CodeExecutor = CodeExecutor;
