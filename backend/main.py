from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import random
import uuid
import time
from datetime import datetime, timedelta

app = FastAPI(title="Sentra Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transaction(BaseModel):
    id: str
    timestamp: str
    amount: float
    currency: str
    user_id: str
    card_fingerprint: str
    device_fingerprint: str
    ip_address: str
    country: str
    merchant_category: str
    ai_risk_score: float = 0.0
    device_risk_score: float = 0.0
    ip_reputation_score: float = 0.0
    card_bin_country: str = "US"
    merchant_risk_score: float = 0.0
    is_fraud_label: bool = False # For evaluating false positives/negatives if known

class Dataset(BaseModel):
    transactions: List[Transaction]

class NodeData(BaseModel):
    label: str
    config: Dict[str, Any] = {}

class Node(BaseModel):
    id: str
    type: str
    data: NodeData

class Edge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class Workflow(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class SimulationRequest(BaseModel):
    workflow: Workflow
    dataset: Dataset

class TransactionResult(BaseModel):
    transaction_id: str
    decision: str # "APPROVE", "REJECT", "MANUAL_REVIEW"
    path: List[str] # List of node IDs evaluated
    node_outcomes: Dict[str, str] # node_id -> outcome (e.g. "passed", "failed")
    execution_time_ms: float

class SimulationResponse(BaseModel):
    results: List[TransactionResult]
    kpis: Dict[str, Any]
    node_metrics: Dict[str, Any] = {}
    readiness: Dict[str, Any] = {}
    executive_summary: str = ""
    rule_insights: List[Dict[str, Any]] = []
    workflow_observations: List[str] = []

class ShadowSimulationRequest(BaseModel):
    candidate_workflow: Workflow
    production_workflow: Workflow
    dataset: Dataset

class ShadowSimulationResponse(BaseModel):
    agreed_count: int
    disagreed_count: int
    fraud_additionally_captured: int
    legitimate_users_blocked: int
    revenue_difference: float
    approval_rate_difference: float
    false_positive_difference: float
    latency_difference: float
    deployment_recommendation: str

# Dataset Generation logic
@app.post("/api/dataset/generate", response_model=Dataset)
async def generate_dataset(scenario: str = "normal", count: int = 10000):
    transactions = []
    
    countries = ["US", "CA", "GB", "IN", "BR", "DE", "FR", "AU"]
    merchants = ["Retail", "Digital", "Travel", "Crypto", "Gaming"]
    
    fraud_percentages = {
        "normal": 0.01,
        "card_testing": 0.15,
        "velocity": 0.05,
        "ato": 0.03,
        "high_value": 0.02,
        "international": 0.08,
        "mixed": 0.04
    }
    
    fraud_pct = fraud_percentages.get(scenario, 0.01)
    fraud_count = int(count * fraud_pct)
    normal_count = count - fraud_count

    # Generate Normal
    for _ in range(normal_count):
        t = Transaction(
            id=str(uuid.uuid4()),
            timestamp=(datetime.now() - timedelta(minutes=random.randint(0, 10000))).isoformat(),
            amount=round(random.uniform(10.0, 500.0), 2),
            currency="USD",
            user_id=f"u_{random.randint(10000, 99999)}",
            card_fingerprint=f"c_{random.randint(1000, 9999)}",
            device_fingerprint=f"d_{random.randint(1000, 9999)}",
            ip_address=f"{random.randint(1,255)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(0,255)}",
            country=random.choice(countries[:3]) if scenario != "international" else random.choice(countries),
            merchant_category=random.choice(merchants),
            ai_risk_score=round(random.uniform(1.0, 40.0), 1),
            device_risk_score=round(random.uniform(0.0, 30.0), 1),
            ip_reputation_score=round(random.uniform(0.0, 20.0), 1),
            card_bin_country=random.choice(countries[:3]),
            merchant_risk_score=round(random.uniform(0.0, 40.0), 1),
            is_fraud_label=False
        )
        transactions.append(t)
        
    # Generate Fraud
    fraud_ips = ["10.0.0.1", "192.168.1.1", "45.22.11.0"]
    fraud_devices = ["d_fraud1", "d_fraud2", "d_fraud3"]
    
    for _ in range(fraud_count):
        amount = round(random.uniform(500.0, 2000.0), 2)
        country = random.choice(countries)
        merchant = random.choice(merchants)
        ip = random.choice(fraud_ips)
        device = random.choice(fraud_devices)
        uid = f"u_{random.randint(10000, 99999)}"
        
        if scenario == "card_testing":
            amount = round(random.uniform(0.50, 5.00), 2)
            merchant = "Digital"
        elif scenario == "velocity":
            uid = "u_velocity_attacker"
            amount = round(random.uniform(100.0, 300.0), 2)
        elif scenario == "ato":
            amount = round(random.uniform(1000.0, 3000.0), 2)
            device = "d_new_unrecognized_device"
        elif scenario == "high_value":
            amount = round(random.uniform(5000.0, 15000.0), 2)
        elif scenario == "international":
            country = random.choice(["RU", "CN", "NG", "BR"])
            
        t = Transaction(
            id=str(uuid.uuid4()),
            timestamp=(datetime.now() - timedelta(minutes=random.randint(0, 1000))).isoformat(),
            amount=amount,
            currency="USD",
            user_id=uid,
            card_fingerprint=f"c_{random.randint(1000, 9999)}",
            device_fingerprint=device,
            ip_address=ip,
            country=country,
            merchant_category=merchant,
            ai_risk_score=round(random.uniform(60.0, 99.0), 1) if scenario != "card_testing" else round(random.uniform(40.0, 75.0), 1),
            device_risk_score=round(random.uniform(50.0, 99.0), 1) if scenario != "card_testing" else round(random.uniform(20.0, 50.0), 1),
            ip_reputation_score=round(random.uniform(60.0, 99.0), 1),
            card_bin_country=random.choice(countries),
            merchant_risk_score=round(random.uniform(50.0, 99.0), 1),
            is_fraud_label=True
        )
        transactions.append(t)
        
    random.shuffle(transactions)
    return Dataset(transactions=transactions)

# Evaluate a single transaction against the workflow
def evaluate_transaction(t: Transaction, workflow: Workflow, user_history: List[Transaction]) -> TransactionResult:
    start_time = time.perf_counter()
    
    nodes_by_id = {n.id: n for n in workflow.nodes}
    edges_by_source = {}
    for e in workflow.edges:
        if e.source not in edges_by_source:
            edges_by_source[e.source] = []
        edges_by_source[e.source].append(e)
        
    # Find start node
    start_nodes = [n for n in workflow.nodes if n.type == "startNode"]
    if not start_nodes:
        # Default decision if no start node
        return TransactionResult(
            transaction_id=t.id, decision="APPROVE", path=[], node_outcomes={}, execution_time_ms=0.0
        )
        
    current_node = start_nodes[0]
    path = [current_node.id]
    node_outcomes = {}
    decision = "APPROVE" # Default
    
    while current_node:
        nid = current_node.id
        ntype = current_node.type
        config = current_node.data.config
        
        outcome_handle = None
        
        # Rule evaluation logic
        if ntype == "amountCheckNode":
            threshold = config.get("threshold", 1000)
            operator = config.get("operator", "gt")
            
            val = t.amount
            if operator == "gt" and val > threshold:
                outcome_handle = "true"
            elif operator == "lt" and val < threshold:
                outcome_handle = "true"
            elif operator == "eq" and val == threshold:
                outcome_handle = "true"
            else:
                outcome_handle = "false"
                
            node_outcomes[nid] = outcome_handle
            
        elif ntype == "countryCheckNode":
            allowed = config.get("allowedCountries", ["US", "CA", "GB"])
            if t.country in allowed:
                outcome_handle = "true"
            else:
                outcome_handle = "false"
            node_outcomes[nid] = outcome_handle
            
        elif ntype == "velocityCheckNode":
            window_mins = config.get("timeWindowMinutes", 10)
            limit = config.get("transactionLimit", 5)
            
            t_time = datetime.fromisoformat(t.timestamp)
            cutoff_time = t_time - timedelta(minutes=window_mins)
            
            count = 0
            for hist_t in user_history:
                h_time = datetime.fromisoformat(hist_t.timestamp)
                if cutoff_time <= h_time <= t_time:
                    count += 1
                    
            if count > limit:
                outcome_handle = "true"
            else:
                outcome_handle = "false"
            node_outcomes[nid] = outcome_handle
            
        elif ntype == "aiScoreNode":
            threshold = config.get("threshold", 85.0)
            if t.ai_risk_score > threshold:
                outcome_handle = "true"
            else:
                outcome_handle = "false"
            node_outcomes[nid] = outcome_handle
            
        elif ntype == "deviceFingerprintNode":
            threshold = config.get("threshold", 80.0)
            if t.device_risk_score > threshold:
                outcome_handle = "true"
            else:
                outcome_handle = "false"
            node_outcomes[nid] = outcome_handle

        elif ntype == "ipReputationNode":
            threshold = config.get("threshold", 80.0)
            if t.ip_reputation_score > threshold:
                outcome_handle = "true"
            else:
                outcome_handle = "false"
            node_outcomes[nid] = outcome_handle

        elif ntype == "binCheckNode":
            allowed = config.get("allowedCountries", ["US", "CA", "GB"])
            if t.card_bin_country in allowed:
                outcome_handle = "true"
            else:
                outcome_handle = "false"
            node_outcomes[nid] = outcome_handle

        elif ntype == "merchantRiskNode":
            threshold = config.get("threshold", 80.0)
            if t.merchant_risk_score > threshold:
                outcome_handle = "true"
            else:
                outcome_handle = "false"
            node_outcomes[nid] = outcome_handle

        elif ntype == "businessHoursNode":
            start_hour = config.get("startHour", 9)
            end_hour = config.get("endHour", 17)
            t_hour = datetime.fromisoformat(t.timestamp).hour
            if start_hour <= end_hour:
                in_hours = start_hour <= t_hour < end_hour
            else:
                in_hours = t_hour >= start_hour or t_hour < end_hour
                
            if in_hours:
                outcome_handle = "true"
            else:
                outcome_handle = "false"
            node_outcomes[nid] = outcome_handle
            
        elif ntype == "splitNode":
            split_pct = config.get("splitPercentage", 50)
            val = sum(ord(c) for c in t.id) % 100
            if val < split_pct:
                outcome_handle = "pathA"
            else:
                outcome_handle = "pathB"
            node_outcomes[nid] = outcome_handle
            
        elif ntype == "approveNode":
            decision = "APPROVE"
            break
        elif ntype == "rejectNode":
            decision = "REJECT"
            break
        elif ntype == "manualReviewNode":
            decision = "MANUAL_REVIEW"
            break
        elif ntype == "startNode":
            outcome_handle = "out"
            node_outcomes[nid] = "out"
        else:
            # For unimplemented rules, just pass them as true for now
            outcome_handle = "true"
            node_outcomes[nid] = "true"

        # Find next node based on outcome_handle
        next_edges = edges_by_source.get(nid, [])
        if outcome_handle:
            # Filter edges by sourceHandle if applicable
            valid_edges = [e for e in next_edges if e.sourceHandle == outcome_handle or e.sourceHandle is None]
        else:
            valid_edges = next_edges
            
        if not valid_edges:
            break
            
        next_node_id = valid_edges[0].target
        current_node = nodes_by_id.get(next_node_id)
        if current_node:
            path.append(current_node.id)

    exec_time = (time.perf_counter() - start_time) * 1000
    return TransactionResult(
        transaction_id=t.id,
        decision=decision,
        path=path,
        node_outcomes=node_outcomes,
        execution_time_ms=exec_time
    )

def run_workflow_simulation(workflow: Workflow, dataset: Dataset) -> SimulationResponse:
    results = []
    
    user_histories = {}
    for t in dataset.transactions:
        if t.user_id not in user_histories:
            user_histories[t.user_id] = []
        user_histories[t.user_id].append(t)
        
    for uid in user_histories:
        user_histories[uid].sort(key=lambda x: x.timestamp)
    
    total_fraud = 0
    captured_fraud = 0
    false_positives = 0
    false_negatives = 0
    approved = 0
    rejected = 0
    manual_review = 0
    total_exec_time = 0.0
    revenue_protected = 0.0
    revenue_lost = 0.0
    
    # Node metrics tracking
    node_stats = {}
    
    for t in dataset.transactions:
        if t.is_fraud_label:
            total_fraud += 1
            
        res = evaluate_transaction(t, workflow, user_histories.get(t.user_id, []))
        results.append(res)
        total_exec_time += res.execution_time_ms
        
        for nid in res.path:
            if nid not in node_stats:
                node_stats[nid] = {"triggered": 0, "fraud_captured": 0, "false_positives": 0, "exec_time": 0.0, "rev_protected": 0.0, "rev_lost": 0.0}
            node_stats[nid]["triggered"] += 1
            node_stats[nid]["exec_time"] += res.execution_time_ms / len(res.path)
            
            if res.decision == "REJECT":
                if t.is_fraud_label:
                    node_stats[nid]["fraud_captured"] += 1
                    node_stats[nid]["rev_protected"] += t.amount
                else:
                    node_stats[nid]["false_positives"] += 1
        
        if res.decision == "APPROVE":
            approved += 1
            if t.is_fraud_label:
                false_negatives += 1
                revenue_lost += t.amount
        elif res.decision == "REJECT":
            rejected += 1
            if t.is_fraud_label:
                captured_fraud += 1
                revenue_protected += t.amount
            else:
                false_positives += 1
        elif res.decision == "MANUAL_REVIEW":
            manual_review += 1
            
    total = len(dataset.transactions)
    
    for nid, stats in node_stats.items():
        stats["coverage"] = (stats["triggered"] / total) * 100 if total > 0 else 0
        stats["fpr"] = (stats["false_positives"] / stats["triggered"]) * 100 if stats["triggered"] > 0 else 0
        stats["precision"] = (stats["fraud_captured"] / (stats["fraud_captured"] + stats["false_positives"])) * 100 if (stats["fraud_captured"] + stats["false_positives"]) > 0 else 0
        stats["avg_time"] = stats["exec_time"] / stats["triggered"] if stats["triggered"] > 0 else 0
    
    kpis = {
        "totalTransactions": total,
        "fraudCaptureRate": (captured_fraud / total_fraud) * 100 if total_fraud > 0 else 0,
        "falsePositiveRate": (false_positives / (total - total_fraud)) * 100 if (total - total_fraud) > 0 else 0,
        "falseNegativeRate": (false_negatives / total_fraud) * 100 if total_fraud > 0 else 0,
        "approvalRate": (approved / total) * 100 if total > 0 else 0,
        "manualReviewRate": (manual_review / total) * 100 if total > 0 else 0,
        "revenueProtected": revenue_protected,
        "revenueLost": revenue_lost,
        "averageDecisionTimeMs": total_exec_time / total if total > 0 else 0,
        "precision": (captured_fraud / (captured_fraud + false_positives)) * 100 if (captured_fraud + false_positives) > 0 else 0,
        "recall": (captured_fraud / total_fraud) * 100 if total_fraud > 0 else 0
    }
    
    # Deployment Readiness Score (Deterministic heuristics)
    fcr = kpis["fraudCaptureRate"]
    fpr = kpis["falsePositiveRate"]
    lat = kpis["averageDecisionTimeMs"]
    
    score = 100
    strengths = []
    weaknesses = []
    recs = []
    
    if fcr > 90: strengths.append("Excellent fraud capture")
    elif fcr < 70: 
        score -= 20
        weaknesses.append("Poor fraud capture")
        recs.append("Add stricter amount or country rules")
        
    if fpr < 2: strengths.append("Very low false positive rate")
    elif fpr > 10:
        score -= 30
        weaknesses.append("High false positive rate")
        recs.append("Review reject conditions; legitimate users are being blocked")
        
    if lat < 10: strengths.append("Low latency")
    elif lat > 50:
        score -= 10
        weaknesses.append("High evaluation latency")
        recs.append("Simplify workflow path")
        
    readiness = {
        "score": max(0, min(100, score)),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recs
    }
            
    # Executive Summary Generator
    exec_summary = f"This experiment evaluated {total:,} transactions. "
    if fcr >= 80:
        exec_summary += f"It successfully captured {fcr:.1f}% of fraud, protecting ${revenue_protected:,.0f} in revenue. "
    elif fcr >= 50:
        exec_summary += f"It achieved moderate fraud capture ({fcr:.1f}%), protecting ${revenue_protected:,.0f}. "
    else:
        exec_summary += f"Fraud capture was critically low at {fcr:.1f}%. "
        
    if fpr < 5:
        exec_summary += f"False positive rates remained low at {fpr:.1f}%, ensuring minimal friction for legitimate customers. "
    else:
        exec_summary += f"However, the false positive rate is elevated ({fpr:.1f}%), resulting in {false_positives:,} legitimate users being blocked. "
        
    exec_summary += f"Overall approval rate stood at {kpis['approvalRate']:.1f}%."

    # Rule Insights Generator
    rule_insights = []
    for nid, stats in node_stats.items():
        # Only evaluate rule nodes, skip actions and start
        node_obj = next((n for n in workflow.nodes if n.id == nid), None)
        if not node_obj or node_obj.type in ["startNode", "approveNode", "rejectNode", "manualReviewNode"]:
            continue
            
        rule_name = node_obj.data.label
        r_fcr = (stats["fraud_captured"] / total_fraud * 100) if total_fraud > 0 else 0
        r_fpr = stats["fpr"]
        r_trig = stats["triggered"]
        
        observations = []
        observations.append(f"Triggered on {r_trig:,} transactions.")
        
        if r_fcr > 50:
            observations.append(f"Captured {r_fcr:.1f}% of all fraudulent payments.")
        elif stats["fraud_captured"] > 0:
            observations.append(f"Captured {r_fcr:.1f}% of fraud.")
        else:
            observations.append(f"Captured 0% of fraud.")
            
        status = "🟢"
        if r_fpr > 15:
            observations.append(f"Responsible for high false positives ({r_fpr:.1f}%). Threshold may be too aggressive.")
            status = "🔴"
        elif r_fcr < 5:
            observations.append("Low business impact. Rarely contributes to positive decisions.")
            status = "🟡"
        else:
            observations.append(f"False Positive Rate is only {r_fpr:.1f}%. High-impact rule.")
            status = "🟢"
            
        rule_insights.append({
            "node_id": nid,
            "rule_name": rule_name,
            "status": status,
            "observations": observations,
            "metrics": stats
        })

    # Workflow Observations Generator
    workflow_obs = []
    if kpis["approvalRate"] > 80:
        workflow_obs.append(f"Approval path is processing {kpis['approvalRate']:.1f}% of transactions seamlessly.")
    
    if manual_review > (total * 0.1):
        workflow_obs.append(f"Manual Review receives unusually high traffic ({manual_review:,} transactions). This may overwhelm review teams.")
        
    if false_positives > captured_fraud:
        workflow_obs.append("The workflow currently blocks more legitimate users than actual fraudsters.")
        
    for insight in rule_insights:
        if insight["status"] == "🟡":
            workflow_obs.append(f"{insight['rule_name']} rarely contributes to decisions and could potentially be removed to improve latency.")
            break
            
    if len(workflow_obs) == 0:
        workflow_obs.append("The workflow appears balanced with expected traffic distribution across decision nodes.")

    return SimulationResponse(
        results=results, 
        kpis=kpis, 
        node_metrics=node_stats, 
        readiness=readiness,
        executive_summary=exec_summary,
        rule_insights=rule_insights,
        workflow_observations=workflow_obs
    )

@app.post("/api/simulate", response_model=SimulationResponse)
async def api_simulate(req: SimulationRequest):
    return run_workflow_simulation(req.workflow, req.dataset)

@app.post("/api/shadow-simulate", response_model=ShadowSimulationResponse)
async def api_shadow_simulate(req: ShadowSimulationRequest):
    cand_res = run_workflow_simulation(req.candidate_workflow, req.dataset)
    prod_res = run_workflow_simulation(req.production_workflow, req.dataset)
    
    agreed = 0
    disagreed = 0
    add_fraud_cap = 0
    legit_blocked = 0
    
    cand_results = {r.transaction_id: r for r in cand_res.results}
    
    for prod_t in prod_res.results:
        cand_t = cand_results.get(prod_t.transaction_id)
        if not cand_t: continue
        if prod_t.decision == cand_t.decision:
            agreed += 1
        else:
            disagreed += 1
            is_fraud = False
            # Find the actual transaction to see if it's fraud
            for t in req.dataset.transactions:
                if t.id == prod_t.transaction_id:
                    is_fraud = t.is_fraud_label
                    break
            
            if cand_t.decision == "REJECT" and prod_t.decision != "REJECT":
                if is_fraud:
                    add_fraud_cap += 1
                else:
                    legit_blocked += 1
            elif cand_t.decision != "REJECT" and prod_t.decision == "REJECT":
                if is_fraud:
                    add_fraud_cap -= 1
                else:
                    legit_blocked -= 1

    rev_diff = cand_res.kpis["revenueProtected"] - prod_res.kpis["revenueProtected"]
    app_diff = cand_res.kpis["approvalRate"] - prod_res.kpis["approvalRate"]
    fpr_diff = cand_res.kpis["falsePositiveRate"] - prod_res.kpis["falsePositiveRate"]
    lat_diff = cand_res.kpis["averageDecisionTimeMs"] - prod_res.kpis["averageDecisionTimeMs"]
    
    rec = "Safe to Deploy"
    if fpr_diff > 2 or legit_blocked > (len(req.dataset.transactions) * 0.01):
        rec = "High Risk"
    elif add_fraud_cap <= 0 and fpr_diff >= 0:
        rec = "Needs Tuning"
        
    return ShadowSimulationResponse(
        agreed_count=agreed,
        disagreed_count=disagreed,
        fraud_additionally_captured=add_fraud_cap,
        legitimate_users_blocked=legit_blocked,
        revenue_difference=rev_diff,
        approval_rate_difference=app_diff,
        false_positive_difference=fpr_diff,
        latency_difference=lat_diff,
        deployment_recommendation=rec
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
