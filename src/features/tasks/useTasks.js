import { ref } from 'vue';

export const useTasks = () => {
    const columns = ref({
        queue: { id: 'queue', title: 'В очереди', tasks: [] },
        progress: { id: 'progress', title: 'В работе', tasks: [] },
        done: { id: 'done', title: 'Завершены', tasks: [] }
    });

    const addTask = (task) => {
        columns.value.queue.tasks.push({
            ...task,
            id: Date.now().toString(),
            status: 'queue'
        });
    };

    const moveTask = ({ taskId, fromColumnId, toColumnId }) => {
        const task = columns.value[fromColumnId].task.find(t => t.id === taskId);
        columns.value[fromColumnId].tasks = columns.value[fromColumnId].tasks.filter(t => t.id !== taskId);
        columns.value[toColumnId].tasks.push({ ...task, status: toColumnId });
    };

    return { columns, addTask, moveTask }
}