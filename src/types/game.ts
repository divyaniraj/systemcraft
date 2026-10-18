export type ComponentType = 
  | 'client' 
  | 'load_balancer' 
  | 'compute' 
  | 'cache' 
  | 'database' 
  | 'queue';

export interface ComponentSpecs {
  type: ComponentType;
  title: string;
  subtitle: string;
  costPerMonth: number;
  maxRPS: number;
  baseLatencyMs: number;
  unlockedAtLevel: number;
  iconName: string;
  description: string;
}

export interface SystemNodeData extends Record<string, unknown> {
  id: string;
  type: ComponentType;
  label: string;
  costPerMonth: number;
  maxRPS: number;
  currentRPS: number;
  baseLatencyMs: number;
  status: 'healthy' | 'warning' | 'critical' | 'idle';
  loadPercent: number; // 0 - 100
  details?: Record<string, string | number>;
}

export interface TelemetryMetrics {
  currentRPS: number;
  targetRPS: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  slaP99Ms: number;
  errorRatePercent: number;
  monthlyCost: number;
  budgetLimit: number;
  bottleneckNodeId: string | null;
  status: 'passing' | 'warning' | 'failing';
}

export interface LevelDefinition {
  id: number;
  round: number;
  title: string;
  subtitle: string;
  description: string;
  interviewerBrief: string;
  targetRPS: number;
  surgeRPS: number;
  slaP99Ms: number;
  budgetLimit: number;
  allowedComponents: ComponentType[];
  initialNodes: {
    type: ComponentType;
    position: { x: number; y: number };
    label?: string;
  }[];
  initialEdges?: {
    source: string;
    target: string;
  }[];
  tips: string[];
}
