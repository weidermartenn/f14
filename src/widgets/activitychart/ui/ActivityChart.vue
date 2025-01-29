<template>
    <div class="w-full max-w-3xl bg-bg-dark p-4 rounded-md shadow-sm shadow-f14-font-dark flex flex-col items-center">
        <h3 class="text-center text-white mb-4">График активности</h3>
        <div class="w-full h-64">
            <canvas ref="chartCanvas" class="w-full h-full"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const chartCanvas = ref(null);

onMounted(() => {
    if (chartCanvas.value) {
        new Chart(chartCanvas.value, {
            type: "bar",
            data: {
                labels: ["27.01.2025", "28.01.2025", "29.01.2025"],
                datasets: [
                    {
                        label: "Добавлено задач",
                        data: [3, 6, 9, 12, 15, 18, 21],
                        backgroundColor: "#8090F4",
                    },
                    {
                        label: "Внесено изменений",
                        data: [2, 4, 6, 8, 10, 12, 14],
                        backgroundColor: "#37DC74"
                    }
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: "rgba(255, 255, 255, 0.3)",
                        },
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "rgba(255, 255, 255, 0.3)",
                        }
                    },
                },
            },
        });
    }
});
</script>

<style scoped>

</style>