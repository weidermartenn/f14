export interface Task {
    id: string;
    createdAt: Date;
    name: string;
    description: string | null;
    deadline: Date;
    priority: number;
    isFrozen: boolean;
    labels?: string[] | null;
    status: 'planned' | 'progress' | 'done';
    projectId: string;
}