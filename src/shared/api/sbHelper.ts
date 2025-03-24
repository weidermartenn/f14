import { supabase } from "../../shared/api/supabaseClient";
import type { Project } from "../../entities/project/types";
import type { Task } from "../../entities/task/types";
import type { TLabel } from "../../entities/label/types";
import { generateId } from "../lib/generateId";

class SupabaseHelper {
  private getRandomHexColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215);
    return `#${randomColor.toString(16).padStart(6, '0')}`;
  };

  public addUser = async (email: string) => {
    try {
      const userId = generateId();
      const color = this.getRandomHexColor();
      const { error } = await supabase.from("users").insert([{ id: userId, color, email }]);
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  }

  public getUserId = async (email: string) => {
    try {
      const { data, error } = await supabase.from("users").select("id").eq("email", email).single();
      if (error) throw error;
      return data.id;
    } catch (err) {
      throw err;
    }
  }

  public getUserEmail = async (id: string) => {
    try {
      const { data, error } = await supabase.from("users").select("email").eq("id", id).single();
      if (error) throw error;
      return data.email;
    } catch (err) {
      throw err;
    }
  }

  public getUserColor = async (id: string) => {
    try {
      const { data, error } = await supabase.from("users").select("color").eq("id", id).single();
      if (error) throw error;
      return data.color;
    } catch (err) {
      throw err;
    }
  }

  public checkOrg = async (email: string) => {
    try {
      const userId = await this.getUserId(email);
      const { data, error } = await supabase.from("orgs").select("*").eq("leaderId", userId);
      if (error) throw error;
      return data && data.length > 0;
    } catch (err) {
      throw err;
    }
  };

  public checkOrgInFocus = async (email: string) => {
    try {
      const userId = await this.getUserId(email);
      const { data, error } = await supabase.from("users").select("orgInFocus").eq("id", userId).single();
      if (error) throw error;
      return data.orgInFocus;
    } catch (err) {
      throw err;
    }
  }

  public createOrg = async (name: string, email: string) => {
    try {
      const userId = await this.getUserId(email);
      const id = generateId();
      const { error } = await supabase.from("orgs").insert([{ id, name, leaderId: userId, membersIds: [userId] }]);
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  }

  public fetchOrgs = async (email: string) => {
    try {
      const userId = await this.getUserId(email);
      const { data, error } = await supabase.from("orgs").select("*").contains("membersIds", `{${userId}}`);
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }

  public fetchOrgName = async (id: string) => {
    try {
      const { data, error } = await supabase.from("orgs").select("name").eq("id", id).single();
      if (error) throw error;
      return data.name;
    } catch (err) {
      throw err;
    }
  }

  public fetchProjects = async (orgId: string): Promise<Project[]> => {
    try {
      const { data, error } = await supabase.from("projects").select("*").eq("orgId", orgId);
      if (error) throw error;
      return data.map((project: Project) => ({
        ...project,
        createdAt: new Date(project.createdAt),
      }));
    } catch (err) {
      throw err;
    }
  };

  public addProject = async (project: { id: string; name: string; userEmail: string; createdAt: string; orgId: string }): Promise<Project> => {
    try {
      const { data, error } = await supabase.from("projects").insert([project]).select().single();
      if (error) throw error;

      const { error: storageError } = await supabase.storage.from("task-attachments").upload(`${project.id}/placeholder.txt`, new Blob([" "]), {
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

  public updateProjectName = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase.from("projects").update({ name }).eq("id", id).select().single();
      if (error) throw error;
      return {
        ...data,
        createdAt: new Date(data.createdAt),
      };
    } catch (err) {
      throw err;
    }
  };

  public deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id).select().single();
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  public addTask = async (projectId: string, task: Task) => {
    try {
      const { error } = await supabase.from("tasks").insert({ ...task, projectId });
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  public deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId).select().single();
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  public createTaskFolder = async (projectId: string, taskId: string) => {
    try {
      const { error } = await supabase.storage.from("task-attachments").upload(`${projectId}/${taskId}/.keep`, new Blob(), {
        upsert: false,
      });
      if (error && error.message !== "Duplicate") throw error;
    } catch (err) {
      throw err;
    }
  };

  public uploadFiles = async (projectId: string, taskId: string, files: File[]) => {
    try {
      for (const file of files) {
        const filePath = `${projectId}/${taskId}/${file.name}`;
        const { error } = await supabase.storage.from("task-attachments").upload(filePath, file);
        if (error) throw error;
      }
    } catch (err) {
      console.error("Ошибка загрузки файлов:", err);
    }
  };

  public fetchTaskFiles = async (projectId: string, taskId: string) => {
    try {
      const { data, error } = await supabase.storage.from('task-attachments').list(`${projectId}/${taskId}`);
      if (error) {
        console.error('Storage error:', error);
        throw error;
      }

      const files = await Promise.all(
        data.filter((file: any) => file.name !== '.keep').map(async (file: any) => {
          const { data: urlData } = supabase.storage.from('task-attachments').getPublicUrl(`${projectId}/${taskId}/${file.name}`);
          return {
            name: file.name,
            url: urlData.publicUrl,
            type: file.name.split('.').pop()?.toLowerCase() || 'file'
          };
        })
      );

      return files;
    } catch (err) {
      console.error('Error fetching files:', err);
      return [];
    }
  };

  public updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      const { data, error } = await supabase.from("tasks").update(updates).eq("id", taskId).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Ошибка при обновлении задачи: ", error);
      return null;
    }
  };

  public fetchTasks = async (projectId: string): Promise<Task[]> => {
    try {
      const { data, error } = await supabase.from("tasks").select("*").eq("projectId", projectId);
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

  public fetchLabels = async (): Promise<TLabel[]> => {
    try {
      const { data, error } = await supabase.from("labels").select("*");
      if (error) throw error;
      return data as TLabel[];
    } catch (err) {
      throw err;
    }
  };

  public addLabel = async (label: TLabel) => {
    try {
      const { error } = await supabase.from("labels").insert(label).select().single();
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };
}

export const supabaseHelper = new SupabaseHelper();
