# 📋 Task Manager - Full Stack Web Application

A complete task management application built with HTML, CSS, JavaScript, and Supabase as the backend. Features user authentication, real-time updates, and secure data management.

## ✨ Features

- **User Authentication**: Secure signup and login with Supabase Auth
- **Task Management**: Create, read, update, and delete tasks
- **Priority Levels**: Organize tasks by Low, Medium, and High priority
- **Status Filtering**: Filter tasks by completion status and priority
- **Real-time Updates**: Live synchronization across browser sessions
- **Responsive Design**: Works on desktop and mobile devices
- **Secure**: Row Level Security (RLS) ensures users only see their own tasks

## 🚀 Live Demo

[Insert your live demo link here]

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Hosting**: [Your hosting platform]

## 📦 Installation & Setup

### Prerequisites
- A Supabase account (free at [supabase.com](https://supabase.com))
- A web server (Python, Node.js, or any static file server)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/task-manager-app.git
cd task-manager-app
```

### 2. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > API and copy your Project URL and anon key
3. Update `config.js` with your credentials:
```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

### 3. Database Setup
Run this SQL in your Supabase SQL Editor:

```sql
-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Create function for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamps
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 4. Run the Application
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Open your browser and navigate to `http://localhost:8000`

## 📱 Usage

1. **Sign Up**: Create a new account with email and password
2. **Login**: Access your personal task dashboard
3. **Add Tasks**: Create tasks with titles, descriptions, and priority levels
4. **Manage Tasks**: Mark as complete, edit, or delete tasks
5. **Filter**: View tasks by status (all/pending/completed) and priority

## 🏗️ Project Structure

```
task-manager-app/
├── index.html          # Main HTML file
├── app.js              # JavaScript application logic
├── config.js           # Supabase configuration
├── styles.css          # CSS styling
├── README.md           # Project documentation
└── .gitignore          # Git ignore rules
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level security ensuring data isolation
- **User Authentication**: Secure login/signup with Supabase Auth
- **Input Validation**: Client and server-side validation
- **SQL Injection Protection**: Parameterized queries through Supabase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the excellent backend-as-a-service
- Icons and design inspiration from various open-source projects

## 📞 Contact

Your Name - [your.email@example.com](mailto:your.email@example.com)

Project Link: [https://github.com/yourusername/task-manager-app](https://github.com/yourusername/task-manager-app)
