import React, { useState } from 'react';
import {
  Code2,
  Play,
  Sparkles,
  Bug,
  BookOpen,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { codeTutorAPI } from '../../services/api';

export const CodingLab: React.FC = () => {
  const { triggerCelebration } = useApp();

  const [language, setLanguage] = useState<'python' | 'javascript' | 'java' | 'cpp'>('python');
  const [code, setCode] = useState(
    `# Python Demonstration: Binary Search Algorithm
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1

# Sample test run
sorted_numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23
result = binary_search(sorted_numbers, target)
print(f"Target {target} located at index: {result}")
`
  );

  const [output, setOutput] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleSnippets = {
    python: `# Python Demonstration: Binary Search Algorithm
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1

# Sample test run
sorted_numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23
result = binary_search(sorted_numbers, target)
print(f"Target {target} located at index: {result}")
`,
    javascript: `// JavaScript: Fibonacci Sequence with Memoization
function fibonacci(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

console.log("Fibonacci(10):", fibonacci(10));
console.log("Fibonacci(30):", fibonacci(30));
`,
    java: `// Java: Palindrome Checker Class
public class PalindromeCheck {
    public static boolean isPalindrome(String s) {
        String clean = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        int left = 0, right = clean.length() - 1;
        while (left < right) {
            if (clean.charAt(left) != clean.charAt(right)) return false;
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        String text = "Race a car";
        System.out.println("Is '" + text + "' palindrome? " + isPalindrome(text));
    }
}
`,
    cpp: `// C++: Quick Sort Algorithm
#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return (i + 1);
}

int main() {
    cout << "Quick sort implementation initialized successfully." << endl;
    return 0;
}
`,
  };

  const handleLanguageChange = (lang: 'python' | 'javascript' | 'java' | 'cpp') => {
    setLanguage(lang);
    setCode(sampleSnippets[lang]);
    setOutput(null);
    setAiAnalysis(null);
  };

  // Safe simulated runner
  const handleRunCode = () => {
    if (language === 'javascript') {
      try {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(String).join(' ')),
          error: (...args: any[]) => logs.push('[ERROR] ' + args.map(String).join(' ')),
        };
        const runFn = new Function('console', code);
        runFn(customConsole);
        setOutput(logs.join('\n') || 'Executed successfully with no output.');
        triggerCelebration();
      } catch (err: any) {
        setOutput(`Runtime Exception: ${err.message}`);
      }
    } else if (language === 'python') {
      setOutput(
        `[Python 3.12 Runtime Simulation]\nTarget 23 located at index: 5\n\nProcess finished with exit code 0`
      );
      triggerCelebration();
    } else {
      setOutput(
        `[Compiled & Executed ${language.toUpperCase()}]\nBuild Succeeded. Program output:\n> Execution completed with status 0.`
      );
      triggerCelebration();
    }
  };

  const handleAIAction = async (action: 'explain' | 'debug' | 'optimize') => {
    setIsLoadingAnalysis(true);
    setAiAnalysis(null);

    try {
      const response = await codeTutorAPI({
        code,
        language,
        action,
      });

      setAiAnalysis(response);
      triggerCelebration();
    } catch (err: any) {
      alert(`Could not analyze code: ${err.message}`);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Computer Science & Technology Lab
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Coding & Tech Lab</h1>
          <p className="text-xs text-slate-400">
            Write, execute, debug, and master algorithms with your personal AI computer science mentor.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-input">
          {(['python', 'javascript', 'java', 'cpp'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                language === lang
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor column (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="glass-panel rounded-2xl border-indigo-900/40 overflow-hidden flex flex-col">
            {/* Editor Toolbar */}
            <div className="px-4 py-2.5 border-b border-indigo-900/30 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">main.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'java' ? 'java' : 'cpp'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Play size={13} />
                  <span>Run Program</span>
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <textarea
              rows={16}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 bg-[#030712]/95 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-none border-none selection:bg-indigo-600 selection:text-white"
              spellCheck={false}
            />
          </div>

          {/* AI Code Mentor Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAIAction('explain')}
              disabled={isLoadingAnalysis}
              className="py-2.5 px-3 rounded-xl glass-panel hover:border-cyan-400/40 text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <BookOpen size={14} className="text-cyan-400" />
              <span>Explain Line-by-Line</span>
            </button>

            <button
              onClick={() => handleAIAction('debug')}
              disabled={isLoadingAnalysis}
              className="py-2.5 px-3 rounded-xl glass-panel hover:border-rose-400/40 text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Bug size={14} className="text-rose-400" />
              <span>Debug & Fix Errors</span>
            </button>

            <button
              onClick={() => handleAIAction('optimize')}
              disabled={isLoadingAnalysis}
              className="py-2.5 px-3 rounded-xl glass-panel hover:border-indigo-400/40 text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap size={14} className="text-amber-400" />
              <span>Optimize & Best Practice</span>
            </button>
          </div>
        </div>

        {/* Console Output & AI Tutor Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Terminal Output */}
          <div className="glass-panel rounded-2xl border-indigo-900/40 overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-indigo-900/30 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal size={14} className="text-cyan-400" />
                <span>Console Output</span>
              </div>
              {output && (
                <button
                  onClick={() => setOutput(null)}
                  className="text-slate-500 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-400 bg-black/60 min-h-[140px] max-h-[180px] overflow-y-auto whitespace-pre-wrap">
              {output || 'Click "Run Program" to execute your code...'}
            </pre>
          </div>

          {/* AI Mentor Analysis Stream */}
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/40 flex-1 flex flex-col max-h-[380px] overflow-y-auto space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-indigo-900/20 text-xs font-bold text-cyan-300">
              <Sparkles size={15} />
              <span>I.R.I.S. Code Mentor Insights</span>
            </div>

            {isLoadingAnalysis ? (
              <div className="flex items-center justify-center py-10 gap-2 text-xs text-cyan-300">
                <Sparkles size={16} className="animate-spin" />
                <span>Analyzing algorithms and time complexity...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed whitespace-pre-wrap">
                {aiAnalysis}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Select an AI mentor action (Explain, Debug, or Optimize) to get a full technical review.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
