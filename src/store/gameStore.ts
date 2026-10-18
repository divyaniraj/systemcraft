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
import type { ComponentType, LevelDefinition, Question, SystemNodeData, TelemetryMetrics } from '../types/game';
import { SYSTEM_DESIGN_QUESTIONS } from '../data/questions';
import { COMPONENT_CATALOG } from '../data/components';

interface GameState {
  questions: Question[];
  currentQuestionIndex: number;
  currentLevelIndex: number;
  
  // Active getters
  currentQuestion: Question;
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
  selectQuestion: (index: number) => void;
  selectLevel: (levelIndex: number) => void;
  nextLevel: () => void;
  resetCurrentCanvas: () => void;
  runSimulationTick: () => void;
}

function calculateInitialStateForLevel(level: LevelDefinition) {
  let counter = 0;
  // Always clean: only start with the initial ingress node(s)
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
  const initialQuestions = SYSTEM_DESIGN_QUESTIONS;
  const initialQIndex = 0; // Starts at Question 1: URL Shortener (Easy)
  const initialLIndex = 0; // Level 1
  const initialQuestion = initialQuestions[initialQIndex];
  const initialLevel = initialQuestion.levels[initialLIndex];
  const initialSetup = calculateInitialStateForLevel(initialLevel);

  return {
    questions: initialQuestions,
    currentQuestionIndex: initialQIndex,
    currentLevelIndex: initialLIndex,
    currentQuestion: initialQuestion,
    currentLevel: initialLevel,
    nodes: initialSetup.nodes,
    edges: initialSetup.edges,
    isSimulating: true,
    isSurge: false,
    telemetry: initialSetup.telemetry,
    interviewerFeedback: initialLevel.interviewerPrompt,
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
      const { nodes } = get();
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      // Rule: Clients cannot connect directly to Database
      if (sourceNode.data.type === 'client' && targetNode.data.type === 'database') {
        set({
          interviewerFeedback: '⚠️ Rule Violation: Direct DB access from clients is unsafe! Always route requests through an App Compute Node or Load Balancer.',
        });
        return;
      }

      // Rule: Ingress cannot connect directly to another ingress
      if (sourceNode.data.type === 'client' && targetNode.data.type === 'client') {
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

    addNode: (type: ComponentType, position = { x: 340, y: 220 }) => {
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

    selectQuestion: (qIndex: number) => {
      const questions = get().questions;
      const targetQuestion = questions[qIndex] || questions[0];
      const targetLevel = targetQuestion.levels[0];
      const setup = calculateInitialStateForLevel(targetLevel);

      set({
        currentQuestionIndex: qIndex,
        currentLevelIndex: 0,
        currentQuestion: targetQuestion,
        currentLevel: targetLevel,
        nodes: setup.nodes,
        edges: setup.edges,
        telemetry: setup.telemetry,
        interviewerFeedback: targetLevel.interviewerPrompt,
        isSurge: false,
        isCompleted: false,
      });
      get().runSimulationTick();
    },

    selectLevel: (lIndex: number) => {
      const currentQuestion = get().currentQuestion;
      const targetLevel = currentQuestion.levels[lIndex] || currentQuestion.levels[0];
      const setup = calculateInitialStateForLevel(targetLevel);

      set({
        currentLevelIndex: lIndex,
        currentLevel: targetLevel,
        nodes: setup.nodes,
        edges: setup.edges,
        telemetry: setup.telemetry,
        interviewerFeedback: targetLevel.interviewerPrompt,
        isSurge: false,
        isCompleted: false,
      });
      get().runSimulationTick();
    },

    nextLevel: () => {
      const { currentQuestion, currentQuestionIndex, currentLevelIndex, questions } = get();
      if (currentLevelIndex < currentQuestion.levels.length - 1) {
        // Move to next sub-level of the same question
        get().selectLevel(currentLevelIndex + 1);
      } else if (currentQuestionIndex < questions.length - 1) {
        // Solved all 3 levels of this question, advance to next question!
        get().selectQuestion(currentQuestionIndex + 1);
      }
    },

    resetCurrentCanvas: () => {
      const level = get().currentLevel;
      const setup = calculateInitialStateForLevel(level);
      set({
        nodes: setup.nodes,
        edges: setup.edges,
        telemetry: setup.telemetry,
        interviewerFeedback: level.interviewerPrompt,
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
          interviewerFeedback: '⚠️ 100% Drop Rate: Your clients are not connected to anything! Pick a component from the toolbox and connect user traffic.',
        });
        return;
      }

      // Discover downstream components
      const appNodes = nodes.filter((n) => n.data.type === 'compute');
      const cacheNodes = nodes.filter((n) => n.data.type === 'cache');
      const dbNodes = nodes.filter((n) => n.data.type === 'database');
      const queueNodes = nodes.filter((n) => n.data.type === 'queue');

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
          interviewerFeedback: '⚠️ Missing Data Store: Connect a Database so your application can read and write persistent data.',
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

      // Check queue presence
      const hasActiveQueue = queueNodes.some((q) => 
        edges.some((e) => e.target === q.id)
      );

      // Database incoming traffic:
      // With cache: 90% of reads are absorbed. Only 10% touch DB.
      // With queue: write bursts are smoothed out.
      const dbTrafficRatio = hasActiveCache ? 0.10 : 1.0;
      const dbIncomingRPS = Math.round(activeRPS * dbTrafficRatio);
      const totalDbCapacity = dbNodes.reduce((sum, d) => sum + d.data.maxRPS, 0);
      const dbOverloaded = dbIncomingRPS > totalDbCapacity && !hasActiveQueue;

      // Calculate latencies
      let p50 = 18;
      let p95 = 55;
      let p99 = 120;
      let errorRate = 0.01;
      let bottleneckId: string | null = null;
      let feedback = '';

      if (appNodes.length === 0 || activeAppServers.length === 0) {
        p50 = 9999;
        p95 = 9999;
        p99 = 9999;
        errorRate = 100;
        feedback = '⚠️ Missing Compute Layer: Connect user traffic to at least one App Compute Node.';
      } else if (appOverloaded) {
        const ratio = activeRPS / totalAppCapacity;
        p50 = Math.round(45 * ratio);
        p95 = Math.round(180 * ratio);
        p99 = Math.round(520 * ratio);
        errorRate = Math.min(18, Number(((ratio - 1) * 22).toFixed(2)));
        bottleneckId = activeAppServers[0]?.id || null;
        feedback = `⚠️ Compute Bottleneck! Current load (${activeRPS.toLocaleString()} RPS) exceeds server capacity (${totalAppCapacity.toLocaleString()} RPS). Add a Load Balancer and scale App Servers!`;
      } else if (dbOverloaded) {
        const dbRatio = dbIncomingRPS / totalDbCapacity;
        p50 = hasActiveCache ? 20 : Math.round(160 * dbRatio);
        p95 = Math.round(280 * dbRatio);
        p99 = Math.round(620 * dbRatio);
        errorRate = Number((Math.min(9, (dbRatio - 1) * 7)).toFixed(2));
        bottleneckId = dbNodes[0]?.id || null;

        if (!hasActiveCache) {
          feedback = `🔴 Database Lockup! All ${activeRPS.toLocaleString()} RPS are hitting PostgreSQL directly. Insert a Redis Cache to shield the DB!`;
        } else {
          feedback = `⚠️ DB Write Queue Full! Incoming writes exceed disk capacity. Introduce a Kafka Message Queue to buffer requests.`;
        }
      } else {
        // Healthy system
        if (hasActiveCache) {
          p50 = 12;
          p95 = 45;
          p99 = 55;
          errorRate = 0.01;
          feedback = '🟢 Outstanding design! Redis is absorbing reads, and latency is well within SLA.';
        } else {
          // System without cache - evaluate based on database utilization ratio
          const dbRatio = totalDbCapacity > 0 ? dbIncomingRPS / totalDbCapacity : 0;

          if (dbRatio <= 0.35) {
            // Low baseline traffic (e.g. Level 1 MVP: 100 RPS on 800 capacity = 12.5% load)
            p50 = 18;
            p95 = 52;
            p99 = 95; // Passes Level 1 SLA (< 150ms)
            errorRate = 0.01;
            feedback = '🟢 Clean MVP architecture! System is handling baseline traffic reliably within SLA and budget.';
          } else if (dbRatio <= 0.75) {
            // Moderate load
            p50 = 28;
            p95 = 85;
            p99 = 135;
            errorRate = 0.02;
            feedback = '⚡ System is stable, but database utilization is climbing. Keep an eye on latency as traffic grows.';
          } else {
            // Near capacity without cache
            p50 = 48;
            p95 = 140;
            p99 = 240;
            errorRate = 0.05;
            feedback = '⚠️ Database contention is high! Incoming queries are causing queue delays. Add a Cache to reduce p99.';
          }
        }
      }

      // Check if client connects directly to cache (Anti-pattern)
      const directClientToCache = edges.some(
        (e) => clientNodes.some((c) => c.id === e.source) && cacheNodes.some((c) => c.id === e.target)
      );

      // Check if compute nodes connect downstream to cache/db
      const computeHasOutputs = appNodes.some(
        (app) => edges.some((e) => e.source === app.id)
      );

      if (directClientToCache) {
        feedback = '⚠️ Architecture Warning: Clients cannot connect directly to Redis Cache. Route traffic through your Load Balancer $\\to$ App Compute nodes, and have App Compute query Redis!';
      } else if (!computeHasOutputs && activeAppServers.length > 0) {
        feedback = '⚠️ Disconnected Compute Tier: Your App Compute nodes have no outgoing connections! Connect App Compute to Redis Cache and PostgreSQL Primary.';
      }

      // Check budget
      const overBudget = totalCost > currentLevel.budgetLimit;
      if (overBudget) {
        feedback = `💸 Over Budget! Your monthly cloud bill is $${totalCost}/mo, which exceeds the $${currentLevel.budgetLimit} limit. Remove unnecessary instances!`;
      }

      // Check pass criteria
      const isPassing = 
        !appOverloaded && 
        !dbOverloaded && 
        !overBudget && 
        !directClientToCache &&
        computeHasOutputs &&
        p99 <= currentLevel.slaP99Ms && 
        errorRate <= 0.1 && 
        activeAppServers.length > 0 && 
        dbNodes.length > 0;

      // Update node load states
      const updatedNodes = nodes.map((n) => {
        let load = 0;
        let status: 'healthy' | 'warning' | 'critical' | 'idle' = 'healthy';
        let nodeRPS = activeRPS;

        if (n.data.type === 'client') {
          load = 100;
          status = 'healthy';
          nodeRPS = activeRPS;
        } else if (n.data.type === 'load_balancer') {
          load = Math.min(100, Math.round((activeRPS / n.data.maxRPS) * 100));
          status = load > 90 ? 'critical' : load > 70 ? 'warning' : 'healthy';
          nodeRPS = activeRPS;
        } else if (n.data.type === 'compute') {
          const serverShare = activeAppServers.length > 0 ? activeRPS / activeAppServers.length : 0;
          load = Math.min(100, Math.round((serverShare / n.data.maxRPS) * 100));
          status = load > 95 ? 'critical' : load > 75 ? 'warning' : 'healthy';
          nodeRPS = Math.round(serverShare); // Now displays the actual split traffic!
        } else if (n.data.type === 'cache') {
          const cacheRPS = Math.round(activeRPS * 0.95);
          load = Math.min(100, Math.round((cacheRPS / n.data.maxRPS) * 100));
          status = 'healthy';
          nodeRPS = cacheRPS;
        } else if (n.data.type === 'database') {
          load = Math.min(100, Math.round((dbIncomingRPS / n.data.maxRPS) * 100));
          status = load >= 95 ? 'critical' : load > 75 ? 'warning' : 'healthy';
          nodeRPS = dbIncomingRPS;
        } else if (n.data.type === 'queue') {
          load = 35;
          status = 'healthy';
          nodeRPS = Math.round(activeRPS * 0.05);
        }

        return {
          ...n,
          data: {
            ...n.data,
            currentRPS: nodeRPS,
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
        isCompleted: isPassing,
      });
    },
  };
});
