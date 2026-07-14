import { useState } from 'react';
import { Copy, Check, FileText, Terminal, Code2 } from 'lucide-react';
import { 
  SYSTEM_ARCHITECTURE_CODE, 
  REQUIREMENTS_CODE, 
  GENERATE_DATA_CODE, 
  TRAIN_MODEL_CODE, 
  EDA_CODE, 
  FLASK_APP_CODE, 
  TEMPLATE_HTML_CODE 
} from '../types';

interface Section {
  id: string;
  title: string;
  fileName: string;
  icon: any;
  code: string;
  language: string;
  desc: string;
}

export default function CodeViewer() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const sections: Section[] = [
    {
      id: 'section-1',
      title: 'SECTION 1: SYSTEM ARCHITECTURE & FILE STRUCTURE',
      fileName: 'Project Structure',
      icon: Code2,
      code: SYSTEM_ARCHITECTURE_CODE,
      language: 'text',
      desc: 'Standardized layout structure of the production-ready machine learning and Flask directory system.'
    },
    {
      id: 'section-2',
      title: 'SECTION 2: ENVIRONMENT & DEPENDENCIES',
      fileName: 'requirements.txt',
      icon: Terminal,
      code: REQUIREMENTS_CODE,
      language: 'text',
      desc: 'Pinned Python environment dependencies for fully deterministic model operations and web routing.'
    },
    {
      id: 'section-3',
      title: 'SECTION 3: MOCK DATA GENERATION SCRIPT',
      fileName: 'generate_data.py',
      icon: FileText,
      code: GENERATE_DATA_CODE,
      language: 'python',
      desc: 'Deterministic script programmatically assembling realistic country datasets with logical features, target bounds, and missing records.'
    },
    {
      id: 'section-4',
      title: 'SECTION 4: DATA SCIENCE & MODEL PIPELINE',
      fileName: 'train_model.py',
      icon: FileText,
      code: TRAIN_MODEL_CODE,
      language: 'python',
      desc: 'Full Scikit-Learn data science pipeline spanning ingestion, imputation, train-test splitting, regression fitting, scoring, and binary serialization.'
    },
    {
      id: 'section-5',
      title: 'SECTION 5: EXPLORATORY DATA ANALYSIS (EDA) SNIPPET',
      fileName: 'eda_analysis.py',
      icon: FileText,
      code: EDA_CODE,
      language: 'python',
      desc: 'Exploratory script evaluating Pearson correlation heatmaps and bivariate linear regression trend lines with Seaborn.'
    },
    {
      id: 'section-6',
      title: 'SECTION 6: FLASK WEB APPLICATION',
      fileName: 'app.py',
      icon: FileText,
      code: FLASK_APP_CODE,
      language: 'python',
      desc: 'Flask microserver that loads the trained predictor bundle, processes inputs, runs real-time inferences, and categorizes UNDP development bands.'
    },
    {
      id: 'section-7',
      title: 'SECTION 7: USER INTERFACE TEMPLATE',
      fileName: 'templates/index.html',
      icon: FileText,
      code: TEMPLATE_HTML_CODE,
      language: 'html',
      desc: 'Polished client interface styled with Tailwind CSS, supporting robust validation guards and asynchronous fetch integrations.'
    }
  ];

  const handleCopy = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedSection(id);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">Production-Ready Codebase & Specifications</h2>
        <p className="text-slate-500 mt-2 text-sm max-w-3xl">
          Review, copy, and implement the full end-to-end Python Scikit-Learn and Flask architecture. Use these exact production-grade modules to set up your local workspace environment.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {sections.map((sec) => {
          const IconComponent = sec.icon;
          return (
            <div key={sec.id} id={sec.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              
              {/* Header Box */}
              <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl mt-0.5">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-600 tracking-wide uppercase font-mono">{sec.title}</h3>
                    <p className="text-xs text-slate-500 font-mono font-medium mt-1">File Name: <span className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{sec.fileName}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {sec.id === 'section-2' && (
                    <div className="hidden md:flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-mono text-slate-500 font-semibold uppercase">
                      pip install -r requirements.txt
                    </div>
                  )}
                  <button
                    onClick={() => handleCopy(sec.code, sec.id)}
                    className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg shadow-sm hover:shadow active:scale-95 transition-all duration-150"
                  >
                    {copiedSection === sec.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Body Container */}
              <div className="p-6">
                <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/40 border border-indigo-100/50 p-3 rounded-xl mb-4 font-sans">
                  <strong className="text-indigo-800 font-medium">Integration Insight: </strong>{sec.desc}
                </p>

                {sec.id === 'section-2' && (
                  <div className="mb-4 bg-slate-900 text-slate-300 p-3.5 rounded-xl font-mono text-xs border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 select-none">$ </span>
                      <span>pip install -r requirements.txt</span>
                    </div>
                    <button 
                      onClick={() => handleCopy('pip install -r requirements.txt', 'terminal-cmd')}
                      className="text-slate-500 hover:text-white transition-colors"
                      title="Copy command"
                    >
                      {copiedSection === 'terminal-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                <div className="relative group">
                  <pre className="bg-slate-950 text-slate-200 p-5 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed max-h-[420px] select-text scrollbar-thin">
                    <code>{sec.code}</code>
                  </pre>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
