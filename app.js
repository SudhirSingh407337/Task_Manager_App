// Task Manager Application
class TaskManager {
    constructor() {
        // Initialize Supabase client
        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey || 
            SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || 
            SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
            this.showToast('Please configure your Supabase credentials in config.js', 'error');
            return;
        }

        this.supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        this.currentUser = null;
        this.tasks = [];
        this.filters = {
            status: 'all',
            priority: 'all'
        };

        this.initializeApp();
    }

    async initializeApp() {
        this.setupEventListeners();
        
        // Check if user is already logged in
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.handleAuthSuccess(session.user);
        }

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.handleAuthSuccess(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.handleSignOut();
            }
        });

        // Set up real-time subscriptions
        this.setupRealtimeSubscription();
    }

    setupEventListeners() {
        // Auth form toggles
        document.getElementById('show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthForm('signup');
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthForm('login');
        });

        // Auth buttons
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('signup-btn').addEventListener('click', () => this.handleSignup());
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

        // Task form
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTask();
        });

        // Filters
        document.getElementById('filter-status').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderTasks();
        });

        document.getElementById('filter-priority').addEventListener('change', (e) => {
            this.filters.priority = e.target.value;
            this.renderTasks();
        });

        // Enter key handlers for auth forms
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        document.getElementById('signup-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSignup();
        });
    }

    toggleAuthForm(form) {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (form === 'signup') {
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
        } else {
            signupForm.classList.remove('active');
            loginForm.classList.add('active');
        }
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        this.showLoading(true);

        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        this.showLoading(false);

        if (error) {
            this.showToast(`Login failed: ${error.message}`, 'error');
        } else {
            this.showToast('Login successful!', 'success');
            // Clear form
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
        }
    }

    async handleSignup() {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (!email || !password) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (password.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return;
        }

        this.showLoading(true);

        const { data, error } = await this.supabase.auth.signUp({
            email,
            password
        });

        this.showLoading(false);

        if (error) {
            this.showToast(`Signup failed: ${error.message}`, 'error');
        } else {
            if (data.user && !data.user.email_confirmed_at) {
                this.showToast('Please check your email to confirm your account', 'warning');
            } else {
                this.showToast('Account created successfully!', 'success');
            }
            // Clear form
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
        }
    }

    async handleLogout() {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
            this.showToast(`Logout failed: ${error.message}`, 'error');
        } else {
            this.showToast('Logged out successfully', 'success');
        }
    }

    handleAuthSuccess(user) {
        this.currentUser = user;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('auth-forms').classList.add('hidden');
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        this.loadTasks();
    }

    handleSignOut() {
        this.currentUser = null;
        this.tasks = [];
        document.getElementById('auth-forms').classList.remove('hidden');
        document.getElementById('user-info').classList.add('hidden');
        document.getElementById('main-content').classList.add('hidden');
        this.toggleAuthForm('login');
    }

    async handleAddTask() {
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const priority = document.getElementById('task-priority').value;

        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        this.showLoading(true);

        const { data, error } = await this.supabase
            .from('tasks')
            .insert([
                {
                    title,
                    description: description || null,
                    priority,
                    user_id: this.currentUser.id
                }
            ])
            .select();

        this.showLoading(false);

        if (error) {
            this.showToast(`Failed to add task: ${error.message}`, 'error');
        } else {
            this.showToast('Task added successfully!', 'success');
            // Clear form
            document.getElementById('task-title').value = '';
            document.getElementById('task-description').value = '';
            document.getElementById('task-priority').value = 'medium';
            
            // Refresh tasks
            this.loadTasks();
        }
    }

    async loadTasks() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('no-tasks').classList.add('hidden');

        const { data, error } = await this.supabase
            .from('tasks')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });

        document.getElementById('loading').classList.add('hidden');

        if (error) {
            this.showToast(`Failed to load tasks: ${error.message}`, 'error');
            return;
        }

        this.tasks = data || [];
        this.renderTasks();
    }

    renderTasks() {
        const container = document.getElementById('tasks-container');
        const loading = document.getElementById('loading');
        const noTasks = document.getElementById('no-tasks');

        // Clear existing task cards
        const existingCards = container.querySelectorAll('.task-card');
        existingCards.forEach(card => card.remove());

        // Filter tasks
        let filteredTasks = this.tasks;

        if (this.filters.status !== 'all') {
            filteredTasks = filteredTasks.filter(task => {
                if (this.filters.status === 'completed') return task.completed;
                if (this.filters.status === 'pending') return !task.completed;
                return true;
            });
        }

        if (this.filters.priority !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === this.filters.priority);
        }

        if (filteredTasks.length === 0) {
            noTasks.classList.remove('hidden');
            return;
        }

        noTasks.classList.add('hidden');

        // Render filtered tasks
        filteredTasks.forEach(task => {
            const taskCard = this.createTaskCard(task);
            container.appendChild(taskCard);
        });
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''} ${task.priority}-priority`;
        
        const createdDate = new Date(task.created_at).toLocaleDateString();
        const updatedDate = new Date(task.updated_at).toLocaleDateString();

        card.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
                <span>Created: ${createdDate}</span>
                <span>Updated: ${updatedDate}</span>
            </div>
            <div class="task-actions">
                <button class="btn ${task.completed ? 'btn-secondary' : 'btn-success'}" 
                        onclick="taskManager.toggleTask('${task.id}', ${!task.completed})">
                    ${task.completed ? 'Mark Pending' : 'Mark Complete'}
                </button>
                <button class="btn btn-primary" onclick="taskManager.editTask('${task.id}')">
                    Edit
                </button>
                <button class="btn btn-danger" onclick="taskManager.deleteTask('${task.id}')">
                    Delete
                </button>
            </div>
        `;

        return card;
    }

    async toggleTask(taskId, completed) {
        this.showLoading(true);

        const { error } = await this.supabase
            .from('tasks')
            .update({ completed })
            .eq('id', taskId);

        this.showLoading(false);

        if (error) {
            this.showToast(`Failed to update task: ${error.message}`, 'error');
        } else {
            this.showToast(`Task ${completed ? 'completed' : 'marked as pending'}!`, 'success');
            this.loadTasks();
        }
    }

    async editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newTitle = prompt('Edit task title:', task.title);
        if (newTitle === null) return; // User cancelled

        const newDescription = prompt('Edit task description:', task.description || '');
        if (newDescription === null) return; // User cancelled

        this.showLoading(true);

        const { error } = await this.supabase
            .from('tasks')
            .update({
                title: newTitle.trim() || task.title,
                description: newDescription.trim() || null
            })
            .eq('id', taskId);

        this.showLoading(false);

        if (error) {
            this.showToast(`Failed to update task: ${error.message}`, 'error');
        } else {
            this.showToast('Task updated successfully!', 'success');
            this.loadTasks();
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        this.showLoading(true);

        const { error } = await this.supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        this.showLoading(false);

        if (error) {
            this.showToast(`Failed to delete task: ${error.message}`, 'error');
        } else {
            this.showToast('Task deleted successfully!', 'success');
            this.loadTasks();
        }
    }

    setupRealtimeSubscription() {
        if (!this.supabase) return;

        // Subscribe to real-time changes
        this.supabase
            .channel('tasks')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'tasks',
                filter: `user_id=eq.${this.currentUser?.id}`
            }, () => {
                // Reload tasks when changes occur
                if (this.currentUser) {
                    this.loadTasks();
                }
            })
            .subscribe();
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);

        // Remove on click
        toast.addEventListener('click', () => toast.remove());
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});
