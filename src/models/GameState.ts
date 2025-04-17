export interface GameState {
    currentLevelIndex: number;
    isGameRunning: boolean;
    noteHistory: {
        [noteName: string]: {
            correct: number;
            incorrect: number;
        }
    };
    recentAttempts?: {
        isCorrect: boolean;
        timeSpent: number;
        timestamp: number;
    }[];
    lastProblemStartTime?: number;
} 