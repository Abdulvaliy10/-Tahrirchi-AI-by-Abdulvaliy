
import React, { useState, useMemo } from 'react';
import { GeminiService } from './geminiService.ts';
import { Language, Operation, GrammarResult, SimplifyResult, GrammarError } from './types.ts';
import { 
  Languages, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Download, 
  Loader2, 
  AlertCircle,
  RefreshCcw,
  Check,
  ChevronRight,
  Eraser
} from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<Language>('EN');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrammarResult | SimplifyResult | null>(null);
  const [currentOp, setCurrentOp] = useState<Operation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const gemini = useMemo(() => new GeminiService(), []);

  const handleAction = async (operation: Operation) => {
    if (!inputText.trim()) {
      setError("Please enter some text first.");
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentOp(operation);
    setResult(null);

    try {
      const data = await gemini.analyzeText(inputText, language, operation);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = result 
      ? ('correctedText' in result ? result.correctedText : result.simplifiedText)
      : '';
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const textToDownload = result 
      ? ('correctedText' in result ? result.correctedText : result.simplifiedText)
      : '';
    
    if (textToDownload) {
      const blob = new Blob([textToDownload], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolkit-result-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setInputText('');
    setResult(null);
    setError(null);
    setCurrentOp(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-200 mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Tahrirchi <span className="text-emerald-500">AI</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Perfect your writing and simplify complex ideas instantly. 
            Choose your language and let AI do the heavy lifting.
          </p>
        </header>

        {/* Input Card */}
        <div className="glass-morphism rounded-3xl shadow-xl overflow-hidden border border-white/50">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-slate-700">
                <Languages className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">Select Language:</span>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-white border-slate-200 text-slate-700 rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all outline-none border"
                >
                  <option value="EN">English</option>
                  <option value="UZ">Uzbek</option>
                  <option value="RU">Russian</option>
                </select>
              </div>
              
              <button 
                onClick={clearAll}
                className="flex items-center space-x-2 text-sm text-slate-500 hover:text-red-500 transition-colors"
              >
                <Eraser className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type your text here..."
                className="w-full min-h-[200px] p-4 text-lg text-slate-800 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-y"
              />
              <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-400">
                {inputText.length} characters
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleAction('grammar')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading && currentOp === 'grammar' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                <span>Check Grammar</span>
              </button>
              <button
                onClick={() => handleAction('simplify')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-6 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading && currentOp === 'simplify' ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                <span>Simplify Text</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Results Area */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <span>AI Result</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleCopy}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="prose prose-slate max-w-none">
                  <p className="text-xl leading-relaxed text-slate-800 font-medium">
                    {'correctedText' in result ? result.correctedText : result.simplifiedText}
                  </p>
                </div>
                
                {'summary' in result && (
                  <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-emerald-800 text-sm italic">
                      <strong>Summary:</strong> {result.summary}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Errors for Grammar */}
            {'errors' in result && result.errors.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                <h4 className="text-lg font-bold text-slate-800 px-2 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-emerald-500" />
                  <span>Suggested Improvements ({result.errors.length})</span>
                </h4>
                {result.errors.map((err, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-start gap-4 hover:border-emerald-200 transition-colors">
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                          {err.original}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                          {err.suggestion}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {err.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {'errors' in result && result.errors.length === 0 && (
              <div className="p-8 bg-green-50 border border-green-100 rounded-3xl text-center space-y-3">
                <div className="inline-flex items-center justify-center p-3 bg-green-500 rounded-full text-white mb-2">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-green-800">Perfect!</h4>
                <p className="text-green-700">No grammar or spelling errors were found in your text.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-20 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Tahrirchi AI by Abdulvaliy</p>
      </footer>
    </div>
  );
};

export default App;
