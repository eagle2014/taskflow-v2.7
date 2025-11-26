import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

app.use('*', logger(console.log));

// Routes will be added back after fixing database schema
// app.route('/make-server-8837ac96', teamRoutes);
// app.route('/make-server-8837ac96', userRoutes);
// app.route('/make-server-8837ac96', projectMemberRoutes);
// app.route('/make-server-8837ac96', migrationRoutes);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// === PROJECT CATEGORIES ===

// Get all project categories
app.get('/project-categories', async (c) => {
  try {
    console.log('📋 Fetching project categories');
    
    const { data: categories, error } = await supabase
      .from('project_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Error fetching categories:', error);
      // Fallback to static categories if table doesn't exist
      const staticCategories = [
        { id: 'web-development', name: 'Web Development', description: 'Frontend and backend web projects', color: '#0394ff' },
        { id: 'mobile-development', name: 'Mobile Development', description: 'iOS and Android applications', color: '#51cf66' },
        { id: 'design', name: 'Design', description: 'UI/UX and graphic design projects', color: '#ff8cc8' },
        { id: 'marketing', name: 'Marketing', description: 'Marketing campaigns and strategies', color: '#ffd43b' },
        { id: 'research', name: 'Research', description: 'Research and analysis projects', color: '#ff6b6b' },
        { id: 'data-analysis', name: 'Data Analysis', description: 'Data science and analytics', color: '#845ef7' },
        { id: 'infrastructure', name: 'Infrastructure', description: 'DevOps and system administration', color: '#20c997' },
        { id: 'content', name: 'Content', description: 'Content creation and documentation', color: '#fd7e14' },
      ];
      return c.json(staticCategories);
    }

    return c.json(categories || []);
  } catch (error) {
    console.error('❌ Categories fetch error:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// === PROJECTS ===

// Get all projects
app.get('/projects', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('📁 Fetching projects for user:', user.id);

    // Fetch projects without relationships to avoid foreign key errors
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching projects:', error);
      return c.json({ error: 'Failed to fetch projects' }, 500);
    }

    // Manually populate categories and tasks count if needed
    if (projects && projects.length > 0) {
      // Fetch categories separately
      const { data: categories } = await supabase
        .from('project_categories')
        .select('*');

      // Fetch task counts for each project
      const projectIds = projects.map(p => p.id);
      const { data: taskCounts } = await supabase
        .from('tasks')
        .select('project_id, status, priority')
        .in('project_id', projectIds);

      // Manually populate data
      const enrichedProjects = projects.map(project => ({
        ...project,
        category: categories?.find(cat => cat.id === project.category_id) || null,
        tasks: taskCounts?.filter(task => task.project_id === project.id) || []
      }));

      return c.json(enrichedProjects);
    }

    return c.json(projects || []);
  } catch (error) {
    console.error('❌ Projects fetch error:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

// Create new project
app.post('/projects', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    console.log('📁 Creating project:', body);

    const projectData = {
      ...body,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert without relationships to avoid foreign key errors
    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating project:', error);
      return c.json({ error: 'Failed to create project' }, 500);
    }

    // Manually populate category if needed
    if (project && project.category_id) {
      const { data: category } = await supabase
        .from('project_categories')
        .select('*')
        .eq('id', project.category_id)
        .single();

      if (category) {
        project.category = category;
      }
    }

    return c.json(project);
  } catch (error) {
    console.error('❌ Project creation error:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

// === TASKS ===

// Get tasks for a project
app.get('/projects/:projectId/tasks', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const projectId = c.req.param('projectId');
    console.log('📋 Fetching tasks for project:', projectId);

    // First verify user owns the project (no foreign key dependency)
    const { data: project } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return c.json({ error: 'Project not found or unauthorized' }, 404);
    }

    // Fetch tasks without relationships to avoid foreign key errors
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching tasks:', error);
      return c.json({ error: 'Failed to fetch tasks' }, 500);
    }

    // Manually populate project and related data if needed
    if (tasks && tasks.length > 0) {
      const taskIds = tasks.map(t => t.id);
      
      // Fetch events and comments separately
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .in('task_id', taskIds);

      const { data: comments } = await supabase
        .from('comments')
        .select('id, content, created_at, task_id')
        .in('task_id', taskIds);

      // Manually populate data
      const enrichedTasks = tasks.map(task => ({
        ...task,
        project: project,
        events: events?.filter(event => event.task_id === task.id) || [],
        comments: comments?.filter(comment => comment.task_id === task.id) || []
      }));

      return c.json(enrichedTasks);
    }

    return c.json(tasks || []);
  } catch (error) {
    console.error('❌ Tasks fetch error:', error);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// Get all tasks for user
app.get('/tasks', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('📋 Fetching all tasks for user:', user.id);

    // Fetch tasks without relationships to avoid foreign key errors
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching all tasks:', error);
      return c.json({ error: 'Failed to fetch tasks' }, 500);
    }

    // Manually populate project data if needed
    if (tasks && tasks.length > 0) {
      const projectIds = [...new Set(tasks.map(task => task.project_id).filter(Boolean))];
      
      if (projectIds.length > 0) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name')
          .in('id', projectIds)
          .eq('user_id', user.id);

        // Manually join project data
        const tasksWithProjects = tasks.map(task => ({
          ...task,
          project: projects?.find(project => project.id === task.project_id) || null
        }));

        return c.json(tasksWithProjects);
      }
    }

    return c.json(tasks || []);
  } catch (error) {
    console.error('❌ All tasks fetch error:', error);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// Create new task
app.post('/tasks', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    console.log('📋 Creating task:', body);

    // Verify user owns the project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', body.project_id)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return c.json({ error: 'Project not found or unauthorized' }, 404);
    }

    const taskData = {
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating task:', error);
      return c.json({ error: 'Failed to create task' }, 500);
    }

    return c.json(task);
  } catch (error) {
    console.error('❌ Task creation error:', error);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

// === EVENTS ===

// Get all events for calendar (both standalone and task-related)
app.get('/calendar/events', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('📅 Fetching calendar events for user:', user.id);

    // Get standalone events (user_id matches and task_id is null)
    const { data: standaloneEvents, error: standaloneError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .is('task_id', null)
      .order('date', { ascending: true });

    if (standaloneError) {
      console.error('❌ Error fetching standalone events:', standaloneError);
      return c.json({ error: 'Failed to fetch standalone events' }, 500);
    }

    // Get task-related events (without relationships to avoid foreign key errors)
    const { data: userTasks } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('user_id', user.id);

    let taskEvents = [];
    if (userTasks && userTasks.length > 0) {
      const taskIds = userTasks.map(task => task.id);
      
      const { data: taskRelatedEvents, error: taskError } = await supabase
        .from('events')
        .select('*')
        .in('task_id', taskIds)
        .not('task_id', 'is', null)
        .order('date', { ascending: true });

      if (!taskError && taskRelatedEvents) {
        // Manually populate task data
        taskEvents = taskRelatedEvents.map(event => ({
          ...event,
          task: userTasks.find(task => task.id === event.task_id) || null
        }));
      }
    }

    // Combine both types of events
    const allEvents = [...(standaloneEvents || []), ...taskEvents];
    
    console.log(`✅ Fetched ${allEvents.length} events (${standaloneEvents?.length || 0} standalone, ${taskEvents?.length || 0} task-related)`);
    return c.json(allEvents);
  } catch (error) {
    console.error('❌ Calendar data fetch error:', error);
    return c.json({ error: 'Failed to fetch calendar data' }, 500);
  }
});

// Get all tasks for calendar display
app.get('/calendar/tasks', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('📋 Fetching tasks for calendar display for user:', user.id);

    // Fetch tasks without relationships to avoid foreign key errors
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('❌ Error fetching tasks for calendar:', error);
      return c.json({ error: 'Failed to fetch tasks' }, 500);
    }

    // Manually populate project data if needed
    if (tasks && tasks.length > 0) {
      const projectIds = [...new Set(tasks.map(task => task.project_id).filter(Boolean))];
      
      if (projectIds.length > 0) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name')
          .in('id', projectIds)
          .eq('user_id', user.id);

        const tasksWithProjects = tasks.map(task => ({
          ...task,
          project: projects?.find(project => project.id === task.project_id) || null
        }));

        return c.json(tasksWithProjects);
      }
    }

    return c.json(tasks || []);
  } catch (error) {
    console.error('❌ Tasks fetch error:', error);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// Get events for a task
app.get('/tasks/:taskId/events', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taskId = c.req.param('taskId');
    console.log('📅 Fetching events for task:', taskId);

    // First verify user owns the task (no foreign key dependency)
    const { data: task } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (!task) {
      return c.json({ error: 'Task not found or unauthorized' }, 404);
    }

    // Fetch events without relationships to avoid foreign key errors
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('task_id', taskId)
      .order('date', { ascending: true });

    if (error) {
      console.error('❌ Error fetching events:', error);
      return c.json({ error: 'Failed to fetch events' }, 500);
    }

    // Manually populate task data
    const eventsWithTask = events?.map(event => ({
      ...event,
      task: task
    })) || [];

    return c.json(eventsWithTask);
  } catch (error) {
    console.error('❌ Events fetch error:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// Create new event
app.post('/events', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    console.log('📅 Creating event:', body);

    // If task_id is provided, verify user owns the task (no foreign key dependency)
    if (body.task_id) {
      const { data: task } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', body.task_id)
        .eq('user_id', user.id)
        .single();

      if (!task) {
        return c.json({ error: 'Task not found or unauthorized' }, 404);
      }
    }

    // Prepare event data with proper structure
    const eventData = {
      title: body.title,
      description: body.description || null,
      task_id: body.task_id || null,
      type: body.type || 'event',
      date: body.date,
      start_time: body.startTime || '09:00',
      end_time: body.endTime || null,
      location: body.location || null,
      attendees: body.attendees || null,
      color: body.color || '#0394ff',
      reminder_minutes: body.reminder_minutes || 15,
      user_id: body.task_id ? null : user.id, // Only set user_id for standalone events
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('📅 Event data to insert:', eventData);

    const { data: event, error } = await supabase
      .from('events')
      .insert([eventData])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating event:', error);
      return c.json({ error: `Failed to create event: ${error.message}` }, 500);
    }

    console.log('✅ Event created successfully:', event);
    return c.json(event);
  } catch (error) {
    console.error('❌ Event creation error:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

// === COMMENTS ===

// Get comments for a task
app.get('/tasks/:taskId/comments', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taskId = c.req.param('taskId');
    console.log('💬 Fetching comments for task:', taskId);

    // First verify user owns the task (no foreign key dependency)
    const { data: task } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (!task) {
      return c.json({ error: 'Task not found or unauthorized' }, 404);
    }

    // Fetch comments without relationships to avoid foreign key errors
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching comments:', error);
      return c.json({ error: 'Failed to fetch comments' }, 500);
    }

    // Manually populate task data
    const commentsWithTask = comments?.map(comment => ({
      ...comment,
      task: task
    })) || [];

    return c.json(commentsWithTask);
  } catch (error) {
    console.error('❌ Comments fetch error:', error);
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

// Create new comment
app.post('/comments', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    console.log('💬 Creating comment:', body);

    // Verify user owns the task (no foreign key dependency)
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', body.task_id)
      .eq('user_id', user.id)
      .single();

    if (!task) {
      return c.json({ error: 'Task not found or unauthorized' }, 404);
    }

    const commentData = {
      ...body,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: comment, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating comment:', error);
      return c.json({ error: 'Failed to create comment' }, 500);
    }

    return c.json(comment);
  } catch (error) {
    console.error('❌ Comment creation error:', error);
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// === AUTHENTICATION ===

// User signup
app.post('/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    console.log('🔐 Creating user account:', email);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (error) {
      console.error('❌ Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user, message: 'Account created successfully' });
  } catch (error) {
    console.error('❌ Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Seed project categories
app.post('/seed/categories', async (c) => {
  try {
    console.log('🌱 Seeding project categories');
    
    const categories = [
      { id: 'web-development', name: 'Web Development', description: 'Frontend and backend web projects', color: '#0394ff' },
      { id: 'mobile-development', name: 'Mobile Development', description: 'iOS and Android applications', color: '#51cf66' },
      { id: 'design', name: 'Design', description: 'UI/UX and graphic design projects', color: '#ff8cc8' },
      { id: 'marketing', name: 'Marketing', description: 'Marketing campaigns and strategies', color: '#ffd43b' },
      { id: 'research', name: 'Research', description: 'Research and analysis projects', color: '#ff6b6b' },
      { id: 'data-analysis', name: 'Data Analysis', description: 'Data science and analytics', color: '#845ef7' },
      { id: 'infrastructure', name: 'Infrastructure', description: 'DevOps and system administration', color: '#20c997' },
      { id: 'content', name: 'Content', description: 'Content creation and documentation', color: '#fd7e14' },
    ];

    const { data, error } = await supabase
      .from('project_categories')
      .upsert(categories, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('❌ Error seeding categories:', error);
      return c.json({ error: 'Failed to seed categories' }, 500);
    }

    return c.json({ categories: data, message: 'Categories seeded successfully' });
  } catch (error) {
    console.error('❌ Category seeding error:', error);
    return c.json({ error: 'Failed to seed categories' }, 500);
  }
});

Deno.serve(app.fetch);