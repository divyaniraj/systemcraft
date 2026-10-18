# SystemCraft 🎮⚡
> Master System Design Interviews Through Play.

SystemCraft is an interactive, canvas-driven web application game where developers learn distributed systems and system design patterns by architecting scalable systems that face real-time traffic simulations, failure injections, and iterative interview constraints.

---

## 🚀 Features (Phase 1 Implemented)

- **Interactive Architecture Canvas:** Built with `@xyflow/react` (React Flow) featuring custom cloud infrastructure nodes (Clients, Load Balancers, Stateless App Servers, Redis Caches, PostgreSQL Databases, and Message Queues).
- **Drag-and-Drop & Connection Validation:** Connect nodes with custom animated traffic edges that simulate packet flow. Enforces architectural rules (e.g., direct client-to-database connections are prohibited).
- **Real-Time Simulation Engine (Zustand):**
  - Live throughput traffic generation (RPS).
  - Percentile latency calculations ($p50$, $p95$, $p99$).
  - 5xx error rate tracking.
  - Real-time node capacity thresholds & bottleneck detection.
  - Ongoing monthly cloud infrastructure cost meter against budget limits.
- **Progressive Campaign Levels:**
  - **Level 1: The MVP (Single User):** Build a basic store within a \$100/mo budget.
  - **Level 2: The Flash Sale (Multiple Users):** Survive 2,500 RPS by introducing load balancing and Redis caching to prevent database lockups.
  - **Level 3: Going Global (Multiple Locations):** Edge distribution and asynchronous queuing.
- **Dynamic AI Interviewer:** Live feedback panel reacting to your architectural decisions and surfacing failure explanations.
- **Failure Injection Mode:** "Simulate Spike" button to stress-test your architecture against burst traffic and reveal bottlenecks in real time.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Lucide Icons
- **Graph & Canvas:** `@xyflow/react`
- **State Management:** Zustand
- **Effects & Gamification:** `canvas-confetti`

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd systemcraft

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🗺️ Roadmap

- [x] **Phase 1:** Core Interactive Canvas, Custom Nodes, Simulation Store, and E-Commerce Levels 1 & 2.
- [ ] **Phase 2:** Packet particle animation shaders along canvas bezier curves.
- [ ] **Phase 3:** Chaos Engineering injection tool (Simulate AZ outage, DB deadlock, Cache stampede).
- [ ] **Phase 4:** Campaign Expansion (URL Shortener, Real-time Chat, Video Streaming).
- [ ] **Phase 5:** Custom Level Editor & Community Architecture Blueprints.
