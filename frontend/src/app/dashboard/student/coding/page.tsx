'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth, API_URL } from '../../../../components/Providers';
import { 
  Sparkles, 
  Code2, 
  Terminal, 
  Play, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Database,
  Cpu,
  Clock,
  Send,
  History,
  AlertCircle
} from 'lucide-react';

// Monaco Editor - Dynamic Import
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANGUAGE_TEMPLATES: Record<string, string> = {
  typescript: `// Solution goes here
function solve(input: string[]): any {
  // Parse input and implement solution
  return result;
}`,
  python: `# Solution goes here
def solve(input_lines):
    # Parse input and implement solution
    return result`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Solution goes here
    return 0;
}`,
  java: `public class Solution {
    public static void main(String[] args) {
        // Solution goes here
    }
}`
};

const SAMPLE_PROBLEMS = [
  {
    id: 'problem-1',
    title: 'Two Sum',
    difficulty: 'EASY',
    category: 'Arrays',
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    examples: [
      { input: '[2, 7, 11, 15]', target: 9, output: '[0, 1]' },
      { input: '[3, 2, 4]', target: 6, output: '[1, 2]' }
    ],
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1' },
      { input: '3 2 4\n6', expectedOutput: '1 2' },
      { input: '3 3\n6', expectedOutput: '0 1' }
    ]
  },
  {
    id: 'problem-2',
    title: 'Balanced Binary Search Tree',
    difficulty: 'MEDIUM',
    category: 'Trees',
    description: 'Given the root of a binary search tree, return a balanced binary search tree with the same node values.',
    constraints: ['1 <= nodes <= 10^4'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    examples: [],
    testCases: [
      { input: '[1, null, 2, null, 3]', expectedOutput: '[2, 1, 3]' },
      { input: '[2, 1, 3]', expectedOutput: '[2, 1, 3]' }
    ]
  }
];

interface TestResult {
  passed: boolean;
  testCase: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  executionTime: number;
}

interface ExecutionResult {
  success: boolean;
  passed: number;
  total: number;
  results: TestResult[];
  error?: string;
  totalTime: number;
}

export default function CodingPage() {
  const { token } = useAuth();
  
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.typescript);
  const [selectedProblem, setSelectedProblem] = useState(SAMPLE_PROBLEMS[0]);
  
  const [loading, setLoading] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [aiHint, setAiHint] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(LANGUAGE_TEMPLATES[newLanguage as keyof typeof LANGUAGE_TEMPLATES]);
    setTestResults([]);
    setExecutionResult(null);
  };

  // Run code against test cases
  const handleRunCode = async () => {
    if (!selectedProblem) {
      alert('Please select a problem first');
      return;
    }

    setLoading(true);
    setAiHint('');
    setTestResults([]);

    try {
      const res = await fetch(`${API_URL}/coding/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          code,
          language
        })
      });

      if (res.ok) {
        const data: ExecutionResult = await res.json();
        setExecutionResult(data);
        setTestResults(data.results);
      } else {
        const error = await res.json();
        alert(`Execution error: ${error.error}`);
      }
    } catch (error: any) {
      console.error('Run code error:', error);
      // Simulate test results for demo
      const simulatedResults: TestResult[] = selectedProblem.testCases.map((tc, idx) => ({
        passed: idx === 0,
        testCase: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: idx === 0 ? tc.expectedOutput : 'Incorrect',
        executionTime: Math.random() * 100
      }));
      setTestResults(simulatedResults);
      setExecutionResult({
        success: simulatedResults.every(r => r.passed),
        passed: simulatedResults.filter(r => r.passed).length,
        total: simulatedResults.length,
        results: simulatedResults,
        totalTime: Math.random() * 300
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit solution
  const handleSubmit = async () => {
    if (!selectedProblem) {
      alert('Please select a problem first');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/coding/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          code,
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        setExecutionResult(data);
        setTestResults(data.results);
        if (data.aiHints) {
          setAiHint(data.aiHints);
        }
        // Add to history
        setSubmissionHistory([{ ...data, language, createdAt: new Date() }, ...submissionHistory]);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  // Get AI hint
  const handleGetHint = async () => {
    setHintLoading(true);
    try {
      const res = await fetch(`${API_URL}/interviews/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: selectedProblem.description,
          answer: code
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiHint(data.evaluation?.technicalCorrectness || 'Think about edge cases and optimize your approach.');
      }
    } catch (error) {
      console.error('Hint error:', error);
      setAiHint('Try using a different data structure or algorithm approach. Consider the time and space complexity requirements.');
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Coding Interview Arena</h1>
          <p className="text-slate-400 text-sm mt-1">Master algorithmic problem-solving with real-time execution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Sidebar - Problem List */}
        <div className="lg:col-span-3 flex flex-col space-y-4 overflow-auto">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problems</h3>
            {SAMPLE_PROBLEMS.map((problem) => (
              <button
                key={problem.id}
                onClick={() => {
                  setSelectedProblem(problem);
                  setTestResults([]);
                  setAiHint('');
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedProblem.id === problem.id
                    ? 'bg-purple-500/20 border-purple-500/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{problem.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{problem.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                    problem.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
                    problem.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Submission History */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-400 hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Submission History ({submissionHistory.length})
          </button>

          {showHistory && submissionHistory.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {submissionHistory.map((sub, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-slate-400">{sub.language}</span>
                    {sub.success ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500">{sub.passed}/{sub.total} tests passed</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle - Editor & Results */}
        <div className="lg:col-span-4 flex flex-col space-y-4 min-h-0">
          
          {/* Language Selector */}
          <div className="flex gap-2">
            {['typescript', 'python', 'cpp', 'java'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === lang
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 rounded-lg border border-white/10 bg-[#050508] overflow-hidden min-h-0">
            <MonacoEditor
              theme="vs-dark"
              language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'java' ? 'java' : 'typescript'}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                wordWrap: 'on',
                lineNumbers: 'on',
                scrollBeyondLastLine: false
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleRunCode}
              disabled={loading}
              className="flex-1 h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Tests
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-10 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit
            </button>
            <button
              onClick={handleGetHint}
              disabled={hintLoading}
              className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {hintLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right - Problem Details & Results */}
        <div className="lg:col-span-5 flex flex-col space-y-4 overflow-auto">
          
          {/* Problem Statement */}
          <div className="glass-panel p-4 rounded-lg border border-white/10 space-y-3">
            <div>
              <h3 className="text-lg font-bold text-white">{selectedProblem.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedProblem.description}</p>
            </div>

            {/* Complexity Info */}
            <div className="grid grid-cols-2 gap-2 p-2 bg-black/40 rounded border border-white/5">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-slate-500">Time</p>
                  <p className="font-bold text-white">{selectedProblem.timeComplexity}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Database className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-slate-500">Space</p>
                  <p className="font-bold text-white">{selectedProblem.spaceComplexity}</p>
                </div>
              </div>
            </div>

            {/* Constraints */}
            {selectedProblem.constraints.length > 0 && (
              <div className="text-xs space-y-1">
                <p className="text-slate-400 font-semibold">Constraints:</p>
                {selectedProblem.constraints.map((c, idx) => (
                  <p key={idx} className="text-slate-500">• {c}</p>
                ))}
              </div>
            )}
          </div>

          {/* AI Hint */}
          {aiHint && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Sparkles className="w-4 h-4" />
                AI Hint
              </div>
              <p className="text-slate-300">{aiHint}</p>
            </div>
          )}

          {/* Test Results */}
          {executionResult && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border ${
                executionResult.success
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {executionResult.passed}/{executionResult.total} Test Cases Passed
                  </span>
                  <span className={`text-xs font-bold ${
                    executionResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {executionResult.totalTime}ms
                  </span>
                </div>
              </div>

              {/* Individual Test Results */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-400">Test {result.testCase}</span>
                      {result.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    {result.error && (
                      <div className="flex gap-2 p-1 bg-red-500/10 rounded text-red-400">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <p className="font-mono text-[9px]">{result.error}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                      <div>
                        <p className="text-slate-500">Expected:</p>
                        <p className="font-mono text-slate-300 truncate">{result.expectedOutput}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Got:</p>
                        <p className={`font-mono truncate ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {result.actualOutput}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
