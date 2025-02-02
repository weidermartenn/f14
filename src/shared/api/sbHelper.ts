import { supabase } from "@/shared/api/supabaseClient";
import type { Project } from "@/entities/project/types";
import type { Task } from "@/entities/task/types";
import type { Label } from "@/entities/label/types";

export const fetchProjects = async (userEmail: string): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("userEmail", userEmail);

    if (error) throw error;

    return data.map((project: Project) => ({
      ...project,
      createdAt: new Date(project.createdAt),
    }));
  } catch (err) {
    throw err;
  }
};

// Функция для создания проекта
export const createProject = async (project: {
  id: string;
  name: string;
  userEmail: string;
  createdAt: string;
}): Promise<Project> => {
  try {
    // Создаем проект в таблице projects
    const { data, error } = await supabase
      .from("projects")
      .insert([project])
      .select()
      .single();

    if (error) throw error;

    // Создаем папку через загрузку файла
    const { error: storageError } = await supabase.storage
      .from("task-attachments")
      .upload(`${project.id}/placeholder.txt`, new Blob([" "]), {
        cacheControl: "3600",
        contentType: "text/plain",
        upsert: false,
      });

    if (storageError && storageError.message !== "Duplicate") {
      throw storageError;
    }

    return { ...data, createdAt: new Date(data.createdAt) };
  } catch (err) {
    throw err;
  }
};

export const updateProject = async (id: string, name: string) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      createdAt: new Date(data.createdAt),
    };
  } catch (err) {
    throw err;
  }
};

export const deleteProject = async (id: string) => {
  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
  } catch (err) {
    throw err;
  }
};

export const addTask = async (projectId: string, task: Task) => {
  try {
    const { error } = await supabase
      .from("tasks")
      .insert({ ...task, projectId: projectId });

    if (error) throw error;
  } catch (err) {
    throw err;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
  } catch (err) {
    throw err;
  }
};

export const createTaskFolder = async (projectId: string, taskId: string) => {
  try {
    const { error } = await supabase.storage
      .from("task-attachments")
      .upload(`${projectId}/${taskId}/.keep`, new Blob(), {
        upsert: false,
      });

    if (error && error.message !== "Duplicate") throw error;
  } catch (err) {
    throw err;
  }
};

export const uploadFiles = async (
  projectId: string,
  taskId: string,
  files: File[]
) => {
  try {
    for (const file of files) {
      const filePath = `${projectId}/${taskId}/${file.name}`;

      const { error } = await supabase.storage
        .from("task-attachments")
        .upload(filePath, file);

      if (error) throw error;
    }
  } catch (err) {
    console.error("Ошибка загрузки файлов:", err);
  }
};

export const fetchTaskFiles = async (projectId: string, taskId: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .list(`${projectId}/${taskId}`);

    if (error) {
      console.error('Storage error:', error);
      throw error;
    }

    console.log('Raw files data:', data); // Добавим лог для отладки

    const files = await Promise.all(
      data
        .filter((file: any) => file.name !== '.keep')
        .map(async (file: any) => {
          const { data: urlData } = supabase.storage
            .from('task-attachments')
            .getPublicUrl(`${projectId}/${taskId}/${file.name}`);

          return {
            name: file.name,
            url: urlData.publicUrl,
            type: file.name.split('.').pop()?.toLowerCase() || 'file'
          };
        })
    );

    console.log('Processed files:', files); // Лог обработанных файлов
    return files;
  } catch (err) {
    console.error('Error fetching files:', err);
    return [];
  }
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Ошибка при обновлении задачи: ", error);
    return null;
  }
};

export const fetchTasks = async (projectId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("projectId", projectId);

    if (error) throw error;

    return data.map((task: Task) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      deadline: new Date(task.deadline),
      labels: task.labels || [],
    }));
  } catch (err) {
    throw err;
  }
};

export const fetchLabels = async (): Promise<Label[]> => {
  try {
    const { data, error } = await supabase.from("labels").select("*");

    if (error) throw error;

    return data as Label[];
  } catch (err) {
    throw err;
  }
};

export const addLabel = async (label: Label) => {
  try {
    const { error } = await supabase
      .from("labels")
      .insert(label)
      .select()
      .single();

    if (error) throw error;
  } catch (err) {
    throw err;
  }
};
