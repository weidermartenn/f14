<template>
    <div class="flex-1 min-w-[300px] bg-gray-50 rounded-lg p-4 shadow-sm">
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-lg">{{ column.title }}</h3>
            <Button @click="addColumn" size="sm">+</Button>
        </div>

        <div class="space-y-2 min-h-[200px]" @dragover.prevent @drop="handleDrop"> 
            <TaskCard v-for="task in column.tasks" :key="task.id" :task="task" @dragstart="handleDragStart"/>           
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import TaskCard from '@/features/tasks/TaskCard.vue';
import Button from '@/shared/ui/Button.vue';

cosnt props = defineProps({
    column: Object
});

const emit = defineEmits(['task-moved']);

let draggedTask = null

const handleDragStart = (task) => {
    draggedTask = task;
}

const handleDrop = () => {
    if (draggedTask && draggedTask.status !== props.column.id) {
        emit('task-moved', { taskId: draggedTask.id, fromColumnId: draggedTask.status, toColumnId: props.column.id });
    }

    draggedTask = null
}
</script>

<style scoped>

</style>