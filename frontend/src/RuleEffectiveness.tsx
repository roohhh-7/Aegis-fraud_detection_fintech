import React, { useState } from 'react';
import { useStore } from './store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Activity, ArrowRight, CheckCircle2, XCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { ExperimentSummary } from './ExperimentSummary';

export const RuleEffectiveness = () => {
  const { simulationResults, dataset, nodes, edges, inspectedTransactionId, setInspectedTransactionId } = useStore();
  const [activeTab, setActiveTab] = useState<'summary' | 'rules' | 'transactions'>('summary');

  if (!simulationResults || !dataset) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">No Data Available</h2>
          <p className="text-muted-foreground">Run a simulation to view rule effectiveness and inspect transactions.</p>
        </div>
      </div>
    );
  }

  const { node_metrics, results } = simulationResults;

  // Format node metrics into array
  const ruleStats = Object.entries(node_metrics).map(([nodeId, stats]) => {
    const node = nodes.find(n => n.id === nodeId);
    return {
      id: nodeId,
      label: node?.data.label || nodeId,
      type: node?.type || 'Unknown',
      ...stats
    };
  }).filter(r => !['startNode', 'approveNode', 'rejectNode', 'manualReviewNode'].includes(r.type));

  const selectedTransaction = inspectedTransactionId ? results.find(r => r.transaction_id === inspectedTransactionId) : null;
  const rawTransaction = inspectedTransactionId ? dataset.transactions.find(t => t.id === inspectedTransactionId) : null;

  return (
    <div className="flex-1 flex overflow-hidden bg-background text-foreground h-full relative">
      <div className={`flex-1 p-8 overflow-y-auto transition-all ${selectedTransaction ? 'mr-96' : ''}`}>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Analytics Console</h2>
              <p className="text-muted-foreground mt-2">
                Evaluate individual rule performance and inspect transaction decision paths.
              </p>
            </div>
            <div className="flex space-x-2 bg-muted p-1 rounded-lg print:hidden">
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'summary' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('summary')}
              >
                <div className="flex items-center"><FileText className="w-4 h-4 mr-2"/> Summary Report</div>
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'rules' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('rules')}
              >
                Rule Effectiveness
              </button>
              <button 
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'transactions' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('transactions')}
              >
                Simulated Transactions
              </button>
            </div>
          </div>

          {activeTab === 'summary' && <ExperimentSummary />}

          {activeTab === 'rules' && (
            <Card>
              <CardHeader>
                <CardTitle>Rule Effectiveness Ranking</CardTitle>
                <CardDescription>Metrics for every node evaluated during the simulation.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Rule Name</th>
                        <th className="px-4 py-3 font-semibold text-right">Coverage</th>
                        <th className="px-4 py-3 font-semibold text-right">Precision</th>
                        <th className="px-4 py-3 font-semibold text-right">False Positive %</th>
                        <th className="px-4 py-3 font-semibold text-right">Avg Latency</th>
                        <th className="px-4 py-3 font-semibold text-right">Fraud Caught</th>
                        <th className="px-4 py-3 font-semibold text-right">Rev Protected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ruleStats.map(rule => (
                        <tr key={rule.id} className="border-b hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{rule.label}</td>
                          <td className="px-4 py-3 text-right">{rule.coverage.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-500">{rule.precision.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-right font-medium text-destructive">{rule.fpr.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-right">{rule.avg_time.toFixed(2)} ms</td>
                          <td className="px-4 py-3 text-right">{rule.fraud_captured.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">${rule.rev_protected.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                        </tr>
                      ))}
                      {ruleStats.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                            No rules evaluated. Add condition nodes to your workflow.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'transactions' && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction Logs</CardTitle>
                <CardDescription>Click a transaction to inspect its decision path.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Time</th>
                        <th className="px-4 py-3 font-semibold">User ID</th>
                        <th className="px-4 py-3 font-semibold text-right">Amount</th>
                        <th className="px-4 py-3 font-semibold text-center">True Label</th>
                        <th className="px-4 py-3 font-semibold text-center">Decision</th>
                        <th className="px-4 py-3 font-semibold text-right">Latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(0, 100).map(res => {
                        const t = dataset.transactions.find(tx => tx.id === res.transaction_id);
                        if (!t) return null;
                        
                        return (
                          <tr 
                            key={t.id} 
                            onClick={() => setInspectedTransactionId(t.id)}
                            className={`border-b cursor-pointer hover:bg-muted/50 ${inspectedTransactionId === t.id ? 'bg-primary/5' : ''}`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">{new Date(t.timestamp).toLocaleTimeString()}</td>
                            <td className="px-4 py-3 font-mono text-xs">{t.user_id}</td>
                            <td className="px-4 py-3 text-right font-medium">${t.amount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              {t.is_fraud_label ? (
                                <Badge variant="destructive">Fraud</Badge>
                              ) : (
                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Legit</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {res.decision === 'APPROVE' && <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>}
                              {res.decision === 'REJECT' && <Badge variant="destructive">Rejected</Badge>}
                              {res.decision === 'MANUAL_REVIEW' && <Badge className="bg-amber-500 hover:bg-amber-600">Review</Badge>}
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{res.execution_time_ms.toFixed(1)} ms</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Transaction Inspector Drawer */}
      {selectedTransaction && rawTransaction && (
        <div className="absolute top-0 right-0 w-96 h-full bg-card border-l shadow-2xl flex flex-col z-20 animate-in slide-in-from-right">
          <div className="p-4 border-b flex items-center justify-between bg-muted/30">
            <h3 className="font-semibold flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Transaction Inspector
            </h3>
            <button 
              onClick={() => setInspectedTransactionId(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Result</h4>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Final Decision</span>
                  {selectedTransaction.decision === 'APPROVE' && <span className="text-emerald-500 font-bold">APPROVED</span>}
                  {selectedTransaction.decision === 'REJECT' && <span className="text-destructive font-bold">REJECTED</span>}
                  {selectedTransaction.decision === 'MANUAL_REVIEW' && <span className="text-amber-500 font-bold">MANUAL REVIEW</span>}
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Time</span>
                  <span className="text-sm font-medium">{selectedTransaction.execution_time_ms.toFixed(2)} ms</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Decision Path</h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {selectedTransaction.path.map((nodeId, idx) => {
                  const node = nodes.find(n => n.id === nodeId);
                  const outcome = selectedTransaction.node_outcomes[nodeId];
                  const isLast = idx === selectedTransaction.path.length - 1;
                  
                  return (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-background bg-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                        {outcome === 'true' || outcome === 'out' || isLast ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-lg border bg-background shadow-sm">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-sm">{node?.data.label || nodeId}</h5>
                          {outcome && !isLast && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {outcome}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Raw Data</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 border rounded bg-background"><span className="text-muted-foreground block text-xs">Amount</span>${rawTransaction.amount.toFixed(2)}</div>
                <div className="p-2 border rounded bg-background"><span className="text-muted-foreground block text-xs">Country</span>{rawTransaction.country}</div>
                <div className="p-2 border rounded bg-background"><span className="text-muted-foreground block text-xs">Merchant</span>{rawTransaction.merchant_category}</div>
                <div className="p-2 border rounded bg-background"><span className="text-muted-foreground block text-xs">IP</span>{rawTransaction.ip_address}</div>
                <div className="p-2 border rounded bg-background col-span-2"><span className="text-muted-foreground block text-xs">User</span>{rawTransaction.user_id}</div>
                <div className="p-2 border rounded bg-background col-span-2"><span className="text-muted-foreground block text-xs">Device</span>{rawTransaction.device_fingerprint}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
