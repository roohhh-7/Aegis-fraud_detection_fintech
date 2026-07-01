import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play, DollarSign, Globe, CheckCircle2, XCircle, AlertTriangle, History, Activity, Split, Trash2, X, Smartphone, Wifi, CreditCard, Store, Clock } from 'lucide-react';
import { NodeData } from './types';
import { useStore } from './store';

const baseNodeStyle = "group shadow-sm rounded-lg bg-card border relative text-sm w-[260px] transition-all hover:shadow-md";

const DeleteButton = ({ id }: { id: string }) => {
  const deleteNode = useStore(state => state.deleteNode);
  return (
    <button 
      className="absolute -top-2 -right-2 p-1 rounded-full bg-card border shadow-sm hover:bg-destructive hover:text-white opacity-0 group-hover:opacity-100 transition-all z-10 text-muted-foreground"
      onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
      title="Delete Node"
    >
      <X className="w-3 h-3 stroke-[3]" />
    </button>
  );
};

const NodeContent = ({ icon: Icon, title, description, colorClass, iconColorClass, children }: any) => (
  <div className="flex p-3 w-full">
    <div className={`flex-shrink-0 w-10 h-10 rounded-md border flex items-center justify-center ${colorClass}`}>
      <Icon className={`w-5 h-5 ${iconColorClass}`} />
    </div>
    <div className="ml-3 flex flex-col justify-center overflow-hidden flex-1">
      <span className="font-semibold text-sm tracking-tight truncate text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground truncate w-full">{description}</span>
    </div>
    {children}
  </div>
);

const RuleHandles = () => (
  <>
    <div className="absolute right-3 text-[10px] font-bold text-emerald-500" style={{ top: '30%', transform: 'translateY(-50%)' }}>True</div>
    <Handle type="source" position={Position.Right} id="true" className="!bg-emerald-500 !w-2.5 !h-2.5 !border-0" style={{ top: '30%', right: '-5px' }} />
    
    <div className="absolute right-3 text-[10px] font-bold text-destructive" style={{ top: '70%', transform: 'translateY(-50%)' }}>False</div>
    <Handle type="source" position={Position.Right} id="false" className="!bg-destructive !w-2.5 !h-2.5 !border-0" style={{ top: '70%', right: '-5px' }} />
  </>
);

export const StartNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <NodeContent 
      icon={Play} 
      title={data.label} 
      description="Every transaction enters here"
      colorClass="bg-blue-500/10 border-blue-500/20"
      iconColorClass="text-blue-500"
    />
    <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-2.5 !h-2.5 !border-0" style={{ right: '-5px' }} />
  </div>
));

export const AmountCheckNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={DollarSign} 
      title={data.label} 
      description={`${data.config?.operator === 'lt' ? '<' : data.config?.operator === 'eq' ? '=' : '>'} ${(data.config?.threshold || 1000).toLocaleString()}`}
      colorClass="bg-emerald-500/10 border-emerald-500/20"
      iconColorClass="text-emerald-500"
    >
      <RuleHandles />
    </NodeContent>
  </div>
));

export const CountryCheckNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={Globe} 
      title={data.label} 
      description={`Allowed: ${(data.config?.allowedCountries || []).join(', ') || 'None'}`}
      colorClass="bg-orange-500/10 border-orange-500/20"
      iconColorClass="text-orange-500"
    >
      <RuleHandles />
    </NodeContent>
  </div>
));

export const VelocityCheckNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={History} 
      title={data.label} 
      description={`${data.config?.transactionLimit || 5}+ in ${data.config?.timeWindowMinutes || 10}m`}
      colorClass="bg-purple-500/10 border-purple-500/20"
      iconColorClass="text-purple-500"
    >
      <RuleHandles />
    </NodeContent>
  </div>
));

export const AiScoreNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={Activity} 
      title={data.label} 
      description={`Score > ${data.config?.threshold || 85}`}
      colorClass="bg-pink-500/10 border-pink-500/20"
      iconColorClass="text-pink-500"
    >
      <RuleHandles />
    </NodeContent>
  </div>
));

export const DeviceFingerprintNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={Smartphone} 
      title={data.label} 
      description={`Risk > ${data.config?.threshold || 80}`}
      colorClass="bg-blue-500/10 border-blue-500/20"
      iconColorClass="text-blue-500"
    >
      <RuleHandles />
    </NodeContent>
  </div>
));

export const IpReputationNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={Wifi} 
      title={data.label} 
      description={`Risk > ${data.config?.threshold || 80}`}
      colorClass="bg-sky-500/10 border-sky-500/20"
      iconColorClass="text-sky-500"
    >
      <RuleHandles />
    </NodeContent>
  </div>
));

export const BinCheckNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={CreditCard} 
      title={data.label} 
      description={`Allowed: ${(data.config?.allowedCountries || []).join(', ') || 'None'}`}
      colorClass="bg-cyan-500/10 border-cyan-500/20"
      iconColorClass="text-cyan-500"
    >
      <RuleHandles />
    </NodeContent>
  </div>
));

export const MerchantRiskNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={Store} 
      title={data.label} 
      description={`Risk > ${data.config?.threshold || 80}`}
      colorClass="bg-amber-500/10 border-amber-500/20"
      iconColorClass="text-amber-500"
    >
      <RuleHandles />
    </NodeContent>
  </div>
));

export const BusinessHoursNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={Clock} 
      title={data.label} 
      description={`${data.config?.startHour || 9}:00 to ${data.config?.endHour || 17}:00`}
      colorClass="bg-slate-500/10 border-slate-500/20"
      iconColorClass="text-slate-500"
    >
      <RuleHandles />
    </NodeContent>
  </div>
));

export const SplitNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle}`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={Split} 
      title={data.label} 
      description={`A: ${data.config?.splitPercentage || 50}% / B: ${100 - (data.config?.splitPercentage || 50)}%`}
      colorClass="bg-blue-500/10 border-blue-500/20"
      iconColorClass="text-blue-500"
    >
      <div className="absolute right-3 text-[10px] font-bold text-blue-500" style={{ top: '30%', transform: 'translateY(-50%)' }}>Path A</div>
      <Handle type="source" position={Position.Right} id="pathA" className="!bg-blue-500 !w-2.5 !h-2.5 !border-0" style={{ top: '30%', right: '-5px' }} />
      
      <div className="absolute right-3 text-[10px] font-bold text-blue-500" style={{ top: '70%', transform: 'translateY(-50%)' }}>Path B</div>
      <Handle type="source" position={Position.Right} id="pathB" className="!bg-blue-500 !w-2.5 !h-2.5 !border-0" style={{ top: '70%', right: '-5px' }} />
    </NodeContent>
  </div>
));

export const ApproveNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle} border-emerald-500/30 bg-emerald-500/5`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-emerald-500 !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={CheckCircle2} 
      title={data.label} 
      description="Allow transaction"
      colorClass="bg-emerald-500/20 border-emerald-500/30"
      iconColorClass="text-emerald-500"
    />
  </div>
));

export const RejectNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle} border-destructive/30 bg-destructive/5`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-destructive !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={XCircle} 
      title={data.label} 
      description="Block transaction"
      colorClass="bg-destructive/20 border-destructive/30"
      iconColorClass="text-destructive"
    />
  </div>
));

export const ManualReviewNode = memo(({ id, data }: NodeProps<NodeData>) => (
  <div className={`${baseNodeStyle} border-amber-500/30 bg-amber-500/5`}>
    <DeleteButton id={id} />
    <Handle type="target" position={Position.Left} className="!bg-amber-500 !w-2 !h-2 !border-0" style={{ left: '-4px' }} />
    <NodeContent 
      icon={AlertTriangle} 
      title={data.label} 
      description="Needs review"
      colorClass="bg-amber-500/20 border-amber-500/30"
      iconColorClass="text-amber-500"
    />
  </div>
));

export const nodeTypes = {
  startNode: StartNode,
  amountCheckNode: AmountCheckNode,
  countryCheckNode: CountryCheckNode,
  velocityCheckNode: VelocityCheckNode,
  aiScoreNode: AiScoreNode,
  deviceFingerprintNode: DeviceFingerprintNode,
  ipReputationNode: IpReputationNode,
  binCheckNode: BinCheckNode,
  merchantRiskNode: MerchantRiskNode,
  businessHoursNode: BusinessHoursNode,
  splitNode: SplitNode,
  approveNode: ApproveNode,
  rejectNode: RejectNode,
  manualReviewNode: ManualReviewNode,
};
