export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    created_at: Date;
    // другие поля при необходимости
  }