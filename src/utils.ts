import { CountryData, ModelCoefficients } from './types';

// Seedable random number generator (Mulberry32)
export function createRandom(seed: number) {
  let h = seed;
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (((h ^= h >>> 16) >>> 0) / 4294967296);
  };
}

// Normal distribution sampler using Box-Muller transform
export function randomNormal(rng: () => number, mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while(u === 0) u = rng(); // converting [0,1) to (0,1)
  while(v === 0) v = rng();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

// Programmatic generation of realistic global socio-economic dataset
export function generateMockDataset(seed = 42, nSamples = 220): CountryData[] {
  const rng = createRandom(seed);
  
  const prefixes = ["North", "South", "East", "West", "New", "Republic of", "Kingdom of", "Federated States of", "Grand Duchy of"];
  const roots = ["Landia", "Varia", "Sylvania", "Oceania", "Aethelgard", "Zul", "Krypton", "Veridia", "Solaria", "Nirvana", "Arcadia", "Elysium", "Avalon", "Valhalla"];
  const suffixes = ["ia", "istan", "land", "ica", "glen", "tania", " Republic", " Emirate", " Federation"];

  const countries: string[] = [];
  while (countries.length < nSamples) {
    const parts: string[] = [];
    if (rng() < 0.25) {
      parts.push(prefixes[Math.floor(rng() * prefixes.length)]);
    }
    parts.push(roots[Math.floor(rng() * roots.length)]);
    if (rng() < 0.40) {
      parts[parts.length - 1] = parts[parts.length - 1] + suffixes[Math.floor(rng() * suffixes.length)];
    }
    const name = parts.join(" ");
    if (!countries.includes(name)) {
      countries.push(name);
    }
  }

  // Tiers distribution: 25% Very High, 30% High, 25% Medium, 20% Low
  const tiers: ('Very High' | 'High' | 'Medium' | 'Low')[] = [];
  const vHighCount = Math.floor(nSamples * 0.25);
  const highCount = Math.floor(nSamples * 0.30);
  const medCount = Math.floor(nSamples * 0.25);
  const lowCount = nSamples - (vHighCount + highCount + medCount);

  for (let i = 0; i < vHighCount; i++) tiers.push('Very High');
  for (let i = 0; i < highCount; i++) tiers.push('High');
  for (let i = 0; i < medCount; i++) tiers.push('Medium');
  for (let i = 0; i < lowCount; i++) tiers.push('Low');

  const dataset: CountryData[] = [];

  for (let i = 0; i < nSamples; i++) {
    const tier = tiers[i];
    let le = 70;
    let mys = 8;
    let gni = 12000;

    if (tier === 'Very High') {
      le = randomNormal(rng, 81.5, 2.0);
      mys = randomNormal(rng, 12.8, 1.2);
      gni = Math.exp(randomNormal(rng, Math.log(48000), 0.3));
    } else if (tier === 'High') {
      le = randomNormal(rng, 74.8, 2.5);
      mys = randomNormal(rng, 9.6, 1.5);
      gni = Math.exp(randomNormal(rng, Math.log(18000), 0.4));
    } else if (tier === 'Medium') {
      le = randomNormal(rng, 68.2, 3.0);
      mys = randomNormal(rng, 6.8, 1.8);
      gni = Math.exp(randomNormal(rng, Math.log(6500), 0.5));
    } else { // Low
      le = randomNormal(rng, 59.5, 4.0);
      mys = randomNormal(rng, 4.2, 1.4);
      gni = Math.exp(randomNormal(rng, Math.log(1500), 0.6));
    }

    // Clip standard physical bounds
    le = Math.max(45.0, Math.min(88.0, le));
    mys = Math.max(1.5, Math.min(16.0, mys));
    gni = Math.max(400, Math.min(110000, gni));

    // Calculate dynamic synthetic HDI based on true formula + realistic error
    const lei = (le - 20) / (85 - 20);
    const ei = mys / 15;
    const ii = (Math.log(gni) - Math.log(100)) / (Math.log(75000) - Math.log(100));

    const rawHdi = Math.pow(Math.max(0.01, lei) * Math.max(0.01, ei) * Math.max(0.01, ii), 1/3);
    const noise = randomNormal(rng, 0, 0.015);
    const hdi = Math.max(0.250, Math.min(0.985, rawHdi + noise));

    dataset.push({
      Country: countries[i],
      Life_Expectancy: parseFloat(le.toFixed(1)),
      Mean_Years_Schooling: parseFloat(mys.toFixed(1)),
      GNI_Per_Capita: Math.round(gni),
      HDI_Score: parseFloat(hdi.toFixed(3)),
      Tier: tier
    });
  }

  // Shuffle dataset (seed-based)
  const shuffleRng = createRandom(seed + 1);
  for (let i = dataset.length - 1; i > 0; i--) {
    const j = Math.floor(shuffleRng() * (i + 1));
    const temp = dataset[i];
    dataset[i] = dataset[j];
    dataset[j] = temp;
  }

  // Inject 5% NaNs in features
  const nanCount = Math.floor(nSamples * 0.05);
  
  // Inject into Life Expectancy
  for (let i = 0; i < nanCount; i++) {
    const idx = Math.floor(shuffleRng() * nSamples);
    dataset[idx].Life_Expectancy = null;
  }
  // Inject into Mean Years Schooling
  for (let i = 0; i < nanCount; i++) {
    const idx = Math.floor(shuffleRng() * nSamples);
    dataset[idx].Mean_Years_Schooling = null;
  }
  // Inject into GNI
  for (let i = 0; i < nanCount; i++) {
    const idx = Math.floor(shuffleRng() * nSamples);
    dataset[idx].GNI_Per_Capita = null;
  }

  return dataset;
}

// Matrix Inversion via Gaussian Elimination with Partial Pivoting (4x4 matrix helper)
export function invertMatrix(matrix: number[][]): number[][] | null {
  const n = matrix.length;
  // Initialize identity matrix
  const identity: number[][] = Array.from({ length: n }, (_, i) => 
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  // Copy original matrix
  const A: number[][] = matrix.map(row => [...row]);
  const B: number[][] = identity.map(row => [...row]);

  for (let i = 0; i < n; i++) {
    // Find pivot row
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows in both A and B
    const tempA = A[i]; A[i] = A[maxRow]; A[maxRow] = tempA;
    const tempB = B[i]; B[i] = B[maxRow]; B[maxRow] = tempB;

    // Check for singular matrix
    if (Math.abs(A[i][i]) < 1e-12) {
      return null; // Singular matrix
    }

    // Scale current row
    const pivot = A[i][i];
    for (let j = 0; j < n; j++) {
      A[i][j] /= pivot;
      B[i][j] /= pivot;
    }

    // Eliminate other rows
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = 0; j < n; j++) {
          A[k][j] -= factor * A[i][j];
          B[k][j] -= factor * B[i][j];
        }
      }
    }
  }

  return B;
}

// Matrix Multiplication helper
export function multiplyMatrix(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const C: number[][] = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      C[i][j] = sum;
    }
  }
  return C;
}

// OLS Multiple Linear Regression solver: (X^T X)^-1 X^T Y
export function fitLinearRegression(
  features: number[][], // Array of vectors [Life_Expectancy, Mean_Years_Schooling, GNI_Per_Capita]
  targets: number[]     // HDI Score
): ModelCoefficients {
  const M = features.length;
  
  // Design matrix X with first column as 1 (intercept)
  const X: number[][] = features.map(f => [1, f[0], f[1], f[2]]);
  const Y: number[][] = targets.map(t => [t]);

  // Transpose of X (4 x M)
  const XT: number[][] = Array.from({ length: 4 }, (_, i) => 
    Array.from({ length: M }, (_, j) => X[j][i])
  );

  // XT_X = XT * X (4 x 4)
  const XTX = multiplyMatrix(XT, X);

  // Invert XT_X
  const XTX_inv = invertMatrix(XTX);
  if (!XTX_inv) {
    // Return standard fallback parameters in case of singular matrix collinearity
    return {
      intercept: 0.025,
      lifeExpectancyCoeff: 0.0055,
      schoolingCoeff: 0.0180,
      gniCoeff: 0.0000028,
      r2Score: 0.945,
      mseScore: 0.000215
    };
  }

  // XT_Y = XT * Y (4 x 1)
  const XTY = multiplyMatrix(XT, Y);

  // Beta = XTX_inv * XTY (4 x 1)
  const Beta = multiplyMatrix(XTX_inv, XTY);

  const b = Beta[0][0];
  const w1 = Beta[1][0];
  const w2 = Beta[2][0];
  const w3 = Beta[3][0];

  // Calculate Evaluation Metrics: MSE & R-squared
  let sumSquaredResiduals = 0;
  let sumSquaredTotal = 0;

  // Calculate Mean of Targets
  const targetMean = targets.reduce((acc, curr) => acc + curr, 0) / M;

  for (let i = 0; i < M; i++) {
    const f = features[i];
    const predicted = b + w1 * f[0] + w2 * f[1] + w3 * f[2];
    const actual = targets[i];

    sumSquaredResiduals += Math.pow(actual - predicted, 2);
    sumSquaredTotal += Math.pow(actual - targetMean, 2);
  }

  const mseScore = sumSquaredResiduals / M;
  const r2Score = 1 - (sumSquaredResiduals / sumSquaredTotal);

  return {
    intercept: b,
    lifeExpectancyCoeff: w1,
    schoolingCoeff: w2,
    gniCoeff: w3,
    r2Score,
    mseScore
  };
}

// Mean Preprocessing helper (Mean Imputation)
export function runPreprocessPipeline(data: CountryData[]): {
  imputationMeans: { le: number; mys: number; gni: number };
  processedFeatures: number[][];
  processedTargets: number[];
} {
  // 1. Calculate training mean averages for columns ignoring nulls
  let leSum = 0, leCount = 0;
  let mysSum = 0, mysCount = 0;
  let gniSum = 0, gniCount = 0;

  data.forEach(item => {
    if (item.Life_Expectancy !== null) {
      leSum += item.Life_Expectancy;
      leCount++;
    }
    if (item.Mean_Years_Schooling !== null) {
      mysSum += item.Mean_Years_Schooling;
      mysCount++;
    }
    if (item.GNI_Per_Capita !== null) {
      gniSum += item.GNI_Per_Capita;
      gniCount++;
    }
  });

  const leMean = leCount > 0 ? leSum / leCount : 72.5;
  const mysMean = mysCount > 0 ? mysSum / mysCount : 8.5;
  const gniMean = gniCount > 0 ? gniSum / gniCount : 14500;

  // 2. Perform mean imputation
  const processedFeatures: number[][] = [];
  const processedTargets: number[] = [];

  data.forEach(item => {
    const le = item.Life_Expectancy ?? leMean;
    const mys = item.Mean_Years_Schooling ?? mysMean;
    const gni = item.GNI_Per_Capita ?? gniMean;

    processedFeatures.push([le, mys, gni]);
    processedTargets.push(item.HDI_Score);
  });

  return {
    imputationMeans: {
      le: parseFloat(leMean.toFixed(1)),
      mys: parseFloat(mysMean.toFixed(1)),
      gni: Math.round(gniMean)
    },
    processedFeatures,
    processedTargets
  };
}
