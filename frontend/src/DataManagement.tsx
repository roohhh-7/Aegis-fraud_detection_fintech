import React, { useState } from 'react';
import { useStore } from './store';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Database, Upload, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Dataset } from './types';
import { toast } from 'sonner';

const SCENARIOS = [
  { id: 'normal', name: 'Normal Production Traffic' },
  { id: 'card_testing', name: 'Card Testing Attack' },
  { id: 'velocity', name: 'Velocity Fraud' },
  { id: 'ato', name: 'Account Takeover' },
  { id: 'high_value', name: 'High Value Fraud' },
  { id: 'international', name: 'International Fraud' },
  { id: 'mixed', name: 'Mixed Production Traffic' }
];

export const DataManagement = () => {
  const { dataset, setDataset, activeScenario, setActiveScenario } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const loadDemoDataset = async () => {
    setIsLoading(true);
    try {
      const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE_URL}/api/dataset/generate?scenario=${activeScenario}&count=10000`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate dataset');
      
      const data: Dataset = await response.json();
      setDataset(data);
      toast.success('Scenario dataset loaded successfully', {
        description: `Loaded 10,000 transactions for scenario: ${SCENARIOS.find(s => s.id === activeScenario)?.name}`,
      });
    } catch (error) {
      toast.error('Error generating dataset', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetDataset = () => {
    setDataset(null);
    toast.info('Dataset cleared');
  };

  const fraudCount = dataset?.transactions.filter(t => t.is_fraud_label).length || 0;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-background text-foreground h-full">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Scenario Library</h2>
          <p className="text-muted-foreground mt-2">
            Manage the transaction dataset used for rule simulation. 
            Select different fraud attack vectors to test your rules against.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-primary" />
                Current Dataset
              </CardTitle>
              <CardDescription>
                Overview of the currently loaded transactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dataset ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                      <p className="text-2xl font-bold">{dataset.transactions.length.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Fraud Labels</p>
                      <p className="text-2xl font-bold text-destructive">{fraudCount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Ready for simulation</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No dataset loaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Load a scenario or upload your own CSV file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Scenario</label>
                <select 
                  className="w-full p-2 rounded-md border bg-background text-sm mb-2"
                  value={activeScenario}
                  onChange={(e) => setActiveScenario(e.target.value)}
                >
                  {SCENARIOS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={loadDemoDataset}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Generating (takes a moment)...' : 'Load Scenario Dataset'}
              </Button>
              
              <Button className="w-full justify-start" variant="outline" disabled>
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV (Coming Soon)
              </Button>

              {dataset && (
                <Button 
                  className="w-full justify-start text-destructive hover:text-destructive" 
                  variant="ghost"
                  onClick={resetDataset}
                >
                  Clear Dataset
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
