import { Edge, Node } from 'reactflow';

export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  currency: string;
  user_id: string;
  card_fingerprint: string;
  device_fingerprint: string;
  ip_address: string;
  country: string;
  merchant_category: string;
  is_fraud_label: boolean;
}

export interface Dataset {
  transactions: Transaction[];
}

export interface NodeData {
  label: string;
  config: Record<string, any>;
  onConfigChange?: (id: string, config: Record<string, any>) => void;
}

export type RiskflowNode = Node<NodeData>;
export type RiskflowEdge = Edge;

export interface Workflow {
  nodes: RiskflowNode[];
  edges: RiskflowEdge[];
}

export interface TransactionResult {
  transaction_id: string;
  decision: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW';
  path: string[];
  node_outcomes: Record<string, string>;
  execution_time_ms: number;
  amount: number;
  risk_score: number;
}

export interface KPIs {
  totalTransactions: number;
  fraudCaptureRate: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  approvalRate: number;
  manualReviewRate: number;
  revenueProtected: number;
  revenueLost: number;
  averageDecisionTimeMs: number;
  precision: number;
  recall: number;
}

export interface NodeMetrics {
  triggered: number;
  fraud_captured: number;
  false_positives: number;
  exec_time: number;
  rev_protected: number;
  rev_lost: number;
  coverage: number;
  fpr: number;
  precision: number;
  avg_time: number;
}

export interface DeploymentReadiness {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SimulationResponse {
  results: TransactionResult[];
  kpis: KPIs;
  node_metrics: Record<string, NodeMetrics>;
  readiness: DeploymentReadiness;
  executive_summary: string;
  rule_insights: {
    node_id: string;
    rule_name: string;
    status: string;
    observations: string[];
    metrics: NodeMetrics;
  }[];
  workflow_observations: string[];
}

export interface ShadowSimulationResponse {
  agreed_count: number;
  disagreed_count: number;
  fraud_additionally_captured: number;
  legitimate_users_blocked: number;
  revenue_difference: number;
  approval_rate_difference: number;
  false_positive_difference: number;
  latency_difference: number;
  deployment_recommendation: string;
}

export interface WorkflowVersion {
  id: string;
  version_number: number;
  timestamp: string;
  description: string;
  nodes: RiskflowNode[];
  edges: RiskflowEdge[];
  metrics?: KPIs;
}
