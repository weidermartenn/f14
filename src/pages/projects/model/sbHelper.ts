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

export const uploadUserAvatar = async (userId: string, file: File): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (err) {
        console.error("Unexpected error in uploadUserAvatar: ", err);
        throw err;
    }
}

export const updateUserAvatar = async (userId: string, avatarPath: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('users')
            .update({ avatar_url: avatarPath })
            .eq('id', userId);

        if (error) throw error;
    } catch (err) {
        console.error("Unexpected error in updateUserAvatar: ", err);
        throw err;
    }
};

export const getAvatarUrl = (path: string): string => {
    const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

    return data.publicUrl;
};

