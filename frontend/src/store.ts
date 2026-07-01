import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { Dataset, SimulationResponse, RiskflowNode, RiskflowEdge, WorkflowVersion, ShadowSimulationResponse } from './types';

interface AppState {
  // Workflow state
  nodes: RiskflowNode[];
  edges: RiskflowEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeConfig: (id: string, config: any) => void;
  setNodes: (nodes: RiskflowNode[]) => void;
  setEdges: (edges: RiskflowEdge[]) => void;
  deleteNode: (id: string) => void;
  
  // Data state
  dataset: Dataset | null;
  setDataset: (dataset: Dataset | null) => void;
  
  // Simulation State
  isSimulating: boolean;
  simulationResults: SimulationResponse | null;
  setIsSimulating: (isSimulating: boolean) => void;
  setSimulationResults: (results: SimulationResponse | null) => void;
  
  // UI State
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  
  // Versioning
  versions: WorkflowVersion[];
  saveVersion: (description: string, metrics?: any) => void;
  restoreVersion: (id: string) => void;
  deleteVersion: (id: string) => void;
  renameVersion: (id: string, description: string) => void;
  
  // Scenario State
  activeScenario: string;
  setActiveScenario: (scenario: string) => void;

  // Shadow Mode State
  shadowResults: ShadowSimulationResponse | null;
  setShadowResults: (results: ShadowSimulationResponse | null) => void;
  isShadowSimulating: boolean;
  setIsShadowSimulating: (isSimulating: boolean) => void;

  // Transaction Inspection
  inspectedTransactionId: string | null;
  setInspectedTransactionId: (id: string | null) => void;
  
  // Playback State
  playbackState: 'stopped' | 'playing' | 'paused';
  setPlaybackState: (state: 'stopped' | 'playing' | 'paused') => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

const initialNodes: RiskflowNode[] = [
  { id: 'start', type: 'startNode', position: { x: 50, y: 150 }, data: { label: 'Transaction Start', config: {} } },
  { id: 'amount', type: 'amountCheckNode', position: { x: 300, y: 150 }, data: { label: 'Amount Check', config: { operator: 'gt', threshold: 1000 } } },
  { id: 'approve', type: 'approveNode', position: { x: 600, y: 50 }, data: { label: 'Approve', config: {} } },
  { id: 'reject', type: 'rejectNode', position: { x: 600, y: 250 }, data: { label: 'Reject', config: {} } }
];

const initialEdges: RiskflowEdge[] = [
  { id: 'e1', source: 'start', target: 'amount', sourceHandle: 'out' },
  { id: 'e2', source: 'amount', target: 'reject', sourceHandle: 'true' },
  { id: 'e3', source: 'amount', target: 'approve', sourceHandle: 'false' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,
      
      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as RiskflowNode[],
        });
      },
      
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges) as RiskflowEdge[],
        });
      },
      
      onConnect: (connection: Connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },
      
      updateNodeConfig: (id: string, config: any) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  config: { ...node.data.config, ...config },
                },
              };
            }
            return node;
          }),
        });
      },
      
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      deleteNode: (id) => set((state) => ({
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
      })),
      
      dataset: null,
      setDataset: (dataset) => set({ dataset }),
      
      isSimulating: false,
      simulationResults: null,
      setIsSimulating: (isSimulating) => set({ isSimulating }),
      setSimulationResults: (simulationResults) => set({ simulationResults }),
      
      selectedNodeId: null,
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
      
      versions: [],
      saveVersion: (description, metrics) => set((state) => ({
        versions: [...state.versions, {
          id: Math.random().toString(36).substring(7),
          version_number: state.versions.length + 1,
          timestamp: new Date().toISOString(),
          description,
          nodes: state.nodes,
          edges: state.edges,
          metrics
        }]
      })),
      restoreVersion: (id) => set((state) => {
        const v = state.versions.find(v => v.id === id);
        if (v) return { nodes: v.nodes, edges: v.edges };
        return {};
      }),
      deleteVersion: (id) => set((state) => ({
        versions: state.versions.filter(v => v.id !== id)
      })),
      renameVersion: (id, description) => set((state) => ({
        versions: state.versions.map(v => v.id === id ? { ...v, description } : v)
      })),
      
      activeScenario: 'normal',
      setActiveScenario: (activeScenario) => set({ activeScenario }),
      
      shadowResults: null,
      setShadowResults: (shadowResults) => set({ shadowResults }),
      isShadowSimulating: false,
      setIsShadowSimulating: (isShadowSimulating) => set({ isShadowSimulating }),
      
      inspectedTransactionId: null,
      setInspectedTransactionId: (id) => set({ inspectedTransactionId: id }),
      
      playbackState: 'stopped',
      setPlaybackState: (state) => set({ playbackState: state }),
      playbackSpeed: 1,
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
    }),
    {
      name: 'riskflow-storage-v2',
      partialize: (state) => ({ 
        nodes: state.nodes, 
        edges: state.edges,
        versions: state.versions,
        activeScenario: state.activeScenario
      }),
    }
  )
);
