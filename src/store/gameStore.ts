import { create } from 'zustand';
import { 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
} from '@xyflow/react';
import type { 
  Node, 
  Edge, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  Connection 
} from '@xyflow/react';
import type { ComponentType, LevelDefinition, SystemNodeData, TelemetryMetrics } from '../types/game';
import { LEVELS } from '../data/levels';
import { COMPONENT_CATALOG } from '../data/components';

interface GameState {
  currentLevel: LevelDefinition;
  nodes: Node<SystemNodeData>[];
  edges: Edge[];
  isSimulating: boolean;
  isSurge: boolean;
  telemetry: TelemetryMetrics;
  interviewerFeedback: string;
  isCompleted: boolean;
  
  // Actions
  onNodesChange: OnNodesChange<Node<SystemNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: ComponentType, position?: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  toggleSimulation: () => void;
  toggleSurge: () => void;
  loadLevel: (levelId: number) => void;
  resetCurrentLevel: () => void;
  runSimulationTick: () => void;
}

function calculateInitialStateForLevel(level: LevelDefinition) {
  let counter = 0;
  const nodes: Node<SystemNodeData>[] = level.initialNodes.map((n) => {
    const spec = COMPONENT_CATALOG.find((c) => c.type === n.type)!;
    const id = `node-${counter++}`;
    return {
      id,
      type: n.type,
      position: n.position,
      data: {
        id,
        type: n.type,
        label: n.label || spec.title,
        costPerMonth: spec.costPerMonth,
        maxRPS: spec.maxRPS,
        currentRPS: 0,
        baseLatencyMs: spec.baseLatencyMs,
        status: 'idle',
        loadPercent: 0,
      },
    };
  });

  const edges: Edge[] = (level.initialEdges || []).map((e, idx) => ({
    id: `edge-${idx}`,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: '#38bdf8', strokeWidth: 2.5 },
  }));

  const telemetry: TelemetryMetrics = {
    currentRPS: 0,
    targetRPS: level.targetRPS,
    p50LatencyMs: 0,
    p95LatencyMs: 0,
    p99LatencyMs: 0,
    slaP99Ms: level.slaP99Ms,
    errorRatePercent: 0,
    monthlyCost: nodes.reduce((sum, n) => sum + n.data.costPerMonth, 0),
    budgetLimit: level.budgetLimit,
    bottleneckNodeId: null,
    status: 'passing',
  };

  return { nodes, edges, telemetry };
}

export const useGameStore = create<GameState>((set, get) => {
  const initialLevel = LEVELS[1]; // Start with Level 2: The Flash Sale
  const initialSetup = calculateInitialStateForLevel(initialLevel);

  return {
    currentLevel: initialLevel,
    nodes: initialSetup.nodes,
    edges: initialSetup.edges,
    isSimulating: true,
    isSurge: false,
    telemetry: initialSetup.telemetry,
    interviewerFeedback: initialLevel.interviewerBrief,
    isCompleted: false,

    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
      get().runSimulationTick();
    },

    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
      get().runSimulationTick();
    },

    onConnect: (connection: Connection) => {
      // Architectural validation
      const { nodes } = get();
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      // Rule: Clients cannot connect directly to Database
      if (sourceNode.data.type === 'client' && targetNode.data.type === 'database') {
        set({
          interviewerFeedback: '⚠️ Rule Violation: Clients cannot connect directly to databases! Direct DB exposure is unsafe. Connect via an App Server or Load Balancer.',
        });
        return;
      }

      // Rule: Cache cannot be traffic ingress
      if (sourceNode.data.type === 'client' && sourceNode.data.type === targetNode.data.type) {
        return;
      }

      const newEdge: Edge = {
        id: `e-${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        animated: true,
        style: { stroke: '#38bdf8', strokeWidth: 2.5 },
      };

      set({
        edges: addEdge(newEdge, get().edges),
      });
      get().runSimulationTick();
    },

    addNode: (type: ComponentType, position = { x: 300, y: 200 }) => {
      const spec = COMPONENT_CATALOG.find((c) => c.type === type);
      if (!spec) return;

      const newId = `node-${Date.now()}`;
      const newNode: Node<SystemNodeData> = {
        id: newId,
        type,
        position,
        data: {
          id: newId,
          type,
          label: spec.title,
          costPerMonth: spec.costPerMonth,
          maxRPS: spec.maxRPS,
          currentRPS: 0,
          baseLatencyMs: spec.baseLatencyMs,
          status: 'idle',
          loadPercent: 0,
        },
      };

      set({
        nodes: [...get().nodes, newNode],
      });
      get().runSimulationTick();
    },

    removeNode: (id: string) => {
      set({
        nodes: get().nodes.filter((n) => n.id !== id),
        edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      });
      get().runSimulationTick();
    },

    toggleSimulation: () => {
      const isSim = !get().isSimulating;
      set({ isSimulating: isSim });
      if (isSim) {
        get().runSimulationTick();
      }
    },

    toggleSurge: () => {
      set({ isSurge: !get().isSurge });
      get().runSimulationTick();
    },

    loadLevel: (levelId: number) => {
      const targetLevel = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
      const setup = calculateInitialStateForLevel(targetLevel);
      set({
        currentLevel: targetLevel,
        nodes: setup.nodes,
        edges: setup.edges,
        telemetry: setup.telemetry,
        interviewerFeedback: targetLevel.interviewerBrief,
        isSurge: false,
        isCompleted: false,
      });
      get().runSimulationTick();
    },

    resetCurrentLevel: () => {
      const level = get().currentLevel;
      const setup = calculateInitialStateForLevel(level);
      set({
        nodes: setup.nodes,
        edges: setup.edges,
        telemetry: setup.telemetry,
        interviewerFeedback: level.interviewerBrief,
        isSurge: false,
        isCompleted: false,
      });
      get().runSimulationTick();
    },

    runSimulationTick: () => {
      const { currentLevel, nodes, edges, isSimulating, isSurge } = get();
      if (!isSimulating) return;

      const activeRPS = isSurge ? currentLevel.surgeRPS : currentLevel.targetRPS;
      const totalCost = nodes.reduce((sum, n) => sum + n.data.costPerMonth, 0);

      // Check client existence
      const clientNodes = nodes.filter((n) => n.data.type === 'client');
      if (clientNodes.length === 0) {
        set({
          telemetry: {
            ...get().telemetry,
            currentRPS: 0,
            p50LatencyMs: 0,
            p95LatencyMs: 0,
            p99LatencyMs: 0,
            errorRatePercent: 0,
            monthlyCost: totalCost,
            status: 'failing',
          },
          interviewerFeedback: 'Add a Client node to simulate incoming traffic.',
        });
        return;
      }

      // Trace connections from clients
      const clientEdges = edges.filter((e) => clientNodes.some((c) => c.id === e.source));
      if (clientEdges.length === 0) {
        set({
          telemetry: {
            ...get().telemetry,
            currentRPS: activeRPS,
            p50LatencyMs: 9999,
            p95LatencyMs: 9999,
            p99LatencyMs: 9999,
            errorRatePercent: 100,
            monthlyCost: totalCost,
            status: 'failing',
          },
          interviewerFeedback: '⚠️ 100% Drop Rate: Your clients have nowhere to send their traffic! Connect them to a Load Balancer or App Server.',
        });
        return;
      }

      // Discover downstream components
      const appNodes = nodes.filter((n) => n.data.type === 'compute');
      const cacheNodes = nodes.filter((n) => n.data.type === 'cache');
      const dbNodes = nodes.filter((n) => n.data.type === 'database');

      // Check if DB exists
      if (dbNodes.length === 0) {
        set({
          telemetry: {
            ...get().telemetry,
            currentRPS: activeRPS,
            p50LatencyMs: 9999,
            p95LatencyMs: 9999,
            p99LatencyMs: 9999,
            errorRatePercent: 100,
            monthlyCost: totalCost,
            status: 'failing',
          },
          interviewerFeedback: '⚠️ Missing Data Store: Where are you storing user orders? Connect a Database to persist data.',
        });
        return;
      }

      // Calculate compute capacity
      const activeAppServers = appNodes.filter((app) => 
        edges.some((e) => e.target === app.id)
      );

      const totalAppCapacity = activeAppServers.reduce((sum, n) => sum + n.data.maxRPS, 0);
      const appOverloaded = totalAppCapacity > 0 && activeRPS > totalAppCapacity;

      // Check cache presence
      const hasActiveCache = cacheNodes.some((c) => 
        edges.some((e) => e.target === c.id)
      );

      // Database incoming traffic:
      const dbTrafficRatio = hasActiveCache ? 0.12 : 1.0;
      const dbIncomingRPS = Math.round(activeRPS * dbTrafficRatio);
      const totalDbCapacity = dbNodes.reduce((sum, d) => sum + d.data.maxRPS, 0);
      const dbOverloaded = dbIncomingRPS > totalDbCapacity;

      // Calculate latencies
      let p50 = 18;
      let p95 = 65;
      let p99 = 140;
      let errorRate = 0.01;
      let bottleneckId: string | null = null;
      let feedback = '';

      if (appNodes.length === 0 || activeAppServers.length === 0) {
        p50 = 9999;
        p95 = 9999;
        p99 = 9999;
        errorRate = 100;
        feedback = '⚠️ No compute layer! Traffic cannot reach the database without an application server.';
      } else if (appOverloaded) {
        const ratio = activeRPS / totalAppCapacity;
        p50 = Math.round(50 * ratio);
        p95 = Math.round(250 * ratio);
        p99 = Math.round(600 * ratio);
        errorRate = Math.min(15, Number(((ratio - 1) * 20).toFixed(2)));
        bottleneckId = activeAppServers[0]?.id || null;
        feedback = `⚠️ App Servers Overloaded! Current traffic (${activeRPS} RPS) exceeds compute capacity (${totalAppCapacity} RPS). Add another App Server or upgrade capacity!`;
      } else if (dbOverloaded) {
        const dbRatio = dbIncomingRPS / totalDbCapacity;
        p50 = hasActiveCache ? 24 : Math.round(180 * dbRatio);
        p95 = Math.round(320 * dbRatio);
        p99 = Math.round(680 * dbRatio);
        errorRate = Number((Math.min(8, (dbRatio - 1) * 6)).toFixed(2));
        bottleneckId = dbNodes[0]?.id || null;

        if (!hasActiveCache) {
          feedback = `🔴 Database Lockup! All ${activeRPS} RPS are hammering PostgreSQL directly without a cache. Add a Redis Cache to shield the DB!`;
        } else {
          feedback = `⚠️ DB Write Contention! Even with Redis, writes are exceeding DB write pool capacity. Consider an Asynchronous Message Queue or Read Replicas.`;
        }
      } else {
        // Passing state
        if (hasActiveCache) {
          p50 = 16;
          p95 = 72;
          p99 = 245;
          errorRate = 0.02;
          feedback = '🟢 Excellent architecture! Redis is absorbing read traffic, and App Servers are balanced. Can your design survive a flash surge?';
        } else {
          p50 = 35;
          p95 = 110;
          p99 = 285;
          errorRate = 0.05;
          feedback = '⚡ System is stable for now, but database load is heavy. Watch out when traffic spikes!';
        }
      }

      // Check budget
      const overBudget = totalCost > currentLevel.budgetLimit;
      if (overBudget) {
        feedback = `💸 Over Budget! Your monthly cloud bill is $${totalCost}/mo, exceeding the $${currentLevel.budgetLimit} limit. Optimize component count!`;
      }

      // Check victory
      const isPassing = !appOverloaded && !dbOverloaded && !overBudget && p99 <= currentLevel.slaP99Ms && errorRate <= 0.1;

      // Update Node load states visually
      const updatedNodes = nodes.map((n) => {
        let load = 0;
        let status: 'healthy' | 'warning' | 'critical' | 'idle' = 'healthy';

        if (n.data.type === 'client') {
          load = 100;
          status = 'healthy';
        } else if (n.data.type === 'load_balancer') {
          load = Math.min(100, Math.round((activeRPS / n.data.maxRPS) * 100));
          status = load > 90 ? 'critical' : load > 70 ? 'warning' : 'healthy';
        } else if (n.data.type === 'compute') {
          const serverShare = activeAppServers.length > 0 ? activeRPS / activeAppServers.length : 0;
          load = Math.min(100, Math.round((serverShare / n.data.maxRPS) * 100));
          status = load > 90 ? 'critical' : load > 75 ? 'warning' : 'healthy';
        } else if (n.data.type === 'cache') {
          const cacheRPS = Math.round(activeRPS * 0.88);
          load = Math.min(100, Math.round((cacheRPS / n.data.maxRPS) * 100));
          status = 'healthy';
        } else if (n.data.type === 'database') {
          load = Math.min(100, Math.round((dbIncomingRPS / n.data.maxRPS) * 100));
          status = load >= 95 ? 'critical' : load > 75 ? 'warning' : 'healthy';
        }

        return {
          ...n,
          data: {
            ...n.data,
            currentRPS: n.data.type === 'database' ? dbIncomingRPS : activeRPS,
            loadPercent: load,
            status,
          },
        };
      });

      set({
        nodes: updatedNodes,
        telemetry: {
          currentRPS: activeRPS,
          targetRPS: currentLevel.targetRPS,
          p50LatencyMs: p50,
          p95LatencyMs: p95,
          p99LatencyMs: p99,
          slaP99Ms: currentLevel.slaP99Ms,
          errorRatePercent: errorRate,
          monthlyCost: totalCost,
          budgetLimit: currentLevel.budgetLimit,
          bottleneckNodeId: bottleneckId,
          status: isPassing ? 'passing' : 'failing',
        },
        interviewerFeedback: feedback,
        isCompleted: isPassing && isSurge,
      });
    },
  };
});
