import { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  Database, 
  Settings, 
  LineChart, 
  Globe, 
  Award,
  ChevronRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ModelCoefficients, CountryData } from './types';
import { generateMockDataset } from './utils';
import CodeViewer from './components/CodeViewer';
import DatasetSimulator from './components/DatasetSimulator';
import TrainingSimulator from './components/TrainingSimulator';
import EDAPlots from './components/EDAPlots';
import PredictorForm from './components/PredictorForm';

export default function App() {
  const [activeTab, setActiveTab] = useState<'predictor' | 'dataset' | 'train' | 'eda' | 'code'>('predictor');
  
  // Seed state
  const [currentSeed, setCurrentSeed] = useState<number>(42);
  
  // Dataset state (loaded programmatically using the seedable Mulberry32 generator)
  const [dataset, setDataset] = useState<CountryData[]>(() => generateMockDataset(42, 220));

  // Model Coefficients State
  // Initialized to realistic socio-economic standard weights
  const [modelCoeffs, setModelCoeffs] = useState<ModelCoefficients>({
    intercept: 0.02451032,
    lifeExpectancyCoeff: 0.00548123,
    schoolingCoeff: 0.01795324,
    gniCoeff: 0.00000276,
    r2Score: 0.946351,
    mseScore: 0.0002148
  });

  const handleRegenerateDataset = (seed: number) => {
    setCurrentSeed(seed);
    const newDataset = generateMockDataset(seed, 220);
    setDataset(newDataset);
  };

  const handleModelTrained = (newCoeffs: ModelCoefficients) => {
    setModelCoeffs(newCoeffs);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm shadow-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 flex-shrink-0 animate-pulse">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Human Development Index (HDI) Predictor</h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 uppercase tracking-wide">
                  v1.4.0 Stable
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 font-mono">
                Multivariate OLS Regression Playground â€¢ Python/Flask & Scikit-Learn Pipeline Simulation
              </p>
            </div>
          </div>

          {/* Development Badge Indicator */}
          <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px]">Sandboxed API & Python Server Live</span>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Quick Introductory Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-950 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-15 transform translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2.5 max-w-2xl">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
                <span>Full-Stack Data Science Portfolio Spec</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                Explore End-to-End Predictor Machinery
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                This comprehensive development platform simulates a real-world Python Data Science pipeline. Adjust socio-economic indicators in the predictor, generate mock datasets, train machine learning regression equations, and copy production-ready code modules seamlessly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('code')}
                className="px-4.5 py-2.5 bg-white text-indigo-900 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-md cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-900" />
                <span>View Python Scripts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-1 md:gap-1.5">
          <button
            onClick={() => setActiveTab('predictor')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${activeTab === 'predictor' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Award className="w-4 h-4" />
            <span>HDI Predictor</span>
          </button>
          
          <div className="h-6 w-px bg-slate-200 my-auto hidden sm:block"></div>

          <button
            onClick={() => setActiveTab('dataset')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${activeTab === 'dataset' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Database className="w-4 h-4" />
            <span>Mock Dataset Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('train')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${activeTab === 'train' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Model Training Pipeline</span>
          </button>
          <button
            onClick={() => setActiveTab('eda')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${activeTab === 'eda' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LineChart className="w-4 h-4" />
            <span>Exploratory Data Analysis</span>
          </button>

          <div className="h-6 w-px bg-slate-200 my-auto hidden sm:block"></div>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ml-auto ${activeTab === 'code' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Terminal className="w-4 h-4" />
            <span>Codebase & Guide</span>
          </button>
        </div>

        {/* Tab Contents Panels */}
        <div className="flex-grow min-h-[500px]">
          {activeTab === 'predictor' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-2">Human Development Index Estimator Panel</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The Human Development Index (HDI) is an index published annually by the UN to measure socio-economic progress. It combines long-life expectancy, school education, and Gross National Income per capita. This interactive interface passes country parameters to the active regression model weights. 
                </p>
              </div>
              <PredictorForm currentCoeffs={modelCoeffs} />
            </div>
          )}

          {activeTab === 'dataset' && (
            <div className="animate-fadeIn">
              <DatasetSimulator 
                dataset={dataset} 
                onRegenerate={handleRegenerateDataset} 
                currentSeed={currentSeed} 
              />
            </div>
          )}

          {activeTab === 'train' && (
            <div className="animate-fadeIn">
              <TrainingSimulator 
                dataset={dataset} 
                onModelTrained={handleModelTrained} 
                currentCoeffs={modelCoeffs} 
              />
            </div>
          )}

          {activeTab === 'eda' && (
            <div className="animate-fadeIn">
              <EDAPlots dataset={dataset} />
            </div>
          )}

          {activeTab === 'code' && (
            <div className="animate-fadeIn">
              <CodeViewer />
            </div>
          )}
        </div>

      </main>

      {/* Page Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>&copy; 2026 UNDP Human Development Index Predictive Simulator Playground.</span>
          </div>
          <div className="flex gap-6 font-medium">
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">Scikit-Learn Regression Parameters</span>
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">Flask Server Blueprint</span>
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">API Integration Guides</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
