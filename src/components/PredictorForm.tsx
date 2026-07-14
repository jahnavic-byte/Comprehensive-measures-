import { useState } from 'react';
import { HelpCircle, ChevronRight, Terminal, Network, ShieldCheck } from 'lucide-react';
import { ModelCoefficients } from '../types';

interface PredictorFormProps {
  currentCoeffs: ModelCoefficients;
}

export default function PredictorForm({ currentCoeffs }: PredictorFormProps) {
  // Input form state variables
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(72.5);
  const [schoolingYears, setSchoolingYears] = useState<number>(8.5);
  const [gniPerCapita, setGniPerCapita] = useState<number>(14500);

  // Simulated API request states
  const [showApiSandbox, setShowApiSandbox] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);

  // Compute live mathematical linear regression model inference:
  // y = w1*x1 + w2*x2 + w3*x3 + intercept
  const rawPredictedHdi = 
    currentCoeffs.intercept + 
    currentCoeffs.lifeExpectancyCoeff * lifeExpectancy + 
    currentCoeffs.schoolingCoeff * schoolingYears + 
    currentCoeffs.gniCoeff * gniPerCapita;

  // Clip HDI within logical mathematical bounds [0.000, 1.000]
  const finalHdi = Math.max(0, Math.min(1, rawPredictedHdi));
  const roundedHdi = parseFloat(finalHdi.toFixed(3));

  // Determine development classification based on UNDP standards:
  // - Very High: >= 0.800
  // - High: 0.700 to 0.799
  // - Medium: 0.550 to 0.699
  // - Low: < 0.550
  let tier = "Low Human Development";
  let badgeStyle = "text-rose-700 bg-rose-50 border-rose-200";
  let cardStyle = "border-rose-100 bg-gradient-to-br from-white to-rose-50/20";
  let explanation = "Indicates critical structural gaps, severe constraints in educational access, and low domestic gross income resources.";
  let glowColor = "shadow-rose-100";

  if (roundedHdi >= 0.800) {
    tier = "Very High Human Development";
    badgeStyle = "text-emerald-700 bg-emerald-50 border-emerald-200";
    cardStyle = "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20";
    explanation = "Indicates outstanding access to longevity healthcare, rich educational resources, and very high standard-of-living financial income.";
    glowColor = "shadow-emerald-100";
  } else if (roundedHdi >= 0.700) {
    tier = "High Human Development";
    badgeStyle = "text-blue-700 bg-blue-50 border-blue-200";
    cardStyle = "border-blue-100 bg-gradient-to-br from-white to-blue-50/20";
    explanation = "Indicates strong educational structures, high life expectancy, and robust domestic financial productivity.";
    glowColor = "shadow-blue-100";
  } else if (roundedHdi >= 0.550) {
    tier = "Medium Human Development";
    badgeStyle = "text-amber-700 bg-amber-50 border-amber-200";
    cardStyle = "border-amber-100 bg-gradient-to-br from-white to-amber-50/20";
    explanation = "Indicates steady progression in social development programs with moderate economic capability.";
    glowColor = "shadow-amber-100";
  }

  // Handle post request simulation
  const triggerPostSimulation = () => {
    setIsPosting(true);
    setApiResponse(null);
    setTimeout(() => {
      setApiResponse({
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Server": "Werkzeug/3.0.2 Python/3.11.8",
          "Access-Control-Allow-Origin": "*"
        },
        payload: {
          success: true,
          prediction: {
            hdi_score: roundedHdi,
            tier: tier,
            color_hex: roundedHdi >= 0.800 ? "#10B981" : roundedHdi >= 0.700 ? "#3B82F6" : roundedHdi >= 0.550 ? "#F59E0B" : "#F43F5E",
            description: explanation,
            raw_inputs: {
              Life_Expectancy: lifeExpectancy,
              Mean_Years_Schooling: schoolingYears,
              GNI_Per_Capita: gniPerCapita
            }
          },
          latency_ms: 12
        }
      });
      setIsPosting(false);
    }, 450);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT: Parameters Form Form (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-sans">Socio-Economic Feature Vector</h3>
          <p className="text-xs text-slate-500 mt-2">
            Adjust the sliders or type values directly inside the vector panel to observe Scikit-Learn linear regression model predictions in real-time.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Feature 1: Life Expectancy */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label htmlFor="lifeExpForm" className="text-xs font-bold text-slate-700 uppercase tracking-wide font-sans">1. Life Expectancy at Birth (Years)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="100"
                  step="0.1"
                  value={lifeExpectancy}
                  onChange={(e) => setLifeExpectancy(Math.max(30, Math.min(100, parseFloat(e.target.value) || 30)))}
                  className="w-16 text-center text-xs font-mono font-bold text-slate-800 border border-slate-200 bg-slate-50 rounded px-1 py-0.5"
                />
                <span className="text-[10px] font-semibold text-slate-400">YRS</span>
              </div>
            </div>
            <input
              id="lifeExpForm"
              type="range"
              min="30.0"
              max="100.0"
              step="0.1"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
              <span>30.0 YRS</span>
              <span>72.5 YRS (Mid)</span>
              <span>100.0 YRS</span>
            </div>
          </div>

          {/* Feature 2: Schooling */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label htmlFor="schoolingForm" className="text-xs font-bold text-slate-700 uppercase tracking-wide font-sans">2. Mean Years of Schooling</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={schoolingYears}
                  onChange={(e) => setSchoolingYears(Math.max(0, Math.min(20, parseFloat(e.target.value) || 0)))}
                  className="w-16 text-center text-xs font-mono font-bold text-slate-800 border border-slate-200 bg-slate-50 rounded px-1 py-0.5"
                />
                <span className="text-[10px] font-semibold text-slate-400">YRS</span>
              </div>
            </div>
            <input
              id="schoolingForm"
              type="range"
              min="0.0"
              max="20.0"
              step="0.1"
              value={schoolingYears}
              onChange={(e) => setSchoolingYears(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
              <span>0.0 YRS</span>
              <span>10.0 YRS (Mid)</span>
              <span>20.0 YRS</span>
            </div>
          </div>

          {/* Feature 3: GNI */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label htmlFor="gniForm" className="text-xs font-bold text-slate-700 uppercase tracking-wide font-sans">3. Gross National Income Per Capita</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="100"
                  max="150000"
                  step="100"
                  value={gniPerCapita}
                  onChange={(e) => setGniPerCapita(Math.max(100, Math.min(150000, parseInt(e.target.value) || 100)))}
                  className="w-24 text-center text-xs font-mono font-bold text-slate-800 border border-slate-200 bg-slate-50 rounded px-1 py-0.5"
                />
                <span className="text-[10px] font-semibold text-slate-400">USD / YR</span>
              </div>
            </div>
            <input
              id="gniForm"
              type="range"
              min="100"
              max="150000"
              step="250"
              value={gniPerCapita}
              onChange={(e) => setGniPerCapita(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
              <span>$100 USD</span>
              <span>$75,000 (Mid)</span>
              <span>$150,000 USD</span>
            </div>
          </div>

        </div>

        {/* API Sandbox toggle */}
        <div className="border-t border-slate-100 mt-6 pt-4 flex items-center justify-between">
          <button
            onClick={() => setShowApiSandbox(!showApiSandbox)}
            className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer transition-colors"
          >
            <Terminal className="w-4 h-4" />
            <span>{showApiSandbox ? "Close API Sandbox Simulator" : "Simulate Flask API JSON POST"}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showApiSandbox ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Simulated API Console panel */}
        {showApiSandbox && (
          <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs flex flex-col gap-3 select-text">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
              <span>Flask API sandbox - app.py</span>
              <span className="text-indigo-400">JSON API Route</span>
            </div>

            <div className="flex flex-col gap-1.5 text-slate-300">
              <p>
                <span className="text-emerald-400 font-bold uppercase">POST</span> 
                <span className="text-slate-200 ml-2">/predict</span>
              </p>
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[11px] text-indigo-300 font-medium leading-relaxed">
                {`{
  "Life_Expectancy": ${lifeExpectancy.toFixed(1)},
  "Mean_Years_Schooling": ${schoolingYears.toFixed(1)},
  "GNI_Per_Capita": ${gniPerCapita}
}`}
              </div>
            </div>

            <button
              onClick={triggerPostSimulation}
              disabled={isPosting}
              className="self-start px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] tracking-wide active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1"
            >
              {isPosting ? 'Sending Payload...' : 'POST Simulated Request'}
            </button>

            {apiResponse && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Simulated HTTP Response</p>
                <pre className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-[11px] text-slate-300 leading-relaxed max-h-60 overflow-y-auto scrollbar-thin">
                  <code>{`HTTP/1.1 ${apiResponse.status} OK
Content-Type: ${apiResponse.headers['Content-Type']}
Server: ${apiResponse.headers['Server']}
Access-Control-Allow-Origin: ${apiResponse.headers['Access-Control-Allow-Origin']}

${JSON.stringify(apiResponse.payload, null, 2)}`}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Results Display Box (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Dynamic Display Card */}
        <div className={`p-8 rounded-2xl border ${cardStyle} shadow-lg ${glowColor} flex flex-col items-center text-center relative transition-all duration-300 min-h-[350px] justify-center`}>
          
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Live Predicted HDI Score</span>
          <div className="text-6xl font-bold font-mono tracking-tight text-slate-900 mt-2 mb-3.5 animate-pulse">
            {roundedHdi.toFixed(3)}
          </div>

          {/* Classification label */}
          <span className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide shadow-sm ${badgeStyle}`}>
            {tier}
          </span>

          <div className="w-full border-t border-slate-100/80 mt-6 pt-5">
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-sans">
              {explanation}
            </p>
          </div>

          {/* Formula tracker badge overlay */}
          <div className="absolute top-4 right-4 group cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
            <HelpCircle className="w-4 h-4" />
            {/* Tooltip */}
            <div className="absolute right-0 top-6 w-52 bg-slate-800 text-white text-[10px] leading-relaxed text-left p-3 rounded-xl shadow-xl hidden group-hover:block z-10">
              <strong>UN HDI Criteria Bounds:</strong><br/>
              â€¢ Very High: &ge; 0.800<br/>
              â€¢ High: 0.700 - 0.799<br/>
              â€¢ Medium: 0.550 - 0.699<br/>
              â€¢ Low: &lt; 0.550
            </div>
          </div>
        </div>

        {/* Active coefficients list */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-mono">
            <Network className="w-4 h-4 text-slate-400" />
            <span>Active Model Weights</span>
          </div>

          <div className="flex flex-col gap-3 font-mono text-[11px] text-slate-600">
            <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-500">Intercept (b):</span>
              <span className="font-bold text-slate-800">{currentCoeffs.intercept.toFixed(6)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-500">Beta_1 (Life_Exp):</span>
              <span className="font-bold text-slate-800">+{currentCoeffs.lifeExpectancyCoeff.toFixed(8)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-500">Beta_2 (Schooling):</span>
              <span className="font-bold text-slate-800">+{currentCoeffs.schoolingCoeff.toFixed(8)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-500">Beta_3 (GNI_Capita):</span>
              <span className="font-bold text-slate-800">+{currentCoeffs.gniCoeff.toFixed(8)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
