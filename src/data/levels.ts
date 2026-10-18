import { SYSTEM_DESIGN_QUESTIONS } from './questions';
import type { LevelDefinition } from '../types/game';

export const LEVELS: LevelDefinition[] = SYSTEM_DESIGN_QUESTIONS.flatMap((q) => q.levels);
