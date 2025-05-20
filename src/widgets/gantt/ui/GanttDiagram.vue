<template>
  <div class="gantt-wrapper">
    <div ref="ganttContainer" class="gantt-container"></div>
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="safeInitGantt" class="retry-btn">Повторить</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "GanttDiagram",
  props: {
    tasks: {
      type: Array,
      required: true,
      default: () => [],
      validator(tasks) {
        return tasks.every(
          (task) =>
            task?.id &&
            typeof task?.name === "string" &&
            task.name.trim() !== "" &&
            (task.start instanceof Date || typeof task.start === "string") &&
            (task.end instanceof Date || typeof task.end === "string")
        );
      },
    },
    holidays: {
      type: Array,
      default: () => [],
    },
    initialOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      ganttInstance: null,
      error: null,
      Gantt: null,
    };
  },
  mounted() {
    this.safeInitGantt();
  },
  methods: {
    async safeInitGantt() {
      try {
        this.error = null;

        // 1. Проверка контейнера
        if (!this.$refs.ganttContainer) {
          throw new Error("Контейнер для диаграммы не найден");
        }

        // 2. Загрузка библиотеки
        if (!window.Gantt) {
          await this.loadGanttLibrary();
        }
        this.Gantt = window.Gantt;

        // 3. Подготовка данных
        const preparedTasks = this.prepareTasks(this.tasks);

        // 4. Создание экземпляра с защитой
        this.createGanttInstance(preparedTasks);
      } catch (err) {
        this.handleError(err);
      }
    },
    async loadGanttLibrary() {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.min.js";
        script.onload = () => {
          if (!window.Gantt) {
            reject(new Error("Библиотека Gantt не загрузилась"));
            return;
          }
          resolve();
        };
        script.onerror = () =>
          reject(new Error("Ошибка загрузки библиотеки Gantt"));
        document.head.appendChild(script);
      });
    },
    prepareTasks(tasks) {
      return tasks.map((task) => {
        try {
          return {
            id: String(task.id),
            name: String(task.name).trim() || "Без названия",
            start: this.formatDate(task.start),
            end: this.formatDate(task.end),
            dependencies: task.dependencies ? String(task.dependencies) : "",
          };
        } catch {
          return {
            id: "task-" + Math.random().toString(36).substr(2, 9),
            name: "Без названия",
            start: this.formatDate(new Date()),
            end: this.formatDate(new Date(Date.now() + 86400000)),
            dependencies: "",
          };
        }
      });
    },
    formatDate(date) {
      try {
        const d = date instanceof Date ? date : new Date(date);
        return isNaN(d.getTime())
          ? new Date().toISOString().split("T")[0]
          : d.toISOString().split("T")[0];
      } catch {
        return new Date().toISOString().split("T")[0];
      }
    },
    createGanttInstance(tasks) {
      try {
        // Очистка предыдущего экземпляра
        if (this.ganttInstance) {
          this.$refs.ganttContainer.innerHTML = "";
        }

        // Проверка наличия контейнера
        if (!this.$refs.ganttContainer) {
          throw new Error("Контейнер для диаграммы не найден в DOM");
        }

        // Проверка задач
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
          throw new Error("Нет валидных задач для отображения");
        }

        // Проверка библиотеки
        if (!this.Gantt || typeof this.Gantt !== "function") {
          throw new Error("Библиотека Gantt не загружена");
        }

        // Дополнительная проверка формата задач
        const sampleTask = tasks[0];
        if (!sampleTask.id || !sampleTask.start || !sampleTask.end) {
          throw new Error("Задачи должны содержать id, start и end поля");
        }

        // Патч для библиотеки перед созданием экземпляра
        this.patchGanttLibrary();

        this.ganttInstance = new this.Gantt(this.$refs.ganttContainer, tasks, {
          ...this.initialOptions,
          on_view_change: (mode) => {
            this.$emit("view-change", mode);
          },
        });
      } catch (err) {
        console.error("Ошибка создания диаграммы:", err);
        throw new Error(
          "Не удалось создать диаграмму. Проверьте данные задач."
        );
      }
    },
    patchGanttLibrary() {
      try {
        // Патч для ошибки с name
        const originalChangeViewMode = this.Gantt.prototype.change_view_mode;
        this.Gantt.prototype.change_view_mode = function (mode) {
          if (!this.tasks || !Array.isArray(this.tasks)) {
            console.warn("Нет задач для изменения вида");
            return;
          }

          // Добавляем защиту для каждой задачи
          const safeTasks = this.tasks.map((task) => ({
            ...task,
            name: task?.name || "Без названия",
          }));

          this.tasks = safeTasks;
          return originalChangeViewMode.call(this, mode);
        };

        // Патч для parse_duration
        this.Gantt.utils = this.Gantt.utils || {};
        this.Gantt.utils.parse_duration =
          this.Gantt.utils.parse_duration ||
          (() => ({ quantity: 1, scale: "d" }));
      } catch (err) {
        console.error("Ошибка патчинга библиотеки:", err);
        throw err;
      }
    },
    handleError(err) {
      console.error("Ошибка:", err);
      this.error = err.message || "Неизвестная ошибка при загрузке диаграммы";

      // Дополнительная информация для отладки
      if (process.env.NODE_ENV === "development") {
        this.error += ` (${err.stack || "нет деталей"})`;
      }
    },
    changeViewMode(mode) {
      if (this.ganttInstance) {
        this.ganttInstance.change_view_mode(mode);
      }
    },
    scrollToToday() {
      if (this.ganttInstance) {
        this.ganttInstance.scrollToToday();
      }
    },
  },
  watch: {
    tasks: {
      handler(newTasks) {
        if (!this.ganttInstance || !Array.isArray(newTasks)) return;
        try {
          const prepared = this.prepareTasks(newTasks);
          this.ganttInstance.refresh(prepared);
        } catch (err) {
          this.handleError(err);
        }
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.gantt-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  max-width: 80%;
  text-align: center;
  z-index: 100;
}

.retry-btn {
  margin-top: 10px;
  padding: 5px 10px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
