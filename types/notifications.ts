// Notification types
export type NotificationType = 
  | 'team_invite' 
  | 'mention' 
  | 'major_change' 
  | 'card_assigned' 
  | 'comment';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, any>;
  link?: string;
  project_id?: string;
  triggered_by?: string;
  created_at: string;
  read_at?: string;
  
  // Joined data (from queries)
  triggered_by_user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface NotificationWithUser extends Notification {
  triggered_by_user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}
