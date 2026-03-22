# Beyond Banking - Project Description

Beyond Banking is a high-end financial management dashboard designed for the modern investor. It combines a sophisticated "Glassmorphism" aesthetic with intelligent features to provide a comprehensive view of wealth across traditional and digital assets.

## 🚀 Key Features

1.  **Unified Portfolio Dashboard**
    *   **Net Worth Tracking:** Real-time (simulated) tracking of total wealth across Fiat (Savings), Crypto (Binance), Investments (Reksa Dana), and Physical assets (Gold).
    *   **Liquidity Analysis:** Automatic calculation of the "Liquid Ratio" to help users understand their cash-on-hand health.

2.  **Omni-Transaction Input (NLP)**
    *   A natural language command line that allows users to type sentences like *"Makan warteg 25rb bca"* to record transactions instantly.
    *   Real-time "AI Inference Preview" showing how the system interprets the amount, category, and source.

3.  **Behavioral Insights Engine**
    *   Proactive detection of spending patterns and anomalies.
    *   Provides "Probability" and "Confidence Intervals" for predicted overspending (e.g., *"Friday Night Overspend Risk"*).

4.  **Time Machine Simulator**
    *   Interactive linear projection of future net worth.
    *   Users can add variables (Income/Expense) and adjust sliders for amount and duration to see the 12-month impact on their balance.

5.  **Advanced Query Builder**
    *   A modular filtering system for transaction history using logical operators (WHERE, AND, OR) across multiple fields like Amount, Category, and Day of Week.

6.  **High-End Visual Experience**
    *   **WebGL Shaders:** Custom entry shaders and background animations using Three.js for a premium feel.
    *   **Responsive Charts:** Interactive spending breakdowns using Recharts.

## 📊 Data Science Implementation

Data science principles are implemented across several layers of the application:

*   **Anomaly Detection & Behavioral Analytics (Statistical Design):**
    *   **Location:** `src/components/insights/BehavioralInsightsCard.tsx` and `src/lib/types.ts`
    *   **Implementation:** While currently utilizing a curated dataset for the prototype, the feature is architected as a **Statistical Inference Engine**. It uses key data science metrics:
        *   **Probability Scores (0.0 - 1.0):** Quantifying the likelihood of a spending pattern repeating.
        *   **Confidence Intervals:** Expressing the range of uncertainty in historical averages (e.g., `[0.79, 0.91]`).
        *   **Frequency/Temporal Analysis:** Analyzing spending by `dayOfWeek` and `timeOfDay` (attributes found in the `Transaction` interface) to detect cyclical behaviors like "Friday Night Overspending."
        *   **Categorical Deviation:** Measuring current spending against `historicalAverage` to flag significant spikes.

*   **Natural Language Processing (NLP):**
    *   **Location:** `src/lib/nlp-parser.ts`
    *   **Implementation:** Uses regex-based tokenization and keyword mapping to extract entities (Amount, Category, Asset Source).
    *   **Confidence Metric:** Calculates a confidence score (0.0 - 1.0) based on the clarity of the input and the number of successfully extracted fields.

*   **Predictive Financial Modeling:**
    *   **Location:** `src/components/simulator/TimeMachineSimulator.tsx`
    *   **Implementation:** Implements a linear projection model that calculates the delta between a baseline growth rate and user-defined recurring variables over a 12-month window.

*   **Statistical Analysis (Mock Implementation):**
    *   **Location:** `src/lib/mock-data.ts`
    *   **Implementation:** Demonstrates the use of **Confidence Intervals** and **Historical Averages** to detect behavioral anomalies. The system is designed to compare current transaction peaks against standard deviations of past spending.

## ✅ Worked vs. ❌ Hasn't Worked

### Worked
*   **Aesthetic Integrity:** The Glassmorphism UI and WebGL shaders are fully functional and performant.
*   **NLP Entity Extraction:** The parser accurately identifies Indonesian/English financial slang (e.g., "rb", "ribu", "jt", "k").
*   **Simulation Logic:** The real-time update of the 12-month chart based on simulator variables is seamless.

### Hasn't Worked / Limited
*   **Real Statistical Engine:** The "Insights" are currently generated from mock data. The logic to calculate these from the *actual* transaction list in real-time is not yet fully implemented.
*   **Query Execution:** While the **Advanced Query Builder** UI is complete, it is not yet connected to the Transaction Table filtering logic (currently acts as a functional mockup).
*   **Data Persistence:** Changes (adding transactions or dismissing insights) do not persist after a page refresh as there is no backend/LocalStorage integration yet.

## 🛠️ Enhancements & Future Roadmap

*   **LLM Integration:** Upgrade the `nlp-parser.ts` to use the **Gemini API** for more robust intent recognition and support for complex, multi-step financial commands.
*   **Live Banking Integration:** Connect to real-world financial data via Open Banking APIs (like Plaid or Brick) to replace mock data.
*   **Advanced Simulation Models:** Incorporate **Compound Interest** and **Inflation Adjustments** into the Time Machine Simulator.
*   **Anomaly Detection Engine:** Implement a real-time statistical worker that analyzes the transaction array using Z-score or Isolation Forest algorithms to find actual spending outliers.
