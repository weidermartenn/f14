export interface Task {
    id: string;
    createdAt: string;
    name: string;
    description: string | null;
    deadline: string;
    priority: number;
    isFrozen: boolean;
    isVisible: boolean;
    labels?: string[] | null;
    status: 'planned' | 'progress' | 'done';
    projectId: string;
    isIndicator?: boolean;
}