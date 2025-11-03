export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  project_id: string;
  title: string;
  content: any;
  parent_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  project_id: string;
  name: string;
  columns: Column[];
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
  order: number;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  labels: string[];
  linked_page_id?: string;
  order: number;
}

export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export interface ProjectMember {
  id: string;
  user_id: string;
  project_id: string;
  role: Role;
  joined_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  project_id: string;
  action: string;
  resource_type: 'page' | 'board' | 'card';
  resource_id: string;
  metadata?: any;
  created_at: string;
}