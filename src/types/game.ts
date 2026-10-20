export type ComponentType = 
  | 'client' 
  | 'load_balancer' 
  | 'compute' 
  | 'cache' 
  | 'database' 
  | 'queue'
  | 'cdn';

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

export interface LevelHint {
  level: number; // 1: Architectural Concept, 2: Wiring & Topology, 3: Capacity Math
  category: 'Architectural Concept' | 'Wiring & Topology' | 'Capacity & Math Solution';
  title: string;
  hint: string;
}

export interface LevelDefinition {
  levelNumber: number; // 1, 2, or 3
  title: string;
  subtitle: string;
  interviewerPrompt: string;
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
  hints: LevelHint[];
}

export interface Question {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Medium-Hard' | 'Hard';
  companyTags: string[];
  description: string;
  levels: LevelDefinition[];
}

export interface UserProfile {
  id: string;
  username: string;
  createdAt: number;
  avatarColor: string;
}

export interface SavedLevelData {
  isCompleted: boolean;
  bestP99: number;
  bestCost: number;
  nodes: any[];
  edges: any[];
  updatedAt: number;
}

export type UserProgressMap = Record<string, Record<number, SavedLevelData>>; // questionId -> levelNumber -> SavedLevelData
