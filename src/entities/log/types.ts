export interface Log {
    id: string;
    action: string;
    name: string;
    createdAt: string;
    userId: string | null;
    orgId: string | null;
    projectId: string | null;
    taskId: string | null;
}