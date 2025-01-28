export interface Task {
    id: string;
    createdAt: Date;
    name: string;
    description: string | null;
    deadline: Date;
    priority: number;
    isFrozen: boolean;
    labels: JSON;
    status: number;
}