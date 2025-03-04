import { supabase } from "../../shared/api/supabaseClient";
import type { Project } from "../../entities/project/types";
import type { Task } from "../../entities/task/types";
import type { TLabel } from "../../entities/label/types";
import { generateId } from "../lib/generateId";

const getRandomHexColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215);
  return `#${randomColor.toString(16).padStart(6, '0')}`;
};

export const addUser = async (email: string) => {
  try {
    const userId = generateId();
    // Случайный цвет
    const color = getRandomHexColor();
    const { error } = await supabase.from("users").insert([{ id: userId, color: `${color}`, email }]);
    if (error) throw error;
  } catch (err) {
    throw err;
  }
}

export const getUserId = async (email: string) => {
  try {
    const { data, error } = await supabase.from("users").select("id").eq("email", email).single();
    if (error) throw error;
    return data.id;
  } catch (err) {
    throw err;
  }
}

export const getUserEmail = async (id: string) => {
  try {
    const { data, error } = await supabase.from("users").select("email").eq("id", id).single();
    if (error) throw error;
    return data.email;
  } catch (err) {
    throw err;
  }
}

export const getUserColor = async (id: string) => {
  try {
    const { data, error } = await supabase.from("users").select("color").eq("id", id).single();
    if (error) throw error;
    return data.color;
  } catch (err) {
    throw err;
  }
}

export const checkOrg = async (email: string) => {
  try {
    const userId = await getUserId(email);
    const { data, error } = await supabase
      .from("orgs")
      .select("*")
      .eq("leaderId", userId);

    if (error) throw error;

    // Проверяем, есть ли данные
    if (data && data.length > 0) {
      return true;
    }

    return false;
  } catch (err) {
    throw err;
  }
};

export const checkOrgInFocus = async (email: string) => {
  try {
    const userId = await getUserId(email);
    const { data, error } = await supabase.from("users").select("orgInFocus").eq("id", userId).single();
    if (error) throw error;

    return data.orgInFocus;
  } catch (err) {
    throw err;
  }
}

export const createOrg = async (name: string, email: string) => {
  try {
    const userId = await getUserId(email);
    const id = generateId();
    const { error } = await supabase.from("orgs").insert([{id: id, name: name, leaderId: userId, membersIds: [userId]}]);
    if (error) throw error;
  } catch (err) {
    throw err;
  }
}

export const fetchOrgs = async (email: string) => {
  try {
    const userId = await getUserId(email);
    const { data, error } = await supabase.from("orgs").select("*").contains("membersIds", `{${userId}}`);
    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
}

export const fetchOrgName = async (id: string) => {
  try {
    const { data, error } = await supabase.from("orgs").select("name").eq("id", id).single();
    if (error) throw error;
    return data.name;
  } catch (err) {
    throw err;
  }
}

export const fetchProjects = async (orgId: string): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("orgId", orgId);

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
export const addProject = async (project: {
  id: string;
  name: string;
  userEmail: string;
  createdAt: string;
  orgId: string;
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

export const updateProjectName = async (id: string, name: string) => {
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
      createdAt: task.createdAt,
      deadline: task.deadline,
      labels: task.labels || [],
    }));
  } catch (err) {
    throw err;
  }
};

export const fetchLabels = async (): Promise<TLabel[]> => {
  try {
    const { data, error } = await supabase.from("labels").select("*");

    if (error) throw error;

    return data as TLabel[];
  } catch (err) {
    throw err;
  }
};

export const addLabel = async (label: TLabel) => {
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

