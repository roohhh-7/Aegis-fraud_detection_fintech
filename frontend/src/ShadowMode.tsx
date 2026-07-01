import React, { useState } from 'react';
import { useStore } from './store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Split, AlertTriangle, CheckCircle, Play, Activity } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner';

export const ShadowMode = () => {
  const { versions, nodes, edges, dataset, shadowResults, setShadowResults, isShadowSimulating, setIsShadowSimulating } = useStore();
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');

  const runShadowSimulation = async () => {
    if (!dataset) {
      toast.error('No dataset loaded. Please go to Scenario Library first.');
      return;
    }
    if (!selectedVersionId) {
      toast.error('Please select a production version to compare against.');
      return;
    }

    const prodVersion = versions.find(v => v.id === selectedVersionId);
    if (!prodVersion) return;

    setIsShadowSimulating(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/shadow-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_workflow: { nodes, edges },
          production_workflow: { nodes: prodVersion.nodes, edges: prodVersion.edges },
          dataset
        })
      });
      
      if (!response.ok) throw new Error('Shadow simulation failed');
      const data = await response.json();
      setShadowResults(data);
      toast.success('Shadow simulation complete!');
    } catch (error) {
      toast.error('Error running shadow simulation', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsShadowSimulating(false);
    }
  };

  if (versions.length === 0) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center h-full bg-background">
        <div className="text-center space-y-4 max-w-md">
          <Split className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">No Production Versions</h2>
          <p className="text-muted-foreground">
            To use Shadow Mode, you must first save your current workflow as a version in the Workflow Builder. 
            This acts as your "Production" baseline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-background text-foreground h-full">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shadow Mode</h2>
          <p className="text-muted-foreground mt-2">
            Compare your candidate workflow against an existing production rule on the same historical dataset.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select the production baseline to compare against.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Candidate Version</label>
              <div className="w-full p-2 rounded-md border bg-muted/30 text-sm text-muted-foreground">
                Current Canvas Configuration (Unsaved)
              </div>
              <p className="text-xs text-muted-foreground mt-1">This is the workflow currently drawn on your Workflow Builder canvas.</p>
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-medium">Production Version (Baseline)</label>
              <select 
                className="w-full p-2 rounded-md border bg-background text-sm mb-2"
                value={selectedVersionId}
                onChange={(e) => setSelectedVersionId(e.target.value)}
              >
                <option value="" disabled>Select a version...</option>
                {versions.map(v => (
                  <option key={v.id} value={v.id}>
                    v{v.version_number} - {v.description} ({new Date(v.timestamp).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <Button 
              className="w-full justify-start bg-primary text-primary-foreground font-semibold"
              onClick={runShadowSimulation}
              disabled={isShadowSimulating || !selectedVersionId}
            >
              {isShadowSimulating ? (
                <Activity className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {isShadowSimulating ? 'Simulating traffic...' : 'Run Shadow Simulation'}
            </Button>
          </CardContent>
        </Card>

        {shadowResults && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold">Shadow Results</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg bg-background shadow-sm">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Agreed Decisions</p>
                <p className="text-2xl font-bold">{shadowResults.agreed_count.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg bg-background shadow-sm">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Disagreed Decisions</p>
                <p className="text-2xl font-bold text-amber-500">{shadowResults.disagreed_count.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg bg-background shadow-sm">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Add. Fraud Caught</p>
                <p className={`text-2xl font-bold ${shadowResults.fraud_additionally_captured > 0 ? 'text-emerald-500' : ''}`}>
                  {shadowResults.fraud_additionally_captured > 0 ? '+' : ''}{shadowResults.fraud_additionally_captured}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-background shadow-sm">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Legit Users Blocked</p>
                <p className={`text-2xl font-bold ${shadowResults.legitimate_users_blocked > 0 ? 'text-destructive' : ''}`}>
                  {shadowResults.legitimate_users_blocked > 0 ? '+' : ''}{shadowResults.legitimate_users_blocked}
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Delta Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Metric</th>
                      <th className="px-4 py-3 font-semibold text-right">Difference (Candidate - Prod)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`border-b ${shadowResults.revenue_difference > 0 ? 'bg-emerald-500/10' : shadowResults.revenue_difference < 0 ? 'bg-destructive/10' : ''}`}>
                      <td className="px-4 py-3 font-medium">Revenue Protected</td>
                      <td className={`px-4 py-3 text-right font-bold ${shadowResults.revenue_difference > 0 ? 'text-emerald-500' : shadowResults.revenue_difference < 0 ? 'text-destructive' : ''}`}>
                        {shadowResults.revenue_difference > 0 ? '+' : ''}${shadowResults.revenue_difference.toLocaleString(undefined, {maximumFractionDigits:0})}
                      </td>
                    </tr>
                    <tr className={`border-b ${shadowResults.approval_rate_difference > 0 ? 'bg-emerald-500/10' : shadowResults.approval_rate_difference < 0 ? 'bg-destructive/10' : ''}`}>
                      <td className="px-4 py-3 font-medium">Approval Rate</td>
                      <td className={`px-4 py-3 text-right font-bold ${shadowResults.approval_rate_difference > 0 ? 'text-emerald-500' : shadowResults.approval_rate_difference < 0 ? 'text-destructive' : ''}`}>
                        {shadowResults.approval_rate_difference > 0 ? '+' : ''}{shadowResults.approval_rate_difference.toFixed(2)}%
                      </td>
                    </tr>
                    <tr className={`border-b ${shadowResults.false_positive_difference < 0 ? 'bg-emerald-500/10' : shadowResults.false_positive_difference > 0 ? 'bg-destructive/10' : ''}`}>
                      <td className="px-4 py-3 font-medium">False Positive Rate</td>
                      <td className={`px-4 py-3 text-right font-bold ${shadowResults.false_positive_difference < 0 ? 'text-emerald-500' : shadowResults.false_positive_difference > 0 ? 'text-destructive' : ''}`}>
                        {shadowResults.false_positive_difference > 0 ? '+' : ''}{shadowResults.false_positive_difference.toFixed(2)}%
                      </td>
                    </tr>
                    <tr className={`${shadowResults.latency_difference < 0 ? 'bg-emerald-500/10' : shadowResults.latency_difference > 0 ? 'bg-amber-500/10' : ''}`}>
                      <td className="px-4 py-3 font-medium">Latency</td>
                      <td className={`px-4 py-3 text-right font-bold ${shadowResults.latency_difference < 0 ? 'text-emerald-500' : shadowResults.latency_difference > 0 ? 'text-amber-500' : ''}`}>
                        {shadowResults.latency_difference > 0 ? '+' : ''}{shadowResults.latency_difference.toFixed(2)} ms
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className={`border-2 ${shadowResults.deployment_recommendation === 'Safe to Deploy' ? 'border-emerald-500' : shadowResults.deployment_recommendation === 'Needs Tuning' ? 'border-amber-500' : 'border-destructive'}`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  Deployment Summary
                  {shadowResults.deployment_recommendation === 'Safe to Deploy' && <Badge className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-sm"><CheckCircle className="w-4 h-4 mr-1"/> Safe to Deploy</Badge>}
                  {shadowResults.deployment_recommendation === 'Needs Tuning' && <Badge className="bg-amber-500 hover:bg-amber-600 px-3 py-1 text-sm"><AlertTriangle className="w-4 h-4 mr-1"/> Needs Tuning</Badge>}
                  {shadowResults.deployment_recommendation === 'High Risk' && <Badge variant="destructive" className="px-3 py-1 text-sm"><AlertTriangle className="w-4 h-4 mr-1"/> High Risk</Badge>}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
