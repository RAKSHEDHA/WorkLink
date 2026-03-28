import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const auth = {
  signIn: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  },
  signUp: async () => {
    // In OAuth, sign up and sign in are often handled together via OAuth flow
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  getSession: async () => {
    return await supabase.auth.getSession();
  }
};

export const jobs = {
  post: async (
    recruiterId: string, 
    title: string, 
    description: string, 
    budget: number, 
    meetLink?: string, 
    scheduleTime?: string
  ) => {
    return await supabase
      .from('jobs')
      .insert([
        { recruiter_id: recruiterId, title, description, budget, meet_link: meetLink, schedule_time: scheduleTime }
      ])
      .select();
  }
};

export const tasks = {
  allot: async (projectId: string, title: string, assignedTo: string, deadline?: string) => {
    return await supabase
      .from('tasks')
      .insert([
        { project_id: projectId, title, assigned_to: assignedTo, deadline }
      ])
      .select();
  }
};

export const workroom = {
  fetch: async (jobId: string, senderId?: string, receiverId?: string) => {
    // Pulling shared tasks for a workroom/project
    const { data: projectTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', jobId);

    // Pulling shared chat messages
    let query = supabase.from('messages').select('*');
    if (senderId && receiverId) {
      query = query.or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`);
    }

    const { data: messages, error: messagesError } = await query.order('created_at', { ascending: true });

    return { projectTasks, tasksError, messages, messagesError };
  }
};

export const realtimeEngine = {
  setupWorkroomListeners: (
    onTaskUpdate: (payload: any) => void,
    onMessageUpdate: (payload: any) => void,
    projectId?: string
  ) => {
    const taskFilter = projectId ? `project_id=eq.${projectId}` : undefined;

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: taskFilter },
        (payload) => onTaskUpdate(payload)
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => onMessageUpdate(payload)
      )
      .subscribe();

    // Returns a cleanup function directly for React components
    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(messagesChannel);
    };
  }
};
