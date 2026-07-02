# Aegis Engine

**[👉 Check out the full 0-to-1 Product Case Study on Notion](https://app.notion.com/p/AEGIS-0-1-FinTech-Product-3908fab9854d80c6a3d7dfb6c9c97506)**

Aegis Engine is a visual, drag-and-drop tool for building and testing fraud prevention rules. 

I built this because setting up fraud rules at most companies is a huge bottleneck. Risk teams know what rules they want to write, but they usually have to create a Jira ticket, wait for engineers to code it, and then hope it doesn't accidentally block thousands of good customers when deployed. 

Aegis Engine solves this by letting risk teams build rules visually and immediately test them against historical data to see the financial impact before anything goes live.

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

Interfaces:
<img width="1332" height="753" alt="image" src="https://github.com/user-attachments/assets/c0b6be2a-dd1b-49f8-b3fd-72df82f43034" />
<img width="1335" height="745" alt="image" src="https://github.com/user-attachments/assets/ca50ecdc-0bc9-4bef-8fe7-8343674a5611" />
<img width="1332" height="708" alt="image" src="https://github.com/user-attachments/assets/803c7073-81ea-411b-acc6-9f9b35af0964" />
<img width="1325" height="748" alt="image" src="https://github.com/user-attachments/assets/422532bc-0b67-4065-9fb7-9138f4e37c7e" />
<img width="1326" height="543" alt="image" src="https://github.com/user-attachments/assets/4dcadbee-ae95-4b0d-8447-356e7300e93b" />




