import type { LevelDefinition } from '../types/game';

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    round: 1,
    title: 'Level 1: The MVP',
    subtitle: 'Single User (First Steps)',
    description: 'Build an initial proof of concept for our new e-commerce storefront. Traffic is tiny.',
    interviewerBrief: 'Welcome! We are launching our first boutique store. Connect our visitors to a backend server and a persistent database. Keep it simple and within our $100 budget.',
    targetRPS: 25,
    surgeRPS: 60,
    slaP99Ms: 200,
    budgetLimit: 100,
    allowedComponents: ['client', 'compute', 'database'],
    initialNodes: [
      {
        type: 'client',
        position: { x: 50, y: 180 },
        label: 'Shoppers (Ingress)',
      },
    ],
    tips: [
      'A Client node cannot query a Database directly in production.',
      'Route traffic through an App Compute Node before hitting the Database.',
    ],
  },
  {
    id: 2,
    round: 1,
    title: 'Level 2: The Flash Sale',
    subtitle: 'Scaling to Multiple Users',
    description: 'We announced a massive promotion! 50,000 shoppers are flooding the site simultaneously.',
    interviewerBrief: 'Our marketing campaign went viral! Traffic just exploded to 2,500 RPS. A single compute node will burn out, and our database connection pool will saturate. Add horizontal scaling and caching!',
    targetRPS: 2500,
    surgeRPS: 3400,
    slaP99Ms: 300,
    budgetLimit: 250,
    allowedComponents: ['client', 'load_balancer', 'compute', 'cache', 'database'],
    initialNodes: [
      {
        type: 'client',
        position: { x: 50, y: 220 },
        label: 'Shoppers (Ingress)',
      },
      {
        type: 'load_balancer',
        position: { x: 260, y: 215 },
        label: 'NGINX Load Balancer',
      },
      {
        type: 'compute',
        position: { x: 470, y: 130 },
        label: 'App Server 1',
      },
      {
        type: 'compute',
        position: { x: 470, y: 310 },
        label: 'App Server 2',
      },
      {
        type: 'database',
        position: { x: 690, y: 220 },
        label: 'PostgreSQL Primary',
      },
    ],
    initialEdges: [
      { source: 'node-0', target: 'node-1' },
      { source: 'node-1', target: 'node-2' },
      { source: 'node-1', target: 'node-3' },
      { source: 'node-2', target: 'node-4' },
      { source: 'node-3', target: 'node-4' },
    ],
    tips: [
      'App servers can only handle ~1,500 RPS each. Two servers give 3,000 capacity.',
      'A primary Postgres database locks when writes & reads together exceed 800 RPS.',
      'Inserting a Redis Cache allows 90% of reads to be answered in 1ms without touching Postgres!',
    ],
  },
  {
    id: 3,
    round: 1,
    title: 'Level 3: Going Global',
    subtitle: 'Users Across Multiple Locations',
    description: 'We are expanding to Europe and Asia. Cross-ocean latency is frustrating international customers.',
    interviewerBrief: 'Our users in Tokyo and London are experiencing 800ms delays reaching our US-East database. You will need edge caching, geo-distribution, and read replicas.',
    targetRPS: 15000,
    surgeRPS: 22000,
    slaP99Ms: 250,
    budgetLimit: 600,
    allowedComponents: ['client', 'load_balancer', 'compute', 'cache', 'database', 'queue'],
    initialNodes: [
      {
        type: 'client',
        position: { x: 50, y: 220 },
        label: 'Global Ingress',
      },
    ],
    tips: [
      'Use asynchronous message queues to handle checkout transactions without making users wait.',
      'Distribute static asset requests away from core backend servers.',
    ],
  },
];
