export interface Task {
    id: string;
    createdAt: Date;
    name: string;
    description: string | null;
    deadline: Date;
    priority: number;
    isFrozen: boolean;
    labels: string[] | null;
    status: string;
    projectId: string;
}