# Aegis

Aegis is a visual, drag-and-drop tool for building and testing fraud prevention rules. 

I built this because setting up fraud rules at most companies is a huge bottleneck. Risk teams know what rules they want to write, but they usually have to create a Jira ticket, wait for engineers to code it, and then hope it doesn't accidentally block thousands of good customers when deployed. 

Aegis solves this by letting risk teams build rules visually and immediately test them against historical data to see the financial impact before anything goes live.

## What it does

- **Visual Rule Builder:** Drag and drop nodes to create fraud logic (like checking transaction amounts, IP addresses, or transaction velocity).
- **Simulation Engine:** Run your new rule against thousands of past transactions to see what would have happened.
- **Analytics Dashboard:** Get instant feedback on False Positive Rates, how much revenue was protected, and exactly which transactions were blocked.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, and React Flow (for the canvas).
- **Backend:** Python, FastAPI, Pandas (for running the data simulations fast).

## How to run it locally

You'll need Node.js and Python installed.

**1. Clone the repo**
```bash
git clone https://github.com/roohhh-7/Aegis-fraud_detection_fintech.git
cd Aegis-fraud_detection_fintech
```

**2. Start the Backend**
```bash
cd backend
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

**3. Start the Frontend**
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Then just open `http://localhost:5173` in your browser.

---

## Product Case Study 

*I built this project to showcase product management and 0-to-1 execution. Here is a breakdown of the product strategy behind Aegis.*

### The Problem
Fraud patterns change daily, but risk teams rely on slow engineering cycles to update rules. Worse, deploying a new rule blindly can block legitimate customers (false positives), causing massive revenue loss. 

### The Users
1. **The Fraud Manager:** Needs to react to attacks immediately without waiting on engineering.
2. **The Data Analyst:** Needs to test theories against past data to prove a rule is safe to deploy.
3. **The Software Engineer:** Wants to stop doing repetitive config updates and focus on core infrastructure.

### The Impact (KPIs)
* **Time-to-Deploy:** Cuts down the time to implement a new fraud rule from weeks to just a few hours.
* **Engineering Time Saved:** Saves engineering teams an estimated 15+ hours a week by letting risk teams self-serve.
* **Safer Deployments:** The simulation engine helps catch false positives early, protecting top-line revenue before the rule goes live.
