import { supabase } from "../../shared/api/supabaseClient";
import type { Project } from "../../entities/project/types";
import type { Task } from "../../entities/task/types";
import type { TLabel } from "../../entities/label/types";
import { generateId } from "../lib/generateId";
import type { Comment } from "../../entities/comment/types";
import type { MajorTask } from "../../entities/majortask/types";
import type { Log } from "../../entities/log/types";

class SupabaseHelper {
  private getRandomHexColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215);
    return `#${randomColor.toString(16).padStart(6, "0")}`;
  };

  public addUser = async (email: string) => {
    try {
      const userId = generateId();
      const color = this.getRandomHexColor();
      const { error } = await supabase
        .from("users")
        .insert([{ id: userId, color, email }]);
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  public inviteMember = async (email: string, orgId: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email?orgId=${orgId}`,
        },
      });

      if (error) throw error;

      // Store the invitation in the database
      await supabase.from("invitations").upsert([
        {
          email,
          org_id: orgId,
          invited_at: new Date().toISOString(),
        },
      ]);

      return data;
    } catch (err) {
      console.error("Error inviting member:", err);
      throw err;
    }
  };

  sendInvitationEmail = async (email: string) => {
    try {
      // Insert the email into the invitations table (if you have one)
      const { error } = await supabase.from("invitations").insert([{ email }]);

      if (error) throw error;

      // Trigger the email sending function
      const { error: sendError } = await supabase.functions.invoke(
        "send-invitation-email",
        {
          body: JSON.stringify({ email }),
        }
      );

      if (sendError) throw sendError;

      console.log(`Invitation sent to ${email}`);
    } catch (err) {
      console.error("Error sending invitation email:", err);
      throw err;
    }
  };

  public addOrgMember = async (orgId: string, email: string) => {
    try {
      // Get user ID by email
      const userId = await this.getUserId(email);

      if (!userId) {
        throw new Error("Пользователь не найден");
      }

      // Get current organization members
      const { data: orgData, error: orgError } = await supabase
        .from("orgs")
        .select("membersIds")
        .eq("id", orgId)
        .single();

      if (orgError) throw orgError;

      // Check if user is already a member
      if (orgData.membersIds.includes(userId)) {
        return;
      }

      // Update organization members
      const { error } = await supabase
        .from("orgs")
        .update({
          membersIds: [...orgData.membersIds, userId],
        })
        .eq("id", orgId);

      if (error) throw error;

      // Mark invitation as accepted
      await supabase
        .from("invitations")
        .update({ accepted: true })
        .eq("email", email)
        .eq("org_id", orgId);

      console.log(`Member ${email} added to organization ${orgId}`);
    } catch (err) {
      console.error("Error adding member to organization:", err);
      throw err;
    }
  };

  public removeOrgMember = async (orgId: string, email: string) => {
    try {
      const userId = await this.getUserId(email);

      // Get current organization members
      const { data: orgData, error: orgError } = await supabase
        .from("orgs")
        .select("membersIds")
        .eq("id", orgId)
        .single();

      if (orgError) throw orgError;

      // Check if user is a member
      if (!orgData.membersIds.includes(userId)) {
        return;
      }

      // Update organization members
      const { error } = await supabase
        .from("orgs")
        .update({
          membersIds: orgData.membersIds.filter((id: string) => id !== userId),
        })
        .eq("id", orgId);

      if (error) throw error;

      console.log(`Member ${email} removed from organization ${orgId}`);
    } catch (err) {
      console.error("Error removing member from organization:", err);
      throw err;
    }
  };

  public getUserId = async (email: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();
      if (error) throw error;
      return data.id;
    } catch (err) {
      throw err;
    }
  };

  public getUserEmail = async (id: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data.email;
    } catch (err) {
      throw err;
    }
  };

  public fetchOrgLeader = async (orgId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from("orgs")
        .select("leaderId")
        .eq("id", orgId)
        .single();
      if (error) throw error;
      return data.leaderId;
    } catch (err) {
      console.error("Error fetching org leader:", err);
      throw err;
    }
  };

  public fetchOrgMembersWithLeader = async (orgId: string) => {
    try {
      // Get organization data including members and leader
      const { data: orgData, error: orgError } = await supabase
        .from("orgs")
        .select("membersIds, leaderId")
        .eq("id", orgId)
        .single();

      if (orgError) throw orgError;
      if (!orgData?.membersIds?.length) return { members: [], leaderEmail: "" };

      // Get member emails from the users table
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("email, id")
        .in("id", orgData.membersIds);

      if (usersError) throw usersError;

      // Find leader email
      const leader = users.find((user) => user.id === orgData.leaderId);

      return {
        members: users?.map((user) => user.email) || [],
        leaderEmail: leader?.email || "",
      };
    } catch (err) {
      console.error("Error fetching org members:", err);
      throw err;
    }
  };

  public getUserColor = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("color")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data.color;
    } catch (err) {
      throw err;
    }
  };

  public checkOrg = async (email: string) => {
    try {
      const userId = await this.getUserId(email);
      const { data, error } = await supabase
        .from("orgs")
        .select("*")
        .eq("leaderId", userId);
      if (error) throw error;
      return data && data.length > 0;
    } catch (err) {
      throw err;
    }
  };

  public checkOrgInFocus = async (email: string) => {
    try {
      const userId = await this.getUserId(email);
      const { data, error } = await supabase
        .from("users")
        .select("orgInFocus")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data.orgInFocus;
    } catch (err) {
      throw err;
    }
  };

  public createOrg = async (name: string, email: string) => {
    try {
      const userId = await this.getUserId(email);
      const id = generateId();
      const { error } = await supabase
        .from("orgs")
        .insert([{ id, name, leaderId: userId, membersIds: [userId] }]);
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  public fetchOrgs = async (email: string) => {
    try {
      const userId = await this.getUserId(email);
      const { data, error } = await supabase
        .from("orgs")
        .select("*")
        .contains("membersIds", `{${userId}}`);
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  public deleteOrg = async (id: string) => {
    try {
      const { error } = await supabase
        .from("orgs")
        .delete()
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  public fetchOrgName = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("orgs")
        .select("name")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data.name;
    } catch (err) {
      throw err;
    }
  };

  public fetchOrgMembers = async (orgId: string) => {
    try {
      // 1. Get the organization's member IDs
      const { data: orgData, error: orgError } = await supabase
        .from("orgs")
        .select("membersIds")
        .eq("id", orgId)
        .single();

      if (orgError) throw orgError;
      if (!orgData?.membersIds?.length) return [];

      // 2. Get member emails from the users table
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("email")
        .in("id", orgData.membersIds);

      if (usersError) throw usersError;

      return users?.map((user) => user.email) || [];
    } catch (err) {
      console.error("Error fetching org members:", err);
      throw err;
    }
  };

  public fetchProjects = async (orgId: string): Promise<Project[]> => {
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

  public fetchProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching project:", err);
      throw err;
    }
  };


  public addProject = async (project: {
    id: string;
    name: string;
    userEmail: string;
    createdAt: string;
    orgId: string;
  }): Promise<Project> => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([project])
        .select()
        .single();
      if (error) throw error;

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

  public updateProjectName = async (id: string, name: string) => {
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

  public deleteProject = async (id: string) => {
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

  public addMajorTask = async (projectId: string, majorTask: MajorTask) => {
    try {
      const { error } = await supabase
        .from("major_tasks")
        .insert({ ...majorTask, projectId });
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  }

  public fetchMajorTasks = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from("major_tasks")
        .select("*")
        .eq("projectId", projectId);
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }

  public fetchMajorTaskName = async (majorTaskId: string) => {
    try {
      const { data, error } = await supabase
        .from("major_tasks")
        .select("name")
        .eq("id", majorTaskId)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }

  public deleteMajorTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("major_tasks")
        .delete()
        .eq("id", taskId)
        .select()
        .single();
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  }

  public addTask = async (projectId: string, task: Task) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .insert({ ...task, projectId });
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  public deleteTask = async (taskId: string) => {
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

  public createTaskFolder = async (projectId: string, taskId: string) => {
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

  public uploadFiles = async (
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

  public fetchTaskFiles = async (projectId: string, taskId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("task-attachments")
        .list(`${projectId}/${taskId}`);
      if (error) {
        console.error("Storage error:", error);
        throw error;
      }

      const files = await Promise.all(
        data
          .filter((file: any) => file.name !== ".keep")
          .map(async (file: any) => {
            const { data: urlData } = supabase.storage
              .from("task-attachments")
              .getPublicUrl(`${projectId}/${taskId}/${file.name}`);

            const { data: metadata } = await supabase.storage
              .from("task-attachments")
              .download(`${projectId}/${taskId}/${file.name}`);
            return {
              name: file.name,
              url: urlData.publicUrl,
              type: file.name.split(".").pop()?.toLowerCase() || "file",
              size: metadata?.size || 0
            };
          })
      );

      return files;
    } catch (err) {
      console.error("Error fetching files:", err);
      return [];
    }
  };

  public updateTask = async (
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

  public fetchTasks = async (projectId: string): Promise<Task[]> => {
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

  public addTaskDependency = async (taskId: string, dependsOnTaskId: string, dependencyType: string) => {
    try {
      const dependencyId = generateId();
      const { error } = await supabase
        .from("task_dependencies")
        .insert({ id: dependencyId, taskId: taskId, depends_on_task_id: dependsOnTaskId, dependency_type: dependencyType });
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  public fetchTaskDependencies = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from("task_dependencies")
        .select("*")
        .eq("taskId", taskId);
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  public fetchSubTasks = async (taskId: string): Promise<Task[]> => {
    try {
      const { data, error } = await supabase
        .from("task_assignments")
        .select("*")
        .eq("taskId", taskId);
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

  public fetchCommentsFromProject = async (
    projectId: string
  ): Promise<Comment[]> => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("projectId", projectId);
      if (error) throw error;
      return data as Comment[];
    } catch (err) {
      throw err;
    }
  };

  public addComment = async (comment: Comment) => {
    try {
      const { error } = await supabase
        .from("comments")
        .insert(comment)
        .select()
        .single();
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  public deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw err;
    }
  };

  public editComment = async (comment: Comment) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .update(comment)
        .eq("id", comment.id)
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("Error updating comment:", err);
      throw err;
    }
  };

  public createLogEntry = async (log: Log) => {
    try {
      const { error } = await supabase
        .from("log")
        .insert(log)
      if (error) throw error;
    } catch (err) {
      console.error("Error creating log entry:", err);
      throw err;
    }
  };

  public fetchLogs = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from("log")
        .select("*")
        .eq("projectId", projectId);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching logs:", err);
      throw err;
    }
  }
}

export const supabaseHelper = new SupabaseHelper();
