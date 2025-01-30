import { supabase } from "@/shared/api/supabaseClient";
import type { Project } from "@/entities/project/types";
import type { Task } from "@/entities/task/types";
import type { Label } from "@/entities/label/types";

export const fetchProjects = async (userEmail: string): Promise<Project[]> => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('userEmail', userEmail);

        if (error) throw error;
        
        return data.map((project: Project) => ({
            ...project,
            createdAt: new Date(project.createdAt)
        }))
    } catch (err) {
        throw err;
    }
}

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
        createdAt: new Date(data.createdAt)
       };
    } catch (err) {
        throw err;
    }
}

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
}

export const addTask = async (projectId: string, task: Task) => {
    try {
        const { error } = await supabase
        .from('tasks')
        .insert({ ...task, project_id: projectId })
        .select()
        .single();

        if (error) throw error;
    } catch (err) {
        throw err;
    }
}

export const fetchTasks = async (projectId: string): Promise<Task[]> => {
    try {
        const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

        if (error) throw error;

        return {
            ...data,
            createdAt: new Date(data.createdAt)
        };
    } catch (err) {
        throw err;
    }
}

export const fetchLabels = async (): Promise<Label[]> => {
    try {
        const { data, error } = await supabase
        .from('labels')
        .select('*');
        
        if (error) throw error;

        return data as Label[];
    } catch (err) {
        throw err;
    }
}

export const addLabel = async (label: Label) => {
    try {
        const { error } = await supabase
        .from('labels')
        .insert(label)
        .select()
        .single();

        if (error) throw error;
    } catch (err) {
        throw err;
    }
}