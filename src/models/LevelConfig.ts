import { Note } from './Note';

export interface LevelConfig {
    id: number;
    name: string;
    description: string;
    clef: 'treble' | 'bass';
    notes: Note[];
    timeLimit?: number; // Optional time limit in seconds
    requiredSuccessCount: number; // Number of consecutive correct attempts required to level up
    maxTimePerProblem: number; // Maximum average time (in seconds) allowed per problem to level up
} 