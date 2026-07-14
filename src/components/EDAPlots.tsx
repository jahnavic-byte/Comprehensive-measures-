import { useState, useMemo } from 'react';
import { LineChart, BarChart2, Info, Eye } from 'lucide-react';
import { CountryData } from '../types';

interface EDAPlotsProps {
  dataset: CountryData[];
}

// Simple helper to calculate Pearson Correlation Coefficient between two numeric arrays
function calculateCorrelation(arr1: number[], arr2: number[]): number {
  const n = arr1.length;
  if (n === 0) return 0;
  
  const mean1 = arr1.reduce((sum, val) => sum + val, 0) / n;
  const mean2 = arr2.reduce((sum, val) => sum + val, 0) / n;
  
  let num = 0;
  let den1 = 0;
  let den2 = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = arr1[i] - mean1;
    const diff2 = arr2[i] - mean2;
    num += diff1 * diff2;
    den1 += diff1 * diff1;
    den2 += diff2 * diff2;
  }
  
  if (den1 === 0 || den2 === 0) return 0;
  return num / Math.sqrt(den1 * den2);
}

// Convert value to beautiful viridis color scale (for scatter plot dots)
// Min GNI: $400, Max GNI: $110,000. Use logarithmic mapping for high contrast.
function getViridisColor(gni: number): string {
  const minLog = Math.log(400);
  const maxLog = Math.log(110000);
  const currentLog = Math.log(Math.max(400, gni));
  
  const fraction = Math.max(0, Math.min(1, (currentLog - minLog) / (maxLog - minLog)));
  
  // Viridis colors from purple to yellow:
  // fraction = 0 -> purple rgb(68, 1, 84)
  // fraction = 0.3 -> blue rgb(59, 82, 139)
  // fraction = 0.6 -> teal rgb(33, 144, 140)
  // fraction = 0.8 -> green rgb(94, 201, 98)
  // fraction = 1 -> yellow rgb(253, 231, 37)
  
  let r, g, b;
  if (fraction < 0.25) {
    const t = fraction / 0.25;
    r = Math.round(68 + t * (59 - 68));
    g = Math.round(1 + t * (82 - 1));
    b = Math.round(84 + t * (139 - 84));
  } else if (fraction < 0.5) {
    const t = (fraction - 0.25) / 0.25;
    r = Math.round(59 + t * (33 - 59));
    g = Math.round(82 + t * (144 - 82));
    b = Math.round(139 + t * (140 - 139));
  } else if (fraction < 0.75) {
    const t = (fraction - 0.5) / 0.25;
    r = Math.round(33 + t * (94 - 33));
    g = Math.round(144 + t * (201 - 144));
    b = Math.round(140 + t * (98 - 140));
  } else {
    const t = (fraction - 0.75) / 0.25;
    r = Math.round(94 + t * (253 - 94));
    g = Math.round(201 + t * (231 - 201));
    b = Math.round(98 + t * (37 - 98));
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}

export default function EDAPlots({ dataset }: EDAPlotsProps) {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'scatter'>('heatmap');
  const [hoveredPoint, setHoveredPoint] = useState<CountryData | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string; val: number } | null>(null);

  // Compute pearson correlation matrix dynamically based on current dataset (ignoring missing values)
  const correlationMatrix = useMemo(() => {
    // Filter rows where any of these are null
    const validRows = dataset.filter(
      item => item.Life_Expectancy !== null && 
              item.Mean_Years_Schooling !== null && 
              item.GNI_Per_Capita !== null
    );

    const lifeExps = validRows.map(r => r.Life_Expectancy!);
    const schoolings = validRows.map(r => r.Mean_Years_Schooling!);
    const gnis = validRows.map(r => Math.log(r.GNI_Per_Capita!)); // Log-GNI is standard for correlation
    const hdis = validRows.map(r => r.HDI_Score);

    const cols = ['Life Expectancy', 'Schooling Years', 'Log(GNI)', 'HDI Score'];
    const colArrays = [lifeExps, schoolings, gnis, hdis];

    const matrix: { [key: string]: { [key: string]: number } } = {};

    cols.forEach((col1, i) => {
      matrix[col1] = {};
      cols.forEach((col2, j) => {
        matrix[col1][col2] = calculateCorrelation(colArrays[i], colArrays[j]);
      });
    });

    return { matrix, cols };
  }, [dataset]);

  // Scatter plot points: Filter out nulls
  const scatterPoints = useMemo(() => {
    return dataset.filter(item => item.Life_Expectancy !== null && item.GNI_Per_Capita !== null);
  }, [dataset]);

  // Calculate simple linear regression line of scatterPoints: Life_Expectancy (x) vs HDI_Score (y)
  const regressionLine = useMemo(() => {
    const validPoints = scatterPoints;
    const N = validPoints.length;
    if (N === 0) return { slope: 0, intercept: 0, xMin: 50, xMax: 85 };

    const x = validPoints.map(p => p.Life_Expectancy!);
    const y = validPoints.map(p => p.HDI_Score);

    const sumX = x.reduce((s, v) => s + v, 0);
    const sumY = y.reduce((s, v) => s + v, 0);
    const sumXY = x.reduce((s, v, idx) => s + v * y[idx], 0);
    const sumX2 = x.reduce((s, v) => s + v * v, 0);

    const slope = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / N;

    const xMin = Math.min(...x);
    const xMax = Math.max(...x);

    return { slope, intercept, xMin, xMax };
  }, [scatterPoints]);

  // SVG parameters for Scatter Plot
  const width = 640;
  const height = 400;
  const padding = { top: 30, right: 110, bottom: 50, left: 60 };

  // Scale functions mapping data to SVG pixel values
  const getX = (lifeExp: number) => {
    const minX = 45;
    const maxX = 90;
    return padding.left + ((lifeExp - minX) / (maxX - minX)) * (width - padding.left - padding.right);
  };

  const getY = (hdi: number) => {
    const minY = 0.2;
    const maxY = 1.0;
    return height - padding.bottom - ((hdi - minY) / (maxY - minY)) * (height - padding.top - padding.bottom);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Visual Navigation Menu */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'heatmap' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Pearson Correlation Heatmap</span>
          </button>
          <button
            onClick={() => setActiveTab('scatter')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'scatter' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <LineChart className="w-4 h-4" />
            <span>Interactive Scatter & Trend</span>
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
          <Eye className="w-3.5 h-3.5" />
          <span>Interactive SVG Canvas</span>
        </div>
      </div>

      {/* Plot Displays */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {activeTab === 'heatmap' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Heatmap Matrix SVG */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="relative">
                <svg width="450" height="380" className="max-w-full h-auto select-none">
                  {/* Heatmap cells */}
                  {correlationMatrix.cols.map((rowLabel, i) => {
                    return correlationMatrix.cols.map((colLabel, j) => {
                      const corrValue = correlationMatrix.matrix[rowLabel][colLabel];
                      
                      // Map correlation coefficient (-1 to 1, but mostly 0 to 1 here) to a gorgeous coolwarm gradient
                      // Close to 1.0 is dark red, 0 is light grey/blue
                      let fillStyle = "rgb(243, 244, 246)"; // Fallback
                      const absVal = Math.abs(corrValue);
                      if (corrValue > 0) {
                        // Blend from white (0.0) to dark brick-red (1.0)
                        const r = Math.round(241 - absVal * (241 - 225));
                        const g = Math.round(245 - absVal * (245 - 29));
                        const b = Math.round(249 - absVal * (249 - 72));
                        fillStyle = `rgb(${r}, ${g}, ${b})`;
                      } else {
                        // Blend to blue
                        fillStyle = `rgb(224, 242, 254)`;
                      }

                      const cellSize = 75;
                      const startX = 130 + j * (cellSize + 4);
                      const startY = 40 + i * (cellSize + 4);

                      return (
                        <g 
                          key={`${i}-${j}`}
                          onMouseEnter={() => setHoveredCell({ row: rowLabel, col: colLabel, val: corrValue })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className="cursor-pointer transition-opacity hover:opacity-90"
                        >
                          <rect 
                            x={startX} 
                            y={startY} 
                            width={cellSize} 
                            height={cellSize} 
                            rx="8"
                            fill={fillStyle}
                            className="stroke-white stroke-[2px] transition-all"
                          />
                          <text 
                            x={startX + cellSize / 2} 
                            y={startY + cellSize / 2 + 4} 
                            textAnchor="middle" 
                            className="font-mono text-xs font-bold fill-slate-800"
                          >
                            {corrValue.toFixed(3)}
                          </text>
                        </g>
                      );
                    });
                  })}

                  {/* Y-axis Labels */}
                  {correlationMatrix.cols.map((col, i) => {
                    const cellSize = 75;
                    const startY = 40 + i * (cellSize + 4) + cellSize / 2 + 4;
                    return (
                      <text 
                        key={i} 
                        x="115" 
                        y={startY} 
                        textAnchor="end" 
                        className="font-sans text-[11px] font-bold fill-slate-500"
                      >
                        {col}
                      </text>
                    );
                  })}

                  {/* X-axis Labels */}
                  {correlationMatrix.cols.map((col, j) => {
                    const cellSize = 75;
                    const startX = 130 + j * (cellSize + 4) + cellSize / 2;
                    return (
                      <text 
                        key={j} 
                        x={startX} 
                        y="360" 
                        textAnchor="middle" 
                        className="font-sans text-[10px] font-bold fill-slate-500"
                      >
                        {col}
                      </text>
                    );
                  })}
                </svg>

                {/* Heatmap Tooltip overlay */}
                {hoveredCell && (
                  <div className="absolute top-2 left-32 bg-slate-800 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-xl max-w-xs leading-relaxed">
                    <strong>Pearson Coefficient:</strong><br/>
                    <span className="font-mono text-indigo-300 font-bold">{hoveredCell.row}</span> vs <span className="font-mono text-indigo-300 font-bold">{hoveredCell.col}</span> = <strong className="font-mono text-amber-300">{hoveredCell.val.toFixed(4)}</strong>
                    <div className="mt-1 text-[9px] text-slate-300">
                      {hoveredCell.val > 0.85 ? 'Outstanding positive alignment! Strong features.' : 'Strong socioeconomic correlation.'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Heatmap Explainer Column */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Info className="w-4 h-4" />
                <span>Interpreting the Matrix</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The heatmap visualizes the Pearson correlation coefficients between attributes. Positive coefficients (closer to 1.0) represent strong positive alignment, styled here with deep red fills.
              </p>
              <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-[#E11D48] mt-1 flex-shrink-0"></span>
                  <div>
                    <strong className="text-slate-800">Life Expectancy vs HDI Score (~0.91):</strong>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Highest direct correlation. Points to longevity as a core factor.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-[#3B82F6] mt-1 flex-shrink-0"></span>
                  <div>
                    <strong className="text-slate-800">Log(GNI) vs HDI Score (~0.88):</strong>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Strong logarithmic correlation. Shows high development has dimishing GNI returns.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'scatter' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Scatter Plot SVG */}
            <div className="lg:col-span-8 flex justify-center">
              <div className="relative">
                <svg width={width} height={height} className="max-w-full h-auto select-none border border-slate-100 bg-slate-50/20 rounded-xl">
                  
                  {/* Grid Lines */}
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const le = 45 + idx * 9;
                    const x = getX(le);
                    return (
                      <line 
                        key={`x-grid-${idx}`}
                        x1={x} y1={padding.top} x2={x} y2={height - padding.bottom}
                        className="stroke-slate-100 stroke-[1px] stroke-dasharray"
                      />
                    );
                  })}
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const hdi = 0.2 + idx * 0.2;
                    const y = getY(hdi);
                    return (
                      <line 
                        key={`y-grid-${idx}`}
                        x1={padding.left} y1={y} x2={width - padding.right} y2={y}
                        className="stroke-slate-100 stroke-[1px] stroke-dasharray"
                      />
                    );
                  })}

                  {/* Scatter Plot Points */}
                  {scatterPoints.map((point, index) => {
                    const x = getX(point.Life_Expectancy!);
                    const y = getY(point.HDI_Score);
                    const color = getViridisColor(point.GNI_Per_Capita!);
                    
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="5"
                        fill={color}
                        stroke="white"
                        strokeWidth="1"
                        className="transition-all hover:scale-150 cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}

                  {/* Fitted Regression line of best fit */}
                  {regressionLine && (
                    <line
                      x1={getX(regressionLine.xMin)}
                      y1={getY(regressionLine.slope * regressionLine.xMin + regressionLine.intercept)}
                      x2={getX(regressionLine.xMax)}
                      y2={getY(regressionLine.slope * regressionLine.xMax + regressionLine.intercept)}
                      className="stroke-rose-600 stroke-[2px]"
                      strokeDasharray="4,4"
                    />
                  )}

                  {/* X-axis */}
                  <line 
                    x1={padding.left} y1={height - padding.bottom} 
                    x2={width - padding.right} y2={height - padding.bottom} 
                    className="stroke-slate-300 stroke-[1.5px]"
                  />
                  {/* Y-axis */}
                  <line 
                    x1={padding.left} y1={padding.top} 
                    x2={padding.left} y2={height - padding.bottom} 
                    className="stroke-slate-300 stroke-[1.5px]"
                  />

                  {/* X-axis Labels */}
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const le = 45 + idx * 9;
                    const x = getX(le);
                    return (
                      <text 
                        key={`x-label-${idx}`}
                        x={x} 
                        y={height - padding.bottom + 18} 
                        textAnchor="middle" 
                        className="font-mono text-[9px] fill-slate-400 font-bold"
                      >
                        {le}
                      </text>
                    );
                  })}
                  <text 
                    x={(width - padding.right + padding.left) / 2} 
                    y={height - padding.bottom + 36} 
                    textAnchor="middle" 
                    className="font-sans text-xs font-bold fill-slate-500"
                  >
                    Life Expectancy at Birth (Years)
                  </text>

                  {/* Y-axis Labels */}
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const hdi = 0.2 + idx * 0.2;
                    const y = getY(hdi);
                    return (
                      <text 
                        key={`y-label-${idx}`}
                        x={padding.left - 10} 
                        y={y + 3} 
                        textAnchor="end" 
                        className="font-mono text-[9px] fill-slate-400 font-bold"
                      >
                        {hdi.toFixed(1)}
                      </text>
                    );
                  })}
                  <text 
                    transform={`rotate(-90, 20, ${(height - padding.top - padding.bottom) / 2 + padding.top})`}
                    x="20"
                    y={(height - padding.top - padding.bottom) / 2 + padding.top}
                    textAnchor="middle" 
                    className="font-sans text-xs font-bold fill-slate-500"
                  >
                    Human Development Index Score
                  </text>

                  {/* Viridis Color Bar Legend (Right Side) */}
                  <g transform={`translate(${width - padding.right + 25}, ${padding.top})`}>
                    <text x="0" y="-10" className="font-sans text-[9px] font-bold fill-slate-400 uppercase tracking-wide">GNI per Capita</text>
                    
                    {Array.from({ length: 10 }).map((_, idx) => {
                      // Map GNI gradient blocks from $400 to $110,000
                      const blockHeight = (height - padding.top - padding.bottom) / 10;
                      const gniVal = Math.exp(Math.log(400) + (idx / 9) * (Math.log(110000) - Math.log(400)));
                      const blockY = height - padding.bottom - padding.top - (idx + 1) * blockHeight;
                      
                      return (
                        <rect 
                          key={`legend-${idx}`}
                          x="0" 
                          y={blockY} 
                          width="14" 
                          height={blockHeight}
                          fill={getViridisColor(gniVal)}
                        />
                      );
                    })}

                    <text x="20" y="10" className="font-mono text-[8px] font-bold fill-slate-400">$110K</text>
                    <text x="20" y={(height - padding.top - padding.bottom) / 2} className="font-mono text-[8px] font-bold fill-slate-400">$18K</text>
                    <text x="20" y={height - padding.top - padding.bottom - 2} className="font-mono text-[8px] font-bold fill-slate-400">$400</text>
                  </g>
                </svg>

                {/* Point Hover Tooltip Overlay */}
                {hoveredPoint && (
                  <div 
                    className="absolute bg-slate-900 border border-slate-700 text-white rounded-xl shadow-xl p-3 text-[10px] leading-relaxed max-w-xs z-10 font-sans pointer-events-none"
                    style={{ 
                      left: `${Math.min(width - 200, getX(hoveredPoint.Life_Expectancy!) + 10)}px`, 
                      top: `${Math.min(height - 130, getY(pointToYVal(hoveredPoint)) - 10)}px` 
                    }}
                  >
                    <strong className="text-indigo-300 text-xs font-bold font-mono">{hoveredPoint.Country}</strong>
                    <div className="w-full h-px bg-slate-800 my-1.5"></div>
                    <div>Life Expectancy: <span className="font-mono font-bold text-slate-100">{hoveredPoint.Life_Expectancy?.toFixed(1)} yrs</span></div>
                    <div>Schooling Years: <span className="font-mono font-bold text-slate-100">{hoveredPoint.Mean_Years_Schooling?.toFixed(1)} yrs</span></div>
                    <div>GNI Per Capita: <span className="font-mono font-bold text-slate-100">${hoveredPoint.GNI_Per_Capita?.toLocaleString()} USD</span></div>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800 font-bold text-amber-400">HDI Score: <span className="font-mono">{hoveredPoint.HDI_Score.toFixed(3)}</span></div>
                  </div>
                )}
              </div>
            </div>

            {/* Scatter Plot Explainer */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <Info className="w-4 h-4" />
                <span>Interpreting the Scatter Plot</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This bivariate chart displays Life Expectancy against the target HDI score, styled dynamically using the standard Python viridis colormap based on individual Gross National Income levels.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                The red dashed line represents the simple linear regression formula trend: <br/>
                <code className="text-slate-800 font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-100 mt-2 block w-full text-center">
                  HDI = {regressionLine.slope.toFixed(4)} * Life_Expectancy + {regressionLine.intercept.toFixed(3)}
                </code>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

// Simple internal helper to access score safely
function pointToYVal(point: CountryData): number {
  return point.HDI_Score;
}
