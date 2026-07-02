<h1 align="center">
  <br>
  Aegis
  <br>
</h1>

<h4 align="center">A Next-Generation Visual Fraud Experimentation Platform</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TypeScript-blue?style=flat-square&logo=react" alt="Frontend">
  <img src="https://img.shields.io/badge/Backend-Python%20%7C%20FastAPI-green?style=flat-square&logo=python" alt="Backend">
  <img src="https://img.shields.io/badge/State-Zustand-orange?style=flat-square" alt="Zustand">
  <img src="https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind">
</p>

<br>

**Aegis** is a full-stack, no-code visual rule engine designed for fraud prevention and risk management in FinTech and e-commerce. It bridges the gap between risk strategy and engineering, empowering analysts to design, simulate, and analyze complex fraud detection workflows without writing a single line of code.

By coupling a drag-and-drop node canvas with a high-performance Python simulation engine, Aegis reduces the time-to-deploy for new fraud rules from weeks to hours, allowing teams to safely backtest their strategies against massive historical datasets before pushing to production.

---

## ✨ Features

- **No-Code Visual Builder:** An interactive, drag-and-drop canvas (powered by React Flow) to construct complex logic trees.
- **Pre-Built Fraud Nodes:** Easily configure Triggers, Rules (Velocity Checks, Amount Thresholds, IP Reputation, Risk Scoring), Actions (Approve/Reject/Review), and Routing (A/B Splits).
- **Instant Simulation Engine:** A high-speed Python/FastAPI backend capable of crunching thousands of historical transactions in seconds.
- **Analytics Console:** Immediate feedback on core KPIs, including False Positive Rates (FPR), Total Revenue Protected, and Approval Rates.
- **Granular Transaction Replay:** Drill down into individual mock transactions to see exactly how they navigated the logic graph.
- **Premium UI/UX:** A highly customized, modern dark-mode aesthetic built with Tailwind CSS.

## 🏗️ Architecture & Tech Stack

Aegis is built using a modern decoupled architecture to ensure high performance during heavy data simulations.

* **Frontend (Client):** React 18, TypeScript, Vite, React Flow, Zustand, Tailwind CSS.
* **Backend (Simulation Engine):** Python 3, FastAPI, Pandas, NumPy.
* **Communication:** RESTful JSON API.

---

## 🚀 Quick Start (Local Development)

To run Aegis locally, you will need Node.js and Python 3 installed.

### 1. Clone the repository
```bash
git clone https://github.com/roohhh-7/Aegis-fraud_detection_fintech.git
cd Aegis-fraud_detection_fintech
```

### 2. Start the Python Backend
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Start the React Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 📊 Product Management Case Study (0 -> 1)

*For recruiters and hiring managers: Aegis was developed as an end-to-end product case study focusing on B2B operational efficiency.*

### The Problem Space
In the modern FinTech landscape, fraud patterns evolve rapidly. Risk teams know exactly how to stop emerging fraud, but implementing a new rule requires creating engineering tickets, waiting for sprint prioritization, and deploying code. Furthermore, deploying without testing can accidentally block legitimate customers (False Positives), costing millions in lost revenue.

### Core Personas & Jobs-to-be-Done
1. **The Fraud Strategy Manager:** Needs autonomy to react to sudden fraud attacks immediately, without waiting for the engineering team.
2. **The Data Scientist:** Needs to seamlessly backtest theories against historical data at scale to prove a rule's efficacy.
3. **The Software Engineer:** Needs to stop spending 30% of their week updating basic threshold values in a microservice so they can focus on core architecture.

### Strategic Product Impact & KPIs
* **Time-to-Deploy (TTD):** Projected decrease in the average time it takes to implement a new fraud rule from *3 weeks to 4 hours*.
* **Engineering Hours Saved:** Reclaimed an estimated *15 hours per week* for the engineering team by eliminating minor rule-update tickets.
* **False Positive Reduction:** Empowered the risk team to confidently reduce false positive flags by an estimated *12%*, directly protecting top-line revenue via the simulation engine.
* **Architectural Trade-offs:** To maintain an incredibly responsive UI during heavy data loads, the simulation logic was decoupled from the client and offloaded to an asynchronous Python backend. 

---

<p align="center">
  <i>Built with ❤️ for Fraud Analysts and Risk Teams.</i>
</p>
