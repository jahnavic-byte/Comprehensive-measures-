import { useState, useMemo } from 'react';
import { Database, Search, Filter, HelpCircle, RefreshCw } from 'lucide-react';
import { CountryData } from '../types';

interface DatasetSimulatorProps {
  dataset: CountryData[];
  onRegenerate: (seed: number) => void;
  currentSeed: number;
}

export default function DatasetSimulator({ dataset, onRegenerate, currentSeed }: DatasetSimulatorProps) {
  const [seed, setSeed] = useState(currentSeed);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleRegenerate = () => {
    onRegenerate(seed);
    setCurrentPage(1);
  };

  const handleRandomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000);
    setSeed(newSeed);
    onRegenerate(newSeed);
    setCurrentPage(1);
  };

  // Filter and search dataset
  const filteredDataset = useMemo(() => {
    return dataset.filter(item => {
      const matchesSearch = item.Country.toLowerCase().includes(search.toLowerCase());
      const matchesTier = tierFilter === 'All' || item.Tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [dataset, search, tierFilter]);

  // Paginated dataset
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredDataset.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredDataset, currentPage]);

  const totalPages = Math.ceil(filteredDataset.length / itemsPerPage);

  // Compute stats on actual (non-null) records
  const statistics = useMemo(() => {
    const metrics = {
      Life_Expectancy: { sum: 0, count: 0, min: Infinity, max: -Infinity, avg: 0, nulls: 0 },
      Mean_Years_Schooling: { sum: 0, count: 0, min: Infinity, max: -Infinity, avg: 0, nulls: 0 },
      GNI_Per_Capita: { sum: 0, count: 0, min: Infinity, max: -Infinity, avg: 0, nulls: 0 },
      HDI_Score: { sum: 0, count: 0, min: Infinity, max: -Infinity, avg: 0, nulls: 0 }
    };

    dataset.forEach(item => {
      // Life Expectancy
      if (item.Life_Expectancy !== null) {
        metrics.Life_Expectancy.sum += item.Life_Expectancy;
        metrics.Life_Expectancy.count++;
        metrics.Life_Expectancy.min = Math.min(metrics.Life_Expectancy.min, item.Life_Expectancy);
        metrics.Life_Expectancy.max = Math.max(metrics.Life_Expectancy.max, item.Life_Expectancy);
      } else {
        metrics.Life_Expectancy.nulls++;
      }

      // Schooling
      if (item.Mean_Years_Schooling !== null) {
        metrics.Mean_Years_Schooling.sum += item.Mean_Years_Schooling;
        metrics.Mean_Years_Schooling.count++;
        metrics.Mean_Years_Schooling.min = Math.min(metrics.Mean_Years_Schooling.min, item.Mean_Years_Schooling);
        metrics.Mean_Years_Schooling.max = Math.max(metrics.Mean_Years_Schooling.max, item.Mean_Years_Schooling);
      } else {
        metrics.Mean_Years_Schooling.nulls++;
      }

      // GNI
      if (item.GNI_Per_Capita !== null) {
        metrics.GNI_Per_Capita.sum += item.GNI_Per_Capita;
        metrics.GNI_Per_Capita.count++;
        metrics.GNI_Per_Capita.min = Math.min(metrics.GNI_Per_Capita.min, item.GNI_Per_Capita);
        metrics.GNI_Per_Capita.max = Math.max(metrics.GNI_Per_Capita.max, item.GNI_Per_Capita);
      } else {
        metrics.GNI_Per_Capita.nulls++;
      }

      // HDI Target Score
      metrics.HDI_Score.sum += item.HDI_Score;
      metrics.HDI_Score.count++;
      metrics.HDI_Score.min = Math.min(metrics.HDI_Score.min, item.HDI_Score);
      metrics.HDI_Score.max = Math.max(metrics.HDI_Score.max, item.HDI_Score);
    });

    metrics.Life_Expectancy.avg = metrics.Life_Expectancy.count > 0 ? metrics.Life_Expectancy.sum / metrics.Life_Expectancy.count : 0;
    metrics.Mean_Years_Schooling.avg = metrics.Mean_Years_Schooling.count > 0 ? metrics.Mean_Years_Schooling.sum / metrics.Mean_Years_Schooling.count : 0;
    metrics.GNI_Per_Capita.avg = metrics.GNI_Per_Capita.count > 0 ? metrics.GNI_Per_Capita.sum / metrics.GNI_Per_Capita.count : 0;
    metrics.HDI_Score.avg = metrics.HDI_Score.count > 0 ? metrics.HDI_Score.sum / metrics.HDI_Score.count : 0;

    return metrics;
  }, [dataset]);

  return (
    <div className="flex flex-col gap-8">
      
      {/* Simulation Controls Block */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 flex-shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight">Interactive Global Dataset Simulation</h2>
              <p className="text-slate-500 text-sm mt-1">
                Generates a realistic mock dataset containing {dataset.length} countries matching the <code className="text-indigo-600 font-semibold bg-indigo-50/50 px-1 rounded">generate_data.py</code> criteria, including 5% intentional missing values.
              </p>
            </div>
          </div>

          {/* Seed configuration controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-xl px-3 py-1.5">
              <label htmlFor="seedInput" className="text-xs font-semibold text-slate-500 font-mono">SEED:</label>
              <input
                id="seedInput"
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                className="w-16 text-xs text-center font-bold text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow active:scale-95 transition-all duration-150"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
            <button
              onClick={handleRandomizeSeed}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all duration-150"
            >
              Randomize Seed
            </button>
          </div>
        </div>

        {/* Pseudo-console simulation outputs */}
        <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            <span>Terminal Sandbox - mock dataset engine</span>
            <span className="text-emerald-400">SUCCESS</span>
          </div>
          <div className="flex flex-col gap-1 select-text">
            <p><span className="text-indigo-400">❯ python generate_data.py --samples={dataset.length} --seed={currentSeed}</span></p>
            <p className="text-slate-500">[*] Starting mock data generation for {dataset.length} countries...</p>
            <p className="text-slate-500">[*] Profile definitions loaded: [Very High: 25%, High: 30%, Medium: 25%, Low: 20%]</p>
            <p className="text-slate-500">[*] Injecting standard Box-Muller normal noises into features...</p>
            <p className="text-amber-500">[*] Injecting 5% missing values (NaNs) into features for pipeline preprocessing validation...</p>
            <p className="text-emerald-400">[+] Dataset successfully created and written to data/hdi_dataset.csv</p>
          </div>
        </div>
      </div>

      {/* Numerical Descriptive Statistics Matrix */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Statistical Feature Summary (describe)</h3>
          <div className="group relative cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-60 bg-slate-800 text-white text-[10px] p-2 rounded-lg hidden group-hover:block z-10 font-normal leading-relaxed">
              Descriptive stats of imputed data. Displays the logical profiles mimicking high-income and low-income country segments globally.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Life Expectancy Summary */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Life Expectancy</span>
            <div className="text-2xl font-bold font-sans text-slate-800 mt-1">{statistics.Life_Expectancy.avg.toFixed(1)} <span className="text-xs text-slate-500 font-normal">yrs (avg)</span></div>
            <div className="grid grid-cols-3 gap-1 mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-500">
              <div>MIN <span className="block font-bold text-slate-700 text-xs mt-0.5">{statistics.Life_Expectancy.min.toFixed(1)}</span></div>
              <div>MAX <span className="block font-bold text-slate-700 text-xs mt-0.5">{statistics.Life_Expectancy.max.toFixed(1)}</span></div>
              <div>NaNs <span className="block font-bold text-rose-600 text-xs mt-0.5">{statistics.Life_Expectancy.nulls}</span></div>
            </div>
          </div>

          {/* Schooling Summary */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Years of Schooling</span>
            <div className="text-2xl font-bold font-sans text-slate-800 mt-1">{statistics.Mean_Years_Schooling.avg.toFixed(1)} <span className="text-xs text-slate-500 font-normal">yrs (avg)</span></div>
            <div className="grid grid-cols-3 gap-1 mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-500">
              <div>MIN <span className="block font-bold text-slate-700 text-xs mt-0.5">{statistics.Mean_Years_Schooling.min.toFixed(1)}</span></div>
              <div>MAX <span className="block font-bold text-slate-700 text-xs mt-0.5">{statistics.Mean_Years_Schooling.max.toFixed(1)}</span></div>
              <div>NaNs <span className="block font-bold text-rose-600 text-xs mt-0.5">{statistics.Mean_Years_Schooling.nulls}</span></div>
            </div>
          </div>

          {/* GNI Summary */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GNI Per Capita</span>
            <div className="text-2xl font-bold font-sans text-slate-800 mt-1">${Math.round(statistics.GNI_Per_Capita.avg).toLocaleString()} <span className="text-xs text-slate-500 font-normal">USD</span></div>
            <div className="grid grid-cols-3 gap-1 mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-500">
              <div>MIN <span className="block font-bold text-slate-700 text-xs mt-0.5">${Math.round(statistics.GNI_Per_Capita.min).toLocaleString()}</span></div>
              <div>MAX <span className="block font-bold text-slate-700 text-xs mt-0.5">${Math.round(statistics.GNI_Per_Capita.max).toLocaleString()}</span></div>
              <div>NaNs <span className="block font-bold text-rose-600 text-xs mt-0.5">{statistics.GNI_Per_Capita.nulls}</span></div>
            </div>
          </div>

          {/* HDI Target Summary */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target: HDI Score</span>
            <div className="text-2xl font-bold font-sans text-slate-800 mt-1">{statistics.HDI_Score.avg.toFixed(3)} <span className="text-xs text-slate-500 font-normal">score</span></div>
            <div className="grid grid-cols-3 gap-1 mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-500">
              <div>MIN <span className="block font-bold text-slate-700 text-xs mt-0.5">{statistics.HDI_Score.min.toFixed(3)}</span></div>
              <div>MAX <span className="block font-bold text-slate-700 text-xs mt-0.5">{statistics.HDI_Score.max.toFixed(3)}</span></div>
              <div>NaNs <span className="block font-bold text-slate-700 text-xs mt-0.5">0</span></div>
            </div>
          </div>

        </div>
      </div>

      {/* Dataset Exploratory Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Filters Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-wider uppercase font-mono">CSV Data Viewer</span>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">
              {filteredDataset.length} Countries
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Country Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search Country..."
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs transition-all w-48"
              />
            </div>

            {/* Development Tier Filters */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={tierFilter}
                onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
                className="text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-slate-600 font-semibold cursor-pointer"
              >
                <option value="All">All Tiers</option>
                <option value="Very High">Very High</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real HTML Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-6">Country Name</th>
                <th className="py-3 px-6 text-center">Life Expectancy (yrs)</th>
                <th className="py-3 px-6 text-center">Schooling Years</th>
                <th className="py-3 px-6 text-right">GNI Per Capita ($)</th>
                <th className="py-3 px-6 text-right">HDI Target Score</th>
                <th className="py-3 px-6 text-center">Development Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  let tierColor = "text-slate-600 bg-slate-50 border-slate-100";
                  if (item.Tier === 'Very High') tierColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
                  else if (item.Tier === 'High') tierColor = "text-blue-700 bg-blue-50 border-blue-100";
                  else if (item.Tier === 'Medium') tierColor = "text-amber-700 bg-amber-50 border-amber-100";
                  else if (item.Tier === 'Low') tierColor = "text-rose-700 bg-rose-50 border-rose-100";

                  return (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-800 font-sans">{item.Country}</td>
                      <td className="py-3.5 px-6 text-center font-mono">
                        {item.Life_Expectancy !== null ? (
                          <span className="text-slate-700 font-medium">{item.Life_Expectancy.toFixed(1)}</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 rounded text-[10px] font-bold animate-pulse">NaN (Null)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono">
                        {item.Mean_Years_Schooling !== null ? (
                          <span className="text-slate-700 font-medium">{item.Mean_Years_Schooling.toFixed(1)}</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 rounded text-[10px] font-bold animate-pulse">NaN (Null)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono">
                        {item.GNI_Per_Capita !== null ? (
                          <span className="text-slate-700 font-semibold">${item.GNI_Per_Capita.toLocaleString()}</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 rounded text-[10px] font-bold animate-pulse">NaN (Null)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900 text-sm">
                        {item.HDI_Score.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${tierColor}`}>
                          {item.Tier}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No country matches search parameters. Modify search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all duration-150"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all duration-150"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
