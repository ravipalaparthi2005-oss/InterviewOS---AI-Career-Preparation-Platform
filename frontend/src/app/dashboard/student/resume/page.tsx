'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_URL } from '../../../../components/Providers';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Sparkles, 
  FileText, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  BookOpen, 
  ChevronRight,
  TrendingUp,
  FileCheck,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';

// Set worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ResumePage() {
  const { token } = useAuth();
  
  const [filename, setFilename] = useState('My_Resume.pdf');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer');
  
  const [loading, setLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // PDF Upload states
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfSuccess, setPdfSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract text from PDF
  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  };

  // Handle file selection and processing
  const handlePdfUpload = async (file: File) => {
    // Reset states
    setPdfError(null);
    setPdfSuccess(null);

    // Validate file
    if (!file.type.includes('pdf')) {
      setPdfError('Please upload a valid PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPdfError('File size must be less than 10MB');
      return;
    }

    setPdfLoading(true);

    try {
      // Extract text from PDF
      const extractedText = await extractPdfText(file);

      if (!extractedText) {
        setPdfError('Could not extract text from PDF. The file might be image-based.');
        setPdfLoading(false);
        return;
      }

      // Update states
      setFilename(file.name);
      setResumeText(extractedText);
      setPdfSuccess(`Successfully extracted text from "${file.name}"`);

      // Clear success message after 3 seconds
      setTimeout(() => setPdfSuccess(null), 3000);
    } catch (error: any) {
      console.error('PDF extraction error:', error);
      setPdfError('Error processing PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handlePdfUpload(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      handlePdfUpload(files[0]);
    }
  };

  // Fetch history on load
  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/resumes/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.resumes || []);
        if (data.resumes && data.resumes.length > 0) {
          // Default to latest analysis
          setActiveAnalysis(data.resumes[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching resume history:', e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setLoading(true);
    try {
      // 1. Analyze and upload
      const uploadRes = await fetch(`${API_URL}/resumes/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename, content: resumeText })
      });

      if (!uploadRes.ok) throw new Error('Scan failed');
      const uploadData = await uploadRes.json();

      // 2. Perform Job Match comparison if job desc is provided
      if (jobDescription.trim()) {
        const matchRes = await fetch(`${API_URL}/resumes/match`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            resumeId: uploadData.resume.id,
            jobTitle,
            jobDescription
          })
        });

        if (matchRes.ok) {
          const matchData = await matchRes.json();
          // Mix match feedback into active view
          setActiveAnalysis({
            ...uploadData.resume,
            atsScore: matchData.jobMatch.matchScore,
            feedback: matchData.jobMatch.feedback
          });
        } else {
          setActiveAnalysis(uploadData.resume);
        }
      } else {
        setActiveAnalysis(uploadData.resume);
      }

      await fetchHistory();
    } catch (err) {
      console.error('Scanning failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPastScan = (pastResume: any) => {
    setActiveAnalysis(pastResume);
    setResumeText(pastResume.filename + " mock text...");
  };

  // Safe JSON feedback parsing
  const getFeedbackDetails = () => {
    if (!activeAnalysis) return null;
    if (typeof activeAnalysis.feedback === 'object') return activeAnalysis.feedback;
    try {
      return JSON.parse(activeAnalysis.feedback);
    } catch (e) {
      return null;
    }
  };

  const feedback = getFeedbackDetails();

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="font-outfit text-3xl font-extrabold text-white">ATS Resume Intelligence</h1>
        <p className="text-slate-400 text-sm mt-1">
          Scan files against job requirements to flag keyword gaps and generate high-impact summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Upload / Paste Input Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/40">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Scanner Dashboard</h3>
            <form onSubmit={handleScan} className="space-y-4">
              
              {/* PDF Upload Section */}
              <div className="space-y-3 pb-4 border-b border-white/10">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Upload Resume (PDF)</label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    dragActive
                      ? 'border-purple-500 bg-purple-500/5'
                      : 'border-white/10 bg-black hover:border-purple-500/50'
                  } ${pdfLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white">
                      {pdfLoading ? 'Processing PDF...' : 'Drag and drop your PDF here'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">or click to select</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={pdfLoading}
                />

                {/* Error Message */}
                {pdfError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{pdfError}</p>
                  </div>
                )}

                {/* Success Message */}
                {pdfSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-300">{pdfSuccess}</p>
                  </div>
                )}

                {/* Loading State */}
                {pdfLoading && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-400 flex-shrink-0 animate-spin" />
                    <p className="text-xs text-blue-300">Extracting text from PDF...</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">File Name</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full h-10 px-3 bg-black border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Paste Resume Text</label>
                <textarea
                  rows={8}
                  placeholder="Paste the plain text of your resume here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  required
                  className="w-full p-4 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Target Job Title (Optional)</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-black border border-white/10 rounded-lg text-xs text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Target Job Description (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Paste the target job description to match skills and keywords..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-4 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    AI Reviewing Stack...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Analyze & Match
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Scans History */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Scans History</h3>
            {history.length ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((hItem) => (
                  <button
                    key={hItem.id}
                    onClick={() => loadPastScan(hItem)}
                    className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      activeAnalysis?.id === hItem.id
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'bg-black border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs font-bold text-white max-w-[150px] truncate">{hItem.filename}</p>
                        <p className="text-[9px] text-slate-500">{new Date(hItem.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-400">{hItem.atsScore} Score</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No past scans available.</p>
            )}
          </div>
        </div>

        {/* Right Side: Analysis Display Screen */}
        <div className="lg:col-span-7">
          {activeAnalysis ? (
            <div className="space-y-6">
              
              {/* ATS Score Panel */}
              <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/20 to-slate-950/20 flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="transparent"/>
                    <circle cx="56" cy="56" r="48" stroke="#8b5cf6" strokeWidth="8" fill="transparent" strokeDasharray="301" strokeDashoffset={301 - (301 * activeAnalysis.atsScore) / 100}/>
                  </svg>
                  <span className="absolute font-outfit text-3xl font-extrabold text-white">{activeAnalysis.atsScore}%</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    ATS Score Matrix
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">Gemini Powered</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {feedback?.summary || 'The scan finished successfully. Review the structured suggestions below to lift your index score.'}
                  </p>
                </div>
              </div>

              {/* Skills and Keywords Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Detected Skills */}
                <div className="glass-panel p-6 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Detected Keywords ({activeAnalysis.skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeAnalysis.skills.map((s: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="glass-panel p-6 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-pink-400" />
                    Missing Keywords ({activeAnalysis.missingKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeAnalysis.missingKeywords.map((mk: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-1 rounded bg-pink-500/10 text-pink-300 font-medium border border-pink-500/20">
                        {mk}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Skill Gap Analysis Recommendations */}
              {feedback?.skillGaps && feedback.skillGaps.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-purple-400" />
                    Targeted Skill Gap Analysis
                  </h4>
                  <div className="space-y-4">
                    {feedback.skillGaps.map((gap: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-black border border-white/5 flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-white">{gap.skill}</h5>
                          <p className="text-[11px] text-slate-400 leading-snug">{gap.recommendation}</p>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider self-start ${
                          gap.status === 'missing' 
                            ? 'text-pink-400 bg-pink-500/10 border border-pink-500/20' 
                            : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        }`}>
                          {gap.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bullet Point Improvements */}
              {feedback?.improvements && feedback.improvements.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-blue-400" />
                    AI Action-Verb Enhancer
                  </h4>
                  <div className="space-y-4">
                    {feedback.improvements.map((imp: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-black border border-white/5 space-y-2">
                        <div className="text-xs">
                          <span className="text-[9px] font-bold text-pink-400 uppercase tracking-widest block mb-0.5">Original Draft</span>
                          <p className="text-slate-500 font-mono italic">"{imp.original}"</p>
                        </div>
                        <div className="text-xs pt-2 border-t border-white/5">
                          <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block mb-0.5">AI Enhanced Version</span>
                          <p className="text-purple-200 font-medium">"{imp.improved}"</p>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal pt-1">{imp.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel p-16 rounded-2xl border border-white/5 text-center flex flex-col justify-center items-center">
              <FileText className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-base font-bold text-white">No Scan Results Loaded</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                Paste your resume content in the left panel and click scan to generate full ATS scoring diagnostics.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
