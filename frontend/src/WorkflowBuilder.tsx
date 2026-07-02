import React, { useCallback, useRef, useState } from 'react';
import { Panel, Group, Separator } from "react-resizable-panels";
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, addEdge, useReactFlow, useViewport } from 'reactflow';
// @ts-ignore
import 'reactflow/dist/style.css';

import { useStore } from './store';
import { nodeTypes } from './nodes';
import { ReplayEdge } from './ReplayEdge';
import { Database, Settings, BarChart2, History, Save, Copy, Trash2, ArrowLeftRight, Play, Pause, Square, FastForward, Pencil, Play as PlayIcon, DollarSign, Globe, Activity, Smartphone, Wifi, CreditCard, Store, Clock, Split, CheckCircle2, XCircle, AlertTriangle, Undo, Redo, ZoomIn, ZoomOut, Maximize, Search, GripHorizontal } from 'lucide-react';
import { Button } from './components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const LibraryItem = ({ type, label, description, icon: Icon, colorClass, iconColorClass }: any) => {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type, label }));
    event.dataTransfer.effectAllowed = 'move';
  };
  return (
    <div 
      className="p-2 border rounded-md mb-2 text-sm bg-background cursor-grab flex items-center hover:bg-muted/50 transition-colors shadow-sm" 
      draggable 
      onDragStart={onDragStart}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded border flex items-center justify-center mr-3 ${colorClass}`}>
        <Icon className={`w-4 h-4 ${iconColorClass}`} />
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="font-semibold text-[13px] tracking-tight truncate">{label}</span>
        <span className="text-[10px] text-muted-foreground truncate">{description}</span>
      </div>
      <GripHorizontal className="w-4 h-4 ml-auto text-muted-foreground/30" />
    </div>
  );
};

const NodeLibrary = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const ALL_NODES = [
    { category: 'Triggers', type: 'startNode', label: 'Transaction Start', description: 'Starting point for every transaction', icon: PlayIcon, colorClass: "bg-blue-500/10 border-blue-500/20", iconColorClass: "text-blue-500" },
    { category: 'Rules', type: 'amountCheckNode', label: 'Amount Check', description: 'Check transaction amount', icon: DollarSign, colorClass: "bg-emerald-500/10 border-emerald-500/20", iconColorClass: "text-emerald-500" },
    { category: 'Rules', type: 'countryCheckNode', label: 'Country Check', description: 'Check billing country', icon: Globe, colorClass: "bg-orange-500/10 border-orange-500/20", iconColorClass: "text-orange-500" },
    { category: 'Rules', type: 'velocityCheckNode', label: 'Velocity Check', description: 'Check transaction velocity', icon: History, colorClass: "bg-purple-500/10 border-purple-500/20", iconColorClass: "text-purple-500" },
    { category: 'Rules', type: 'aiScoreNode', label: 'Risk Score', description: 'Evaluate overall risk score', icon: Activity, colorClass: "bg-pink-500/10 border-pink-500/20", iconColorClass: "text-pink-500" },
    
    { category: 'Rules', type: 'deviceFingerprintNode', label: 'Device Fingerprint', description: 'Check device risk score', icon: Smartphone, colorClass: "bg-blue-500/10 border-blue-500/20", iconColorClass: "text-blue-500" },
    { category: 'Rules', type: 'ipReputationNode', label: 'IP Reputation', description: 'Check IP reputation score', icon: Wifi, colorClass: "bg-sky-500/10 border-sky-500/20", iconColorClass: "text-sky-500" },
    { category: 'Rules', type: 'binCheckNode', label: 'BIN Check', description: 'Check card BIN information', icon: CreditCard, colorClass: "bg-cyan-500/10 border-cyan-500/20", iconColorClass: "text-cyan-500" },
    { category: 'Rules', type: 'merchantRiskNode', label: 'Merchant Risk', description: 'Check merchant risk score', icon: Store, colorClass: "bg-amber-500/10 border-amber-500/20", iconColorClass: "text-amber-500" },
    { category: 'Rules', type: 'businessHoursNode', label: 'Business Hours', description: 'Check if transaction in business hours', icon: Clock, colorClass: "bg-slate-500/10 border-slate-500/20", iconColorClass: "text-slate-500" },
    
    { category: 'Routing', type: 'splitNode', label: 'A/B Split', description: 'Route traffic dynamically', icon: Split, colorClass: "bg-blue-500/10 border-blue-500/20", iconColorClass: "text-blue-500" },
    
    { category: 'Actions', type: 'approveNode', label: 'Approve', description: 'Approve the transaction', icon: CheckCircle2, colorClass: "bg-emerald-500/5 border-emerald-500/30", iconColorClass: "text-emerald-500" },
    { category: 'Actions', type: 'rejectNode', label: 'Reject', description: 'Reject the transaction', icon: XCircle, colorClass: "bg-destructive/5 border-destructive/30", iconColorClass: "text-destructive" },
    { category: 'Actions', type: 'manualReviewNode', label: 'Manual Review', description: 'Send to manual review', icon: AlertTriangle, colorClass: "bg-amber-500/5 border-amber-500/30", iconColorClass: "text-amber-500" }
  ];

  let filteredNodes = ALL_NODES;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredNodes = ALL_NODES.filter(n => n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
  }

  const triggers = filteredNodes.filter(n => n.category === 'Triggers');
  const rules = filteredNodes.filter(n => n.category === 'Rules');
  const routing = filteredNodes.filter(n => n.category === 'Routing');
  const actions = filteredNodes.filter(n => n.category === 'Actions');

  return (
    <div className="h-full bg-card border-r flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <span className="font-semibold text-xs tracking-wider text-muted-foreground uppercase flex items-center"><ArrowLeftRight className="w-3 h-3 mr-2" /> Node Library</span>
      </div>
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            className="w-full pl-9 pr-3 py-2 bg-background border rounded-md text-sm" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="p-3 flex-1 overflow-y-auto">
        {triggers.length > 0 && <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Triggers</div>}
        {triggers.map(n => <LibraryItem key={n.type} {...n} />)}

        {rules.length > 0 && <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-2">Rules</div>}
        {rules.map(n => <LibraryItem key={n.type} {...n} />)}

        {routing.length > 0 && <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-2">Routing</div>}
        {routing.map(n => <LibraryItem key={n.type} {...n} />)}

        {actions.length > 0 && <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-2">Actions</div>}
        {actions.map(n => <LibraryItem key={n.type} {...n} />)}
        
        {filteredNodes.length === 0 && (
          <div className="text-center p-4 text-sm text-muted-foreground">
            No nodes found.
          </div>
        )}
      </div>
    </div>
  );
};

const getNodeMetadata = (type: string) => {
  switch (type) {
    case 'startNode': return { icon: PlayIcon, colorClass: "bg-blue-500/10 border-blue-500/20", iconColorClass: "text-blue-500" };
    case 'amountCheckNode': return { icon: DollarSign, colorClass: "bg-emerald-500/10 border-emerald-500/20", iconColorClass: "text-emerald-500" };
    case 'countryCheckNode': return { icon: Globe, colorClass: "bg-orange-500/10 border-orange-500/20", iconColorClass: "text-orange-500" };
    case 'velocityCheckNode': return { icon: History, colorClass: "bg-purple-500/10 border-purple-500/20", iconColorClass: "text-purple-500" };
    case 'deviceFingerprintNode': return { icon: Smartphone, colorClass: "bg-blue-500/10 border-blue-500/20", iconColorClass: "text-blue-500" };
    case 'ipReputationNode': return { icon: Wifi, colorClass: "bg-sky-500/10 border-sky-500/20", iconColorClass: "text-sky-500" };
    case 'binCheckNode': return { icon: CreditCard, colorClass: "bg-cyan-500/10 border-cyan-500/20", iconColorClass: "text-cyan-500" };
    case 'merchantRiskNode': return { icon: Store, colorClass: "bg-amber-500/10 border-amber-500/20", iconColorClass: "text-amber-500" };
    case 'businessHoursNode': return { icon: Clock, colorClass: "bg-slate-500/10 border-slate-500/20", iconColorClass: "text-slate-500" };
    case 'aiScoreNode': return { icon: Activity, colorClass: "bg-pink-500/10 border-pink-500/20", iconColorClass: "text-pink-500" };
    case 'splitNode': return { icon: Split, colorClass: "bg-blue-500/10 border-blue-500/20", iconColorClass: "text-blue-500" };
    case 'approveNode': return { icon: CheckCircle2, colorClass: "bg-emerald-500/5 border-emerald-500/30", iconColorClass: "text-emerald-500" };
    case 'rejectNode': return { icon: XCircle, colorClass: "bg-destructive/5 border-destructive/30", iconColorClass: "text-destructive" };
    case 'manualReviewNode': return { icon: AlertTriangle, colorClass: "bg-amber-500/5 border-amber-500/30", iconColorClass: "text-amber-500" };
    default: return { icon: Settings, colorClass: "bg-blue-500/10 border-blue-500/20", iconColorClass: "text-blue-500" };
  }
};

const ConfigPanel = () => {
  const { nodes, selectedNodeId, updateNodeConfig, deleteNode, setNodes, setEdges } = useStore();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Settings className="w-12 h-12 text-muted-foreground/50" />
        <h3 className="font-semibold text-lg">No Node Selected</h3>
        <p className="text-sm text-muted-foreground">Click on any node in the canvas to configure its rules and thresholds.</p>
        
        {nodes.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-6 border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the entire canvas?')) {
                setNodes([]);
                setEdges([]);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Canvas
          </Button>
        )}
      </div>
    );
  }

  const meta = getNodeMetadata(selectedNode.type!);
  const Icon = meta.icon;

  return (
    <div className="flex-1 overflow-y-auto p-0">
      <div className="p-4 border-b bg-card">
        <div className="flex items-center mb-3">
          <div className={`w-10 h-10 rounded border flex items-center justify-center mr-3 ${meta.colorClass}`}>
            <Icon className={`w-5 h-5 ${meta.iconColorClass}`} />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">{selectedNode.data.label}</h3>
            <p className="text-xs text-muted-foreground">Rule Node</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {(() => {
              switch (selectedNode.type) {
                case 'startNode': return "Starting point for every transaction.";
                case 'amountCheckNode': return "Check transaction amount against a specified threshold.";
                case 'countryCheckNode': return "Check if billing country is in the allowed list.";
                case 'velocityCheckNode': return "Check transaction velocity over a specific time window.";
                case 'deviceFingerprintNode': return "Evaluate device risk score from device fingerprinting.";
                case 'ipReputationNode': return "Evaluate IP address reputation and risk score.";
                case 'binCheckNode': return "Check card BIN information against allowed countries.";
                case 'merchantRiskNode': return "Evaluate the merchant's risk profile and score.";
                case 'businessHoursNode': return "Check if transaction occurs within specified business hours.";
                case 'aiScoreNode': return "Evaluate overall AI-driven fraud risk score.";
                case 'splitNode': return "Route traffic dynamically across multiple paths for A/B testing.";
                case 'approveNode': return "Approve the transaction and terminate the flow.";
                case 'rejectNode': return "Reject the transaction and terminate the flow.";
                case 'manualReviewNode': return "Send transaction to the queue for manual review by analysts.";
                default: return "Configure rule criteria for this node.";
              }
            })()}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Threshold</label>
          
          {selectedNode.type === 'amountCheckNode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Operator</label>
                <select 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={selectedNode.data.config?.operator || 'gt'}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { operator: e.target.value })}
                >
                  <option value="gt">Greater Than (&gt;)</option>
                  <option value="lt">Less Than (&lt;)</option>
                  <option value="eq">Equals (=)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Amount ($)</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={selectedNode.data.config?.threshold || 1000}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { threshold: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'countryCheckNode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Allowed Countries (Comma separated)</label>
                <input 
                  type="text" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={(selectedNode.data.config?.allowedCountries || ['US', 'CA', 'GB']).join(', ')}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { 
                    allowedCountries: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                  })}
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'velocityCheckNode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Time Window (Minutes)</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={selectedNode.data.config?.timeWindowMinutes || 10}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { timeWindowMinutes: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Transaction Limit</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={selectedNode.data.config?.transactionLimit || 5}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { transactionLimit: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'aiScoreNode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Risk Score Threshold (1-100)</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={selectedNode.data.config?.threshold || 85}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { threshold: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'deviceFingerprintNode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Device Risk Score Threshold</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={selectedNode.data.config?.threshold || 80}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { threshold: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'ipReputationNode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">IP Risk Score Threshold</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={selectedNode.data.config?.threshold || 80}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { threshold: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'binCheckNode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Allowed BIN Countries (Comma separated)</label>
                <input 
                  type="text" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={(selectedNode.data.config?.allowedCountries || ['US', 'CA', 'GB']).join(', ')}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { 
                    allowedCountries: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                  })}
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'merchantRiskNode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Merchant Risk Score Threshold</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={selectedNode.data.config?.threshold || 80}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { threshold: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'businessHoursNode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Start Hour (0-23)</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={selectedNode.data.config?.startHour || 9}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { startHour: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">End Hour (0-23)</label>
                <input 
                  type="number" 
                  className="w-full p-2 rounded-md border bg-background text-sm"
                  value={selectedNode.data.config?.endHour || 17}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { endHour: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}

          {selectedNode.type === 'splitNode' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Traffic Allocation (Path A %)</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="range" 
                    min="0" max="100"
                    className="flex-1"
                    value={selectedNode.data.config?.splitPercentage || 50}
                    onChange={(e) => updateNodeConfig(selectedNode.id, { splitPercentage: parseInt(e.target.value) })}
                  />
                  <span className="text-sm font-bold w-12">{selectedNode.data.config?.splitPercentage || 50}%</span>
                </div>
              </div>
            </div>
          )}
          
          {['startNode', 'approveNode', 'rejectNode', 'manualReviewNode'].includes(selectedNode.type!) && (
            <p className="text-sm text-muted-foreground p-3 border rounded bg-background">No configuration needed for this node type.</p>
          )}
        </div>
        
        {/* Mockup visual elements for actions */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Action on True</label>
            <div className="w-full p-2 rounded-md border bg-background text-sm text-foreground flex justify-between items-center cursor-not-allowed opacity-70">
              Continue to next rule <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Action on False</label>
            <div className="w-full p-2 rounded-md border bg-background text-sm text-foreground flex justify-between items-center cursor-not-allowed opacity-70">
              Continue to next rule <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full hover:bg-black hover:text-white transition-colors"
            onClick={() => deleteNode(selectedNode.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Node
          </Button>
        </div>
      </div>
    </div>
  );
};

const VersionsPanel = () => {
  const { versions, saveVersion, restoreVersion, deleteVersion, renameVersion, simulationResults } = useStore();
  const [desc, setDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');

  const handleSave = () => {
    if (!desc) {
      toast.error('Please enter a version description');
      return;
    }
    saveVersion(desc, simulationResults?.kpis);
    setDesc('');
    toast.success('Version saved successfully');
  };

  const handleRestore = (id: string) => {
    restoreVersion(id);
    toast.info('Version restored to canvas');
  };
  
  const handleRename = (id: string) => {
    if (editDesc.trim()) {
      renameVersion(id, editDesc.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b space-y-3">
        <label className="text-sm font-medium">Save Current Workflow</label>
        <input 
          type="text" 
          placeholder="e.g. Added high value check"
          className="w-full p-2 rounded-md border bg-background text-sm"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <Button className="w-full" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Save Version
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saved Versions</h4>
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <History className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-sm font-medium">No versions saved yet.</p>
            <p className="text-xs text-muted-foreground">Save your workflow to compare it in Shadow Mode.</p>
          </div>
        ) : (
          versions.map(v => (
            <div key={v.id} className="p-3 border rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">v{v.version_number}</span>
                <span className="text-xs text-muted-foreground">{new Date(v.timestamp).toLocaleDateString()}</span>
              </div>
              
              {editingId === v.id ? (
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    className="flex-1 p-1 rounded-md border bg-background text-sm"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(v.id)}
                    autoFocus
                  />
                  <Button size="sm" className="h-7 px-2" onClick={() => handleRename(v.id)}>Save</Button>
                </div>
              ) : (
                <div className="group flex items-center justify-between">
                  <p className="text-sm truncate mr-2">{v.description}</p>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0" onClick={() => { setEditingId(v.id); setEditDesc(v.description); }}>
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center space-x-1 pt-2">
                <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => handleRestore(v.id)}>
                  <Copy className="w-3 h-3 mr-1" /> Restore
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 flex-shrink-0" onClick={() => deleteVersion(v.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const RightSidebar = () => {
  const [activeTab, setActiveTab] = React.useState<'config' | 'versions'>('config');

  return (
    <div className="h-full bg-card border-l flex flex-col">
      <div className="flex border-b bg-muted/30">
        <button 
          className={`flex-1 p-3 text-[13px] font-medium flex items-center justify-center ${activeTab === 'config' ? 'bg-card border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('config')}
        >
          <Settings className="w-4 h-4 mr-2" /> Config
        </button>
        <button 
          className={`flex-1 p-3 text-[13px] font-medium flex items-center justify-center ${activeTab === 'versions' ? 'bg-card border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('versions')}
        >
          <History className="w-4 h-4 mr-2" /> Versions
        </button>
      </div>
      
      {activeTab === 'config' ? <ConfigPanel /> : <VersionsPanel />}
    </div>
  );
};

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const AnalyticsConsole = () => {
  const { simulationResults, playbackState, setPlaybackState, inspectedTransactionId, setInspectedTransactionId } = useStore();
  const [activeTab, setActiveTab] = React.useState<'analytics' | 'replay' | 'logs'>('analytics');

  const renderTabs = () => (
    <div className="flex border-b bg-background">
      <button 
        onClick={() => setActiveTab('analytics')}
        className={`px-4 py-3 text-[13px] font-medium border-b-2 flex items-center ${activeTab === 'analytics' ? 'border-primary text-primary bg-card' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
      >
        <BarChart2 className="w-4 h-4 mr-2" /> Analytics Console
      </button>
      <button 
        onClick={() => setActiveTab('replay')}
        className={`px-4 py-3 text-[13px] font-medium border-b-2 flex items-center ${activeTab === 'replay' ? 'border-primary text-primary bg-card' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
      >
        <History className="w-4 h-4 mr-2" /> Transaction Replay
      </button>
      <button 
        onClick={() => setActiveTab('logs')}
        className={`px-4 py-3 text-[13px] font-medium border-b-2 flex items-center ${activeTab === 'logs' ? 'border-primary text-primary bg-card' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
      >
        <Database className="w-4 h-4 mr-2" /> Logs
      </button>
    </div>
  );

  if (!simulationResults) {
    return (
      <div className="h-full bg-background border-t flex flex-col relative z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {renderTabs()}
        <div className="p-4 flex-1 overflow-y-auto flex h-full items-center justify-center bg-card">
          <p className="text-sm text-muted-foreground">Run a simulation to view analytics.</p>
        </div>
      </div>
    );
  }

  const { kpis, results } = simulationResults;
  
  const funnelData = [
    { name: 'Approved', value: kpis.approvalRate },
    { name: 'Rejected', value: 100 - kpis.approvalRate - kpis.manualReviewRate },
    { name: 'Manual Review', value: kpis.manualReviewRate },
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  const renderContent = () => {
    if (activeTab === 'replay') {
      return (
        <div className="p-4 flex-1 overflow-y-auto bg-card">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Simulated Transactions</h4>
              <p className="text-xs text-muted-foreground">Click a transaction to trace its path</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {results.slice(0, 50).map(tx => (
                <div 
                  key={tx.transaction_id} 
                  onClick={() => setInspectedTransactionId(inspectedTransactionId === tx.transaction_id ? null : tx.transaction_id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-between ${inspectedTransactionId === tx.transaction_id ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary))]' : 'bg-background hover:border-primary/50'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${tx.decision === 'APPROVE' ? 'bg-emerald-500' : tx.decision === 'REJECT' ? 'bg-destructive' : 'bg-amber-500'}`} />
                    <div>
                      <p className="text-sm font-bold font-mono text-foreground/80">{tx.transaction_id.split('-')[0]}</p>
                      <p className="text-xs text-muted-foreground">Amount: ${tx.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[11px] font-bold uppercase ${tx.decision === 'APPROVE' ? 'text-emerald-500' : tx.decision === 'REJECT' ? 'text-destructive' : 'text-amber-500'}`}>{tx.decision}</p>
                    <p className="text-[10px] text-muted-foreground">Risk: {tx.risk_score.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'logs') {
      return (
        <div className="p-4 flex-1 overflow-y-auto bg-[#0a0a0a] text-green-500 font-mono text-xs">
          <div className="space-y-1 opacity-90 max-w-4xl mx-auto">
            <p className="text-muted-foreground mb-4">Aegis Engine v2.4.1 Console</p>
            <p>&gt; [SYSTEM] Initializing simulation engine...</p>
            <p>&gt; [SYSTEM] Loaded workflow configuration: {results.length} nodes active.</p>
            <p>&gt; [INFO] Ingesting {kpis.totalTransactions.toLocaleString()} test transactions from historical dataset.</p>
            <p>&gt; [INFO] Running shadow simulation pipeline...</p>
            <p>&gt; [INFO] Simulation completed in {(kpis.averageDecisionTimeMs * 1.5).toFixed(2)}ms.</p>
            <p>&gt; [METRICS] Aggregate Results Computed.</p>
            <br />
            {results.slice(0, 30).map((tx, i) => (
              <p key={i} className={tx.decision === 'REJECT' ? 'text-red-400' : tx.decision === 'APPROVE' ? 'text-green-500' : 'text-yellow-400'}>
                &gt; [EVAL] Txn {tx.transaction_id} routed to {tx.decision} (Risk Score: {tx.risk_score.toFixed(1)})
              </p>
            ))}
            <p className="animate-pulse mt-4">_</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 flex-1 overflow-y-auto flex space-x-6 bg-card">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 h-fit">
          <div className="p-4 border rounded-lg bg-background flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] text-foreground font-semibold">Total Transactions</p>
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{kpis.totalTransactions.toLocaleString()}</p>
            <p className="text-xs text-primary mt-1 hover:underline cursor-pointer" onClick={() => setActiveTab('replay')}>View all transactions</p>
          </div>
          <div className="p-4 border rounded-lg bg-background flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] text-foreground font-semibold">Fraud Capture Rate</p>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{kpis.fraudCaptureRate.toFixed(1)}%</p>
            <p className="text-xs text-emerald-500 mt-1 font-medium">+4.3% vs production</p>
          </div>
          <div className="p-4 border rounded-lg bg-background flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] text-foreground font-semibold">False Positive Rate</p>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{kpis.falsePositiveRate.toFixed(1)}%</p>
            <p className="text-xs text-emerald-500 mt-1 font-medium">+1.2% vs production</p>
          </div>
          <div className="p-4 border rounded-lg bg-background flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] text-foreground font-semibold">Approval Rate</p>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{kpis.approvalRate.toFixed(1)}%</p>
            <p className="text-xs text-destructive mt-1 font-medium">-0.4% vs production</p>
          </div>
          <div className="p-4 border rounded-lg bg-background flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] text-foreground font-semibold">Revenue Protected</p>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">₹{kpis.revenueProtected > 1000000 ? (kpis.revenueProtected / 1000000).toFixed(2) + 'M' : kpis.revenueProtected.toLocaleString()}</p>
            <p className="text-xs text-emerald-500 mt-1 font-medium">+₹186K vs production</p>
          </div>
          <div className="p-4 border rounded-lg bg-background flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] text-foreground font-semibold">Avg Decision Time</p>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{kpis.averageDecisionTimeMs.toFixed(1)}ms</p>
            <p className="text-xs text-emerald-500 mt-1 font-medium">+2.1ms vs production</p>
          </div>
        </div>
        
        <div className="w-64 border rounded-lg bg-background p-4 flex flex-col items-center justify-center">
          <p className="text-[11px] text-foreground mb-2 font-semibold self-start">Outcome Distribution</p>
          <div className="w-full h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funnelData}
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex text-[10px] w-full justify-between mt-2 text-muted-foreground font-medium">
             <span className="text-emerald-500 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"/> Approve</span>
             <span className="text-destructive flex items-center"><span className="w-2 h-2 rounded-full bg-destructive mr-1"/> Reject</span>
             <span className="text-amber-500 flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1"/> Manual</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-background border-t flex flex-col relative z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      {renderTabs()}
      {renderContent()}
    </div>
  );
};

const edgeTypes = {
  replayEdge: ReplayEdge
};

const PlaybackBar = () => {
  const { playbackState, setPlaybackState, playbackSpeed, setPlaybackSpeed } = useStore();
  
  if (playbackState === 'stopped') return null;
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card border rounded-full shadow-2xl px-6 py-3 flex items-center space-x-6 z-50 animate-in slide-in-from-bottom-10">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={() => setPlaybackState(playbackState === 'playing' ? 'paused' : 'playing')} className="rounded-full h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20">
          {playbackState === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setPlaybackState('stopped')} className="rounded-full h-10 w-10 text-muted-foreground hover:bg-muted">
          <Square className="w-4 h-4 fill-current" />
        </Button>
      </div>
      
      <div className="w-px h-6 bg-border" />
      
      <div className="flex items-center space-x-2">
        <FastForward className="w-4 h-4 text-muted-foreground" />
        <div className="flex space-x-1 bg-muted/50 p-1 rounded-full">
          {[1, 2, 5].map(speed => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${playbackSpeed === speed ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const WorkflowCanvasInner = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges, setSelectedNodeId, selectedNodeId, deleteNode, simulationResults, inspectedTransactionId, playbackState } = useStore();
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  const handleCopy = () => {
    if (!selectedNodeId) {
      toast.error('Select a node to copy');
      return;
    }
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    if (selectedNode) {
      const newNode = {
        ...selectedNode,
        id: uuidv4(),
        position: { x: selectedNode.position.x + 50, y: selectedNode.position.y + 50 },
      };
      setNodes([...nodes, newNode]);
      setSelectedNodeId(newNode.id);
      toast.success('Node copied');
    }
  };

  const handleDelete = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
      toast.success('Node deleted');
    } else {
      if (window.confirm('Clear entire canvas?')) {
        setNodes([]);
        setEdges([]);
        toast.success('Canvas cleared');
      }
    }
  };

  
  // Apply visual overrides for inspected transaction
  const renderNodes = React.useMemo(() => {
    if (!inspectedTransactionId || !simulationResults) return nodes;
    
    const tResult = simulationResults.results.find(r => r.transaction_id === inspectedTransactionId);
    if (!tResult) return nodes;
    
    const pathSet = new Set(tResult.path);
    
    return nodes.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: pathSet.has(n.id) ? 1 : 0.3,
        boxShadow: pathSet.has(n.id) ? '0 0 0 2px hsl(var(--primary))' : undefined,
      }
    }));
  }, [nodes, inspectedTransactionId, simulationResults]);

  const renderEdges = React.useMemo(() => {
    if (inspectedTransactionId && simulationResults) {
      const tResult = simulationResults.results.find(r => r.transaction_id === inspectedTransactionId);
      if (tResult) {
        const pathSet = new Set(tResult.path);
        return edges.map(e => {
          const isInPath = pathSet.has(e.source) && pathSet.has(e.target);
          return {
            ...e,
            animated: isInPath,
            style: {
              ...e.style,
              stroke: isInPath ? 'hsl(var(--primary))' : '#555',
              opacity: isInPath ? 1 : 0.2,
              strokeWidth: isInPath ? 3 : 1
            }
          };
        });
      }
    }
    
    if (playbackState !== 'stopped' && simulationResults) {
      return edges.map(e => {
        // Compute particles
        const txns = simulationResults.results.filter(r => {
          const sIdx = r.path.indexOf(e.source);
          return sIdx !== -1 && r.path[sIdx + 1] === e.target;
        });
        
        const count = Math.min(10, Math.ceil(txns.length / 10));
        let color = '#10b981';
        
        if (txns.length > 0) {
          const rejects = txns.filter(t => t.decision === 'REJECT').length;
          const approves = txns.filter(t => t.decision === 'APPROVE').length;
          const manuals = txns.filter(t => t.decision === 'MANUAL_REVIEW').length;
          if (rejects > approves && rejects > manuals) color = '#ef4444';
          else if (manuals > approves) color = '#f59e0b';
        }

        const particles = Array.from({length: count}).map(() => ({
          color,
          duration: 3 + Math.random() * 2,
          delay: Math.random() * 4
        }));

        return {
          ...e,
          type: 'replayEdge',
          data: {
            ...e.data,
            particles
          }
        };
      });
    }
    
    return edges;
  }, [edges, inspectedTransactionId, simulationResults, playbackState]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const typeData = event.dataTransfer.getData('application/reactflow');
      if (!typeData) return;

      const { type, label } = JSON.parse(typeData);

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: uuidv4(),
        type,
        position,
        data: { label, config: {} },
      };

      setNodes([...nodes, newNode]);
    },
    [screenToFlowPosition, nodes, setNodes]
  );

  return (
    <div className="h-full w-full relative" ref={reactFlowWrapper}>
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <span className="font-semibold text-sm">Workflow: High Value Velocity Check</span>
          <Pencil className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground" />
        </div>
        <div className="flex items-center space-x-2 pointer-events-auto">
          <span className="text-xs text-muted-foreground flex items-center mr-4"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" /> Auto-saved 2 min ago</span>
          <div className="flex items-center bg-card border rounded-md p-1 shadow-sm space-x-1">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => toast.info('Undo feature in development')}><Undo className="w-3.5 h-3.5 text-muted-foreground" /></Button>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => toast.info('Redo feature in development')}><Redo className="w-3.5 h-3.5 text-muted-foreground" /></Button>
            <div className="w-px h-4 bg-border" />
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleDelete}><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleCopy}><Copy className="w-3.5 h-3.5 text-muted-foreground" /></Button>
            <div className="w-px h-4 bg-border" />
            <span className="text-[10px] font-semibold text-primary px-2">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => zoomIn()}><ZoomIn className="w-3.5 h-3.5 text-muted-foreground" /></Button>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => zoomOut()}><ZoomOut className="w-3.5 h-3.5 text-muted-foreground" /></Button>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => fitView({ duration: 800 })}><Maximize className="w-3.5 h-3.5 text-muted-foreground" /></Button>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={renderNodes}
        edges={renderEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={() => console.log('flow init')}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onSelectionChange={useCallback(({ nodes }) => {
          if (nodes.length > 0) {
            setSelectedNodeId(nodes[0].id);
          } else {
            setSelectedNodeId(null);
          }
        }, [setSelectedNodeId])}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} color="#333" />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'approveNode') return '#10b981';
            if (node.type === 'rejectNode') return '#ef4444';
            if (node.type === 'manualReviewNode') return '#f59e0b';
            return 'transparent';
          }}
          nodeStrokeColor={(node) => {
            if (node.type === 'approveNode') return '#10b981';
            if (node.type === 'rejectNode') return '#ef4444';
            if (node.type === 'manualReviewNode') return '#f59e0b';
            return '#3b82f6'; // Primary blue
          }}
          nodeStrokeWidth={3}
          maskColor="var(--minimap-mask)"
          style={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))', 
            borderRadius: '0.5rem',
            overflow: 'hidden'
          }}
        />
      </ReactFlow>
      
      <PlaybackBar />
    </div>
  );
};

export const WorkflowBuilder = () => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-64 flex-shrink-0 relative z-10 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)] bg-card border-r">
        <NodeLibrary />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
        <Group orientation="vertical" className="h-full flex-1">
          <Panel defaultSize={70} minSize={40} className="min-h-0 relative h-full flex flex-col">
            <ReactFlowProvider>
              <WorkflowCanvasInner />
            </ReactFlowProvider>
          </Panel>
          
          <Separator className="h-1 bg-border/50 hover:bg-primary/50 transition-colors cursor-row-resize active:bg-primary z-20 relative flex items-center justify-center">
            <div className="w-6 h-1 rounded-full bg-border pointer-events-none" />
          </Separator>
          
          <Panel defaultSize={30} minSize={15} collapsible={true} className="flex-shrink-0 relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <AnalyticsConsole />
          </Panel>
        </Group>
      </div>
      
      <div className="w-80 flex-shrink-0 relative z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)] bg-card border-l">
        <RightSidebar />
      </div>
    </div>
  );
};
