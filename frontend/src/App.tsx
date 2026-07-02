import React, { useState } from 'react';

import { useStore } from './store';
import { Button } from './components/ui/button';
import { Play, Database, Settings, LayoutDashboard, Shield, Sun, Moon, Save, Split } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Badge } from './components/ui/badge';
import { DataManagement } from './DataManagement';
import { WorkflowBuilder } from './WorkflowBuilder';
import { ShadowMode } from './ShadowMode';
import { RuleEffectiveness } from './RuleEffectiveness';

type ViewType = 'workflow' | 'data' | 'shadow' | 'analytics';

const TopNav = ({ currentView, setCurrentView, isDark, setIsDark }: { currentView: ViewType, setCurrentView: (v: ViewType) => void, isDark: boolean, setIsDark: (v: boolean) => void }) => {
  const { nodes, edges, dataset, setIsSimulating, setSimulationResults } = useStore();

  const runSimulation = async () => {
    if (!dataset) {
      toast.error('No dataset loaded. Please go to Scenario Library first.');
      return;
    }
    
    setIsSimulating(true);
    try {
      const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: { nodes, edges },
          dataset
        })
      });
      
      if (!response.ok) throw new Error('Simulation failed');
      const data = await response.json();
      setSimulationResults(data);
      toast.success('Simulation complete!');
    } catch (error) {
      toast.error('Error running simulation', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="h-14 border-b flex items-center justify-between px-4 bg-card z-10 relative shadow-sm">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-primary fill-primary" />
        <span className="font-bold text-lg tracking-tight cursor-pointer" onClick={() => setCurrentView('workflow')}>Aegis Engine</span>
        <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground border-transparent rounded-sm font-medium hover:bg-muted/80">Fraud Experimentation</Badge>
      </div>
      
      <div className="flex items-center space-x-6 absolute left-1/2 -translate-x-1/2 h-full">
        <button 
          className={`flex items-center text-[13px] font-medium h-full border-b-2 transition-colors ${currentView === 'workflow' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`} 
          onClick={() => setCurrentView('workflow')}
        >
          <Settings className="w-4 h-4 mr-2" /> Build Rule
        </button>
        <button 
          className={`flex items-center text-[13px] font-medium h-full border-b-2 transition-colors ${currentView === 'data' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`} 
          onClick={() => setCurrentView('data')}
        >
          <Database className="w-4 h-4 mr-2" /> Scenario Library
        </button>
        <button 
          className={`flex items-center text-[13px] font-medium h-full border-b-2 transition-colors ${currentView === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`} 
          onClick={() => setCurrentView('analytics')}
        >
          <LayoutDashboard className="w-4 h-4 mr-2" /> Rule Effectiveness
        </button>
        <button 
          className={`flex items-center text-[13px] font-medium h-full border-b-2 transition-colors ${currentView === 'shadow' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`} 
          onClick={() => setCurrentView('shadow')}
        >
          <Split className="w-4 h-4 mr-2" /> Compare with Production
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="h-8 w-8">
          {isDark ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
        </Button>
        <Button variant="outline" size="sm" className="h-8 bg-card">
          <Save className="w-4 h-4 mr-2" /> Save
        </Button>
        <Button variant="default" size="sm" className="bg-primary text-primary-foreground font-semibold h-8" onClick={runSimulation}>
          <Play className="h-4 w-4 mr-2" />
          Run Simulation
        </Button>
      </div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState<'workflow' | 'data' | 'shadow' | 'analytics'>('workflow');
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground ${isDark ? 'dark' : ''}`}>
      <TopNav currentView={currentView} setCurrentView={setCurrentView} isDark={isDark} setIsDark={setIsDark} />
      
      {currentView === 'data' && <DataManagement />}
      {currentView === 'workflow' && <WorkflowBuilder />}
      {currentView === 'shadow' && <ShadowMode />}
      {currentView === 'analytics' && <RuleEffectiveness />}
      
      <Toaster theme={isDark ? 'dark' : 'light'} position="bottom-right" />
    </div>
  );
}

export default App;
