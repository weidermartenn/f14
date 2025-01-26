import { supabase } from "@/shared/api/supabaseClient";
import type { Project } from "@/entities/project/types";

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

export const downloadAvatar = async (path: string): Promise<string> => {
    try {
        const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);

        if (error) throw error;

        return URL.createObjectURL(data);
    } catch (err) {
        throw err;
    }
}

export const uploadFileToStorage = async (file: File): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

        if (error) throw error;

        return filePath;
    } catch (err) {
        throw err;
    }
}

export const updateUserProfile = async (
    userId: string
): Promise<User> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return data;
    } catch (err) {
        throw err;
    }
} 

