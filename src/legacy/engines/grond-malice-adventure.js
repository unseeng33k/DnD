#!/usr/bin/env node

// PATH UPDATE: Fixed imports - spotlight-pacing-scheduler and mechanical-state-engine moved from utilities to systems
import { SpotlightPacingScheduler } from '../systems/spotlight-pacing-scheduler.js';
import { MechanicalStateEngine } from '../systems/mechanical-state-engine.js';
// PATH UPDATE: world-state-graph stays in engines (will be consolidated in Phase 2)
import { PersistentWorldStateGraph } from './world-state-graph.js';