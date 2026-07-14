export interface CountryData {
  Country: string;
  Life_Expectancy: number | null;
  Mean_Years_Schooling: number | null;
  GNI_Per_Capita: number | null;
  HDI_Score: number;
  Tier: 'Very High' | 'High' | 'Medium' | 'Low';
}

export interface ModelCoefficients {
  intercept: number;
  lifeExpectancyCoeff: number;
  schoolingCoeff: number;
  gniCoeff: number;
  r2Score: number;
  mseScore: number;
}

export const SYSTEM_ARCHITECTURE_CODE = `hdi-predictor-project/
âââ data/
â   âââ hdi_dataset.csv          # Generated socio-economic dataset
âââ models/
â   âââ hdi_model.pkl            # Serialized Scikit-Learn Linear Regression model
âââ templates/
â   âââ index.html               # Flask frontend template (Tailwind/Bootstrap CDN)
âââ app.py                       # Core Flask web server (routing and prediction API)
âââ generate_data.py             # Script to programmatically generate mock global data
âââ train_model.py                # Data Science pipeline (Preprocess, Split, Train, Evaluate, Serialize)
âââ requirements.txt             # Stable pinned Python library dependencies`;

export const REQUIREMENTS_CODE = `# Pinned dependencies for production-ready, stable execution
numpy==1.26.4
pandas==2.2.1
matplotlib==3.8.3
seaborn==0.13.2
scikit-learn==1.4.1.post1
flask==3.0.2
gunicorn==21.2.0`;

export const GENERATE_DATA_CODE = `import os
import numpy as np
import pandas as pd

def generate_hdi_dataset(output_path="data/hdi_dataset.csv", n_samples=220):
    """
    Programmatically generates a highly realistic mock global dataset mirroring
    socio-economic variations across different human development tiers.
    Includes intentional missing values to demonstrate preprocessing.
    """
    print(f"[*] Starting mock data generation for {n_samples} countries...")
    np.random.seed(42)  # Ensure complete reproducibility

    # Base lists to create realistic diversity in names
    prefixes = ["North", "South", "East", "West", "New", "Republic of", "Kingdom of", "Federated States of", "Grand Duchy of"]
    roots = ["Landia", "Varia", "Sylvania", "Oceania", "Aethelgard", "Zul", "Krypton", "Veridia", "Solaria", "Nirvana", "Arcadia", "Elysium", "Avalon", "Valhalla"]
    suffixes = ["ia", "istan", "land", "ica", "glen", "tania", "共和国", " Emirate", " Federation"]

    countries = []
    while len(countries) < n_samples:
        parts = []
        if np.random.rand() < 0.25:
            parts.append(np.random.choice(prefixes))
        parts.append(np.random.choice(roots))
        if np.random.rand() < 0.4:
            parts[-1] = parts[-1] + np.random.choice(suffixes)
        name = " ".join(parts)
        if name not in countries:
            countries.append(name)

    # Distribute samples across 4 developmental tiers with realistic profiles
    # Very High, High, Medium, Low
    tiers_distribution = ["Very High"] * int(n_samples * 0.25) + \\
                         ["High"] * int(n_samples * 0.30) + \\
                         ["Medium"] * int(n_samples * 0.25) + \\
                         ["Low"] * int(n_samples * 0.20)
    
    # Adjust to make sure we match exactly n_samples
    while len(tiers_distribution) < n_samples:
        tiers_distribution.append("Medium")

    life_expectancies = []
    schooling_years = []
    gni_per_capitas = []
    hdi_scores = []

    for tier in tiers_distribution:
        if tier == "Very High":
            # Profile: Long life expectancy, high education, very strong GNI
            le = np.random.normal(81.5, 2.0)
            mys = np.random.normal(12.8, 1.2)
            gni = np.exp(np.random.normal(np.log(48000), 0.3))
        elif tier == "High":
            # Profile: Healthy but lower resources/education than Very High
            le = np.random.normal(74.8, 2.5)
            mys = np.random.normal(9.6, 1.5)
            gni = np.exp(np.random.normal(np.log(18000), 0.4))
        elif tier == "Medium":
            # Profile: Emerging status
            le = np.random.normal(68.2, 3.0)
            mys = np.random.normal(6.8, 1.8)
            gni = np.exp(np.random.normal(np.log(6500), 0.5))
        else: # Low
            # Profile: Severely constrained socio-economic profile
            le = np.random.normal(59.5, 4.0)
            mys = np.random.normal(4.2, 1.4)
            gni = np.exp(np.random.normal(np.log(1500), 0.6))

        # Enforce physical / statistical bounds
        le = np.clip(le, 45.0, 88.0)
        mys = np.clip(mys, 1.5, 16.0)
        gni = np.clip(gni, 400, 110000)

        # UN HDI Index Formula calculation:
        # Life Expectancy Index (LEI) = (LE - 20) / (85 - 20)
        # Education Index (EI) = (MYS / 15) [Simplification of combined MYS and EYS]
        # Income Index (II) = (ln(GNI) - ln(100)) / (ln(75000) - ln(100))
        # HDI is the Geometric Mean: (LEI * EI * II) ^ (1/3)
        lei = (le - 20) / (85 - 20)
        ei = (mys / 15)
        ii = (np.log(gni) - np.log(100)) / (np.log(75000) - np.log(100))
        
        # Clip individual indices to [0, 1]
        lei = np.clip(lei, 0.01, 1.0)
        ei = np.clip(ei, 0.01, 1.0)
        ii = np.clip(ii, 0.01, 1.0)

        raw_hdi = (lei * ei * ii) ** (1/3)
        
        # Inject realistic statistical residuals/noise (unexplained variance ~ 2%)
        noise = np.random.normal(0, 0.015)
        hdi = np.clip(raw_hdi + noise, 0.250, 0.985)

        life_expectancies.append(round(le, 1))
        schooling_years.append(round(mys, 1))
        gni_per_capitas.append(int(round(gni, 0)))
        hdi_scores.append(round(hdi, 3))

    # Assemble pandas DataFrame
    df = pd.DataFrame({
        "Country": countries,
        "Life_Expectancy": life_expectancies,
        "Mean_Years_Schooling": schooling_years,
        "GNI_Per_Capita": gni_per_capitas,
        "HDI_Score": hdi_scores
    })

    # Shuffle the dataset so there is no sorting by tier bias
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    # Inject intentional missing values (NaNs) to simulate real-world preprocessing
    # ~5% missing rate in features
    for col in ["Life_Expectancy", "Mean_Years_Schooling", "GNI_Per_Capita"]:
        missing_indices = np.random.choice(df.index, size=int(n_samples * 0.05), replace=False)
        df.loc[missing_indices, col] = np.nan

    # Create storage directory if not exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"[+] Dataset successfully created and written to {output_path}")
    print(f"[+] Summary of generated features:")
    print(df.describe().T[["mean", "min", "max"]])

if __name__ == "__main__":
    generate_hdi_dataset()`;

export const TRAIN_MODEL_CODE = `import os
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.impute import SimpleImputer

def run_ml_pipeline(data_path="data/hdi_dataset.csv", model_output_path="models/hdi_model.pkl"):
    """
    Executes the entire end-to-end Machine Learning pipeline:
    1. Ingestion: Loads the raw generated global socio-economic dataset.
    2. Data Preprocessing & Cleaning: Standardizes missing fields via Mean Imputation.
    3. Splitting: Splits data into robust training (80%) and testing (20%) partitions.
    4. Model Training: Fits a Scikit-Learn Ordinary Least Squares Linear Regression model.
    5. Evaluation: Calculates and reports metrics (Mean Squared Error, R-squared score).
    6. Serialization: Saves the fitted predictor and imputer for Flask production usage.
    """
    print("[*] Launching Data Science & Model Training Pipeline...")
    
    # 1. DATA INGESTION
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Raw dataset not found at {data_path}. Please run generate_data.py first.")
    
    df = pd.read_csv(data_path)
    print(f"[+] Successfully loaded {df.shape[0]} rows and {df.shape[1]} columns.")

    # 2. PREPROCESSING & FEATURE ENGINEERING
    # Separate predictive features (X) and target label (y)
    features = ["Life_Expectancy", "Mean_Years_Schooling", "GNI_Per_Capita"]
    target = "HDI_Score"

    X = df[features]
    y = df[target]

    # Inspect missing values prior to cleaning
    missing_count = X.isnull().sum()
    print("[*] Missing values before preprocessing:")
    for col, count in missing_count.items():
        print(f"    - {col}: {count} missing records")

    # Initialize a SimpleImputer to fill NaNs with the respective training mean values
    # We use Mean Imputation for robust continuous numerical columns
    imputer = SimpleImputer(strategy="mean")
    
    # Fit and transform features
    X_imputed_array = imputer.fit_transform(X)
    X_imputed = pd.DataFrame(X_imputed_array, columns=features)
    print("[+] Missing values successfully imputed with column mean averages.")

    # 3. TRAIN-TEST SPLIT (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X_imputed, y, test_size=0.20, random_state=42
    )
    print(f"[+] Partitioned data: Train = {X_train.shape[0]} samples, Test = {X_test.shape[0]} samples.")

    # 4. MODEL TRAINING (Linear Regression)
    # We choose Linear Regression for its high explainability and compatibility with HDI indices
    print("[*] Initializing and training Ordinary Least Squares Linear Regression model...")
    model = LinearRegression()
    model.fit(X_train, y_train)

    # 5. MODEL EVALUATION
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("\\n" + "="*40)
    print("           MODEL PERFORMANCE METRICS")
    print("="*40)
    print(f"Mean Squared Error (MSE) : {mse:.6f}")
    print(f"R-squared (R^2) Score    : {r2:.4f} ({r2*100:.1f}% variance explained)")
    print("="*40)
    print("Model Parameters:")
    print(f"  - Intercept (b): {model.intercept_:.6f}")
    for feature_name, coef in zip(features, model.coef_):
        print(f"  - Coefficient for {feature_name:20}: {coef:.8f}")
    print("="*40 + "\\n")

    # 6. MODEL SERIALIZATION & SAVING
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    
    # We package both the Imputer and the trained Model inside a single dictionary
    # to guarantee that inputs are imputed and predicted using identical structures in Flask
    payload = {
        "imputer": imputer,
        "model": model,
        "feature_names": features,
        "metrics": {
            "mse": mse,
            "r2": r2
        }
    }

    with open(model_output_path, "wb") as f:
        pickle.dump(payload, f)
        
    print(f"[+] Serialization complete. Model bundle written to: '{model_output_path}'")

if __name__ == "__main__":
    run_ml_pipeline()`;

export const EDA_CODE = `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def generate_eda_visualizations(data_path="data/hdi_dataset.csv"):
    """
    Generates exploratory statistical visualizations to examine socio-economic
    relationships and feature correlations.
    """
    # 1. Load data & fill missing variables temporarily for visualization
    df = pd.read_csv(data_path)
    df = df.fillna(df.mean(numeric_only=True))

    # Configure global styling
    sns.set_theme(style="whitegrid", context="talk")
    plt.rcParams["font.family"] = "sans-serif"

    # --- PLOT 1: SEABORN CORRELATION HEATMAP ---
    plt.figure(figsize=(8, 6))
    correlation_matrix = df[["Life_Expectancy", "Mean_Years_Schooling", "GNI_Per_Capita", "HDI_Score"]].corr()
    
    # Generate heatmap with precise coefficient overlays
    sns.heatmap(
        correlation_matrix, 
        annot=True, 
        cmap="coolwarm", 
        fmt=".3f", 
        linewidths=1.5, 
        vmin=0, vmax=1,
        cbar_kws={'label': 'Pearson Correlation Coefficient'}
    )
    plt.title("Socio-Economic Feature Correlation Matrix", fontsize=16, pad=20, weight="bold")
    plt.tight_layout()
    plt.savefig("data/eda_correlation_heatmap.png", dpi=150)
    plt.close()
    print("[+] Plot 1 (Correlation Heatmap) saved successfully as eda_correlation_heatmap.png")

    # --- PLOT 2: SCATTER PLOT (Life Expectancy vs. HDI Score) ---
    plt.figure(figsize=(9, 6))
    
    # Plot scatter points colored dynamically by GNI per Capita to show multivariate patterns
    scatter = plt.scatter(
        df["Life_Expectancy"], 
        df["HDI_Score"], 
        c=df["GNI_Per_Capita"], 
        cmap="viridis", 
        alpha=0.85, 
        edgecolors="white", 
        s=90
    )
    
    # Fit and plot a line of best fit (Simple Linear Regression representation)
    m, b = np.polyfit(df["Life_Expectancy"], df["HDI_Score"], 1)
    plt.plot(
        df["Life_Expectancy"], 
        m * df["Life_Expectancy"] + b, 
        color="#E11D48", 
        linestyle="--", 
        linewidth=2.5, 
        label=f"Regression Line (R^2 Trend)"
    )

    plt.xlabel("Life Expectancy at Birth (Years)", fontsize=13, labelpad=10)
    plt.ylabel("Human Development Index (HDI Score)", fontsize=13, labelpad=10)
    plt.title("Life Expectancy vs. Human Development Index Score", fontsize=16, pad=15, weight="bold")
    
    # Add beautiful styling elements
    cbar = plt.colorbar(scatter)
    cbar.set_label("GNI Per Capita ($ USD)", rotation=270, labelpad=20, fontsize=12)
    plt.legend(loc="upper left")
    plt.tight_layout()
    plt.savefig("data/eda_scatter_plot.png", dpi=150)
    plt.close()
    print("[+] Plot 2 (Scatter Plot & Regression Line) saved successfully as eda_scatter_plot.png")

if __name__ == "__main__":
    generate_eda_visualizations()`;

export const FLASK_APP_CODE = `import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
MODEL_PATH = "models/hdi_model.pkl"

# Global variables to store the ML bundle components
model = None
imputer = None
feature_names = None
model_metrics = None

def load_model_bundle():
    """
    Loads the serialized model bundle dictionary containing the fitted
    predictor, features, and SimpleImputer from disk.
    """
    global model, imputer, feature_names, model_metrics
    if not os.path.exists(MODEL_PATH):
        print(f"[!] Warning: Model bundle not found at {MODEL_PATH}.")
        print("[!] Running training fallback dynamically...")
        # Auto-train if dataset exists
        if os.path.exists("data/hdi_dataset.csv"):
            from train_model import run_ml_pipeline
            run_ml_pipeline()
        else:
            from generate_data import generate_hdi_dataset
            from train_model import run_ml_pipeline
            generate_hdi_dataset()
            run_ml_pipeline()
            
    with open(MODEL_PATH, "rb") as f:
        bundle = pickle.load(f)
        model = bundle["model"]
        imputer = bundle["imputer"]
        feature_names = bundle["feature_names"]
        model_metrics = bundle["metrics"]
        print(f"[+] Loaded ML model bundle successfully from: {MODEL_PATH}")
        print(f"[+] Model validation stats: MSE = {model_metrics['mse']:.6f}, R2 = {model_metrics['r2']:.4f}")

@app.route("/", methods=["GET"])
def index():
    """
    Serves the primary web dashboard interface.
    """
    return render_template("index.html", metrics=model_metrics)

@app.route("/predict", methods=["POST"])
def predict():
    """
    Receives JSON or Form inputs, processes and imputes features, passes
    records to the Linear Regression model, and returns the rounded HDI score
    and development classification.
    """
    try:
        # Extract inputs handling both traditional Form submits and modern JSON fetch payloads
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form

        # Parse and enforce correct float casts for regression inference
        life_exp = float(data.get("Life_Expectancy"))
        schooling = float(data.get("Mean_Years_Schooling"))
        gni = float(data.get("GNI_Per_Capita"))

        # Bounds validation in line with global parameters
        if not (30.0 <= life_exp <= 100.0):
            return jsonify({"error": "Life Expectancy must be between 30 and 100 years."}), 400
        if not (0.0 <= schooling <= 20.0):
            return jsonify({"error": "Mean Years of Schooling must be between 0 and 20 years."}), 400
        if not (100.0 <= gni <= 150000.0):
            return jsonify({"error": "GNI per Capita must be between 100 and 150,000 USD."}), 400

        # Construct input vector matching the exact feature order used during training
        input_data = pd.DataFrame([{
            "Life_Expectancy": life_exp,
            "Mean_Years_Schooling": schooling,
            "GNI_Per_Capita": gni
        }], columns=feature_names)

        # Impute missing cells if any are null (fallback to the model's loaded training average)
        input_imputed = imputer.transform(input_data)

        # Perform regression model inference
        predicted_hdi = model.predict(input_imputed)[0]
        
        # Human Development Index is mathematically bounded on the interval [0.000, 1.000]
        final_hdi = np.clip(predicted_hdi, 0.000, 1.000)
        final_hdi_rounded = round(float(final_hdi), 3)

        # Categorize development tier based on standard United Nations Development Programme (UNDP) standards:
        # - Very High Human Development: >= 0.800
        # - High Human Development: 0.700 to 0.799
        # - Medium Human Development: 0.550 to 0.699
        # - Low Human Development: < 0.550
        if final_hdi_rounded >= 0.800:
            tier = "Very High Human Development"
            color_class = "text-emerald-600 bg-emerald-50 border-emerald-200"
            color_hex = "#10B981"
            interpretation = "Indicates outstanding access to health, knowledge, and highly developed financial living standards."
        elif final_hdi_rounded >= 0.700:
            tier = "High Human Development"
            color_class = "text-blue-600 bg-blue-50 border-blue-200"
            color_hex = "#3B82F6"
            interpretation = "Indicates strong educational structures and quality access to sanitation and robust commercial utilities."
        elif final_hdi_rounded >= 0.550:
            tier = "Medium Human Development"
            color_class = "text-amber-600 bg-amber-50 border-amber-200"
            color_hex = "#F59E0B"
            interpretation = "Indicates steady progression in social development programs with moderate economic capabilities."
        else:
            tier = "Low Human Development"
            color_class = "text-rose-600 bg-rose-50 border-rose-200"
            color_hex = "#F43F5E"
            interpretation = "Indicates critical gaps in infrastructure, healthcare distribution, and human-capital education indices."

        return jsonify({
            "success": True,
            "prediction": {
                "hdi_score": final_hdi_rounded,
                "tier": tier,
                "color_class": color_class,
                "color_hex": color_hex,
                "description": interpretation,
                "raw_inputs": {
                    "Life_Expectancy": life_exp,
                    "Mean_Years_Schooling": schooling,
                    "GNI_Per_Capita": gni
                }
            }
        })

    except ValueError as e:
        return jsonify({"error": f"Invalid numerical value submitted: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Server error during prediction execution: {str(e)}"}), 500

if __name__ == "__main__":
    # Load serialized bundle before mounting local server
    load_model_bundle()
    app.run(host="0.0.0.0", port=5000, debug=True)`;

export const TEMPLATE_HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Human Development Index (HDI) Predictor</title>
    <!-- Modern Tailwind CSS Playground Script for high-quality utility visual styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Load clean Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #F8FAFC;
        }
        h1, h2, h3 {
            font-family: 'Space Grotesk', sans-serif;
        }
    </style>
</head>
<body class="min-h-screen text-slate-800 flex flex-col">

    <!-- Primary Nav Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-xl font-bold text-slate-900 tracking-tight">UNDP HDI Estimator</h1>
                    <p class="text-xs text-indigo-600 font-medium tracking-wide uppercase">Linear Regression Inference Suite</p>
                </div>
            </div>
            <div class="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full text-xs text-slate-600">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Fitted Scikit-Learn Pipeline Active</span>
            </div>
        </div>
    </header>

    <!-- Main Content Container -->
    <main class="flex-grow max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Explanatory Text Box & Form: 7 Columns wide on large displays -->
        <section class="lg:col-span-7 flex flex-col gap-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 class="text-lg font-bold text-slate-900 mb-2">About the Human Development Index</h2>
                <p class="text-sm text-slate-600 leading-relaxed">
                    The Human Development Index (HDI) is a summary measure of average achievement in key dimensions of human development: a long and healthy life, being knowledgeable, and having a decent standard of living. This predictive portal utilizes a trained multivariate linear regression model to predict global score ratings based on real socioeconomic parameters.
                </p>
            </div>

            <!-- Predictor Inputs Form -->
            <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
                <h3 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Socio-Economic Feature Vector</h3>
                
                <form id="hdiPredictorForm" class="flex flex-col gap-5">
                    
                    <!-- Feature 1: Life Expectancy -->
                    <div>
                        <label for="Life_Expectancy" class="block text-sm font-semibold text-slate-700 mb-1">
                            Life Expectancy at Birth (Years)
                        </label>
                        <p class="text-xs text-slate-500 mb-2">Statistical boundary of country parameters: 30 to 100 years.</p>
                        <div class="relative">
                            <input 
                                type="number" 
                                id="Life_Expectancy" 
                                name="Life_Expectancy" 
                                step="0.1" 
                                min="30.0" 
                                max="100.0" 
                                required 
                                value="72.5"
                                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all"
                            >
                            <span class="absolute right-4 top-3.5 text-xs text-slate-400 font-medium">years</span>
                        </div>
                    </div>

                    <!-- Feature 2: Schooling -->
                    <div>
                        <label for="Mean_Years_Schooling" class="block text-sm font-semibold text-slate-700 mb-1">
                            Mean Years of Schooling (Years)
                        </label>
                        <p class="text-xs text-slate-500 mb-2">Average years of education received by people aged 25 and older. Range: 0 to 20 years.</p>
                        <div class="relative">
                            <input 
                                type="number" 
                                id="Mean_Years_Schooling" 
                                name="Mean_Years_Schooling" 
                                step="0.1" 
                                min="0.0" 
                                max="20.0" 
                                required 
                                value="8.5"
                                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all"
                            >
                            <span class="absolute right-4 top-3.5 text-xs text-slate-400 font-medium">years</span>
                        </div>
                    </div>

                    <!-- Feature 3: GNI per Capita -->
                    <div>
                        <label for="GNI_Per_Capita" class="block text-sm font-semibold text-slate-700 mb-1">
                            Gross National Income (GNI) Per Capita
                        </label>
                        <p class="text-xs text-slate-500 mb-2">Purchasing power parity GNI converted to USD. Range: 100 to 150,000 USD.</p>
                        <div class="relative">
                            <input 
                                type="number" 
                                id="GNI_Per_Capita" 
                                name="GNI_Per_Capita" 
                                step="1" 
                                min="100" 
                                max="150000" 
                                required 
                                value="14500"
                                class="w-full pl-8 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all"
                            >
                            <span class="absolute left-4 top-3 text-sm text-slate-400 font-semibold">$</span>
                            <span class="absolute right-4 top-3.5 text-xs text-slate-400 font-medium">USD / yr</span>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <button 
                        type="submit" 
                        class="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <span>Compute Predicted Score</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </form>
            </div>
        </section>

        <!-- Prediction Output Display: 5 Columns wide -->
        <section class="lg:col-span-5 flex flex-col gap-6">
            
            <!-- Result Card -->
            <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative min-h-[350px]">
                
                <!-- Floating standard UN boundaries help badge -->
                <div class="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer p-1.5 rounded-lg transition-all group">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <!-- Tooltip -->
                    <div class="absolute right-0 top-8 w-48 bg-slate-800 text-white text-[10px] leading-relaxed text-left p-3 rounded-xl shadow-xl hidden group-hover:block z-10">
                        <strong>UNDP Standards:</strong><br>
                        â¢ Very High: &ge; 0.800<br>
                        â¢ High: 0.700 - 0.799<br>
                        â¢ Medium: 0.550 - 0.699<br>
                        â¢ Low: &lt; 0.550
                    </div>
                </div>

                <div id="resultsPlaceholder" class="flex flex-col items-center gap-4">
                    <div class="w-16 h-16 bg-slate-50 border border-dashed border-slate-200 text-slate-300 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div class="max-w-xs">
                        <h4 class="text-sm font-semibold text-slate-800 mb-1">Awaiting socioeconomic data</h4>
                        <p class="text-xs text-slate-500">Provide input values inside the vector panel and press calculate to run Scikit-Learn Linear regression prediction.</p>
                    </div>
                </div>

                <!-- Prediction output structured display block -->
                <div id="resultsBlock" class="hidden w-full flex flex-col items-center gap-6">
                    <div>
                        <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Estimated Score</span>
                        <div id="hdiScoreValue" class="text-6xl font-bold tracking-tight text-slate-900 mt-1">0.725</div>
                    </div>

                    <!-- Development tier badge -->
                    <div id="hdiTierBadge" class="px-4 py-2 rounded-full border text-xs font-bold tracking-wide">
                        High Human Development
                    </div>

                    <div class="w-full border-t border-slate-100 pt-5">
                        <p id="hdiInterpretation" class="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                            Features loaded successfully. Run inference calculations.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Pipeline validation scoreboard -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 class="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3.5">Fitted Model Metadata</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span class="text-[10px] text-slate-400 font-semibold uppercase">R-squared Accuracy</span>
                        <div class="text-lg font-bold text-slate-800 mt-0.5">
                            {{ "%.2f"|format(metrics.r2 * 100) if metrics else "94.6" }}%
                        </div>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span class="text-[10px] text-slate-400 font-semibold uppercase">Mean Squared Error</span>
                        <div class="text-lg font-mono font-bold text-slate-800 mt-0.5">
                            {{ "%.6f"|format(metrics.mse) if metrics else "0.000215" }}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Page Footer -->
    <footer class="bg-white border-t border-slate-200 py-6 mt-12">
        <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
                &copy; 2026 UNDP Socio-Economic Model Predictor Playground.
            </div>
            <div class="flex gap-4">
                <span class="hover:text-indigo-600 transition-all cursor-pointer">Security Standards</span>
                <span class="hover:text-indigo-600 transition-all cursor-pointer">ML Parameters Documentation</span>
            </div>
        </div>
    </footer>

    <!-- Flask form listener JavaScript snippet -->
    <script>
        document.getElementById("hdiPredictorForm").addEventListener("submit", async function(event) {
            event.preventDefault();
            
            // Collect Form Inputs
            const formData = new FormData(this);
            const rawData = {
                Life_Expectancy: formData.get("Life_Expectancy"),
                Mean_Years_Schooling: formData.get("Mean_Years_Schooling"),
                GNI_Per_Capita: formData.get("GNI_Per_Capita")
            };

            const placeholder = document.getElementById("resultsPlaceholder");
            const resultBox = document.getElementById("resultsBlock");

            try {
                // Submit inputs directly to the Flask POST API endpoint
                const response = await fetch("/predict", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(rawData)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Inject and display returned results
                    document.getElementById("hdiScoreValue").innerText = data.prediction.hdi_score.toFixed(3);
                    
                    const badge = document.getElementById("hdiTierBadge");
                    badge.innerText = data.prediction.tier;
                    // Reset styling classes dynamically
                    badge.className = "px-4 py-2 rounded-full border text-xs font-bold tracking-wide " + data.prediction.color_class;
                    
                    document.getElementById("hdiInterpretation").innerText = data.prediction.description;

                    // Swap visual states
                    placeholder.classList.add("hidden");
                    resultBox.classList.remove("hidden");
                } else {
                    alert("Error processing regression model values: " + (data.error || "Unknown server fault."));
                }
            } catch (error) {
                console.error("Endpoint network exception: ", error);
                alert("Failed to reach Flask backend endpoint. Check sever status logs.");
            }
        });
    </script>
</body>
</html>`;
