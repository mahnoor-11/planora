// ===== LOCAL STORAGE SETUP =====
const STORAGE_KEYS = {
    tasks: 'planora_tasks',
    habits: 'planora_habits',
    goals: 'planora_goals',
    notes: 'planora_notes',
    settings: 'planora_settings'
};

// ===== DATA INITIALIZATION =====
let appData = {
    tasks: [],
    habits: [],
    goals: [],
    notes: [],
    settings: {
        darkMode: true,
        aiSuggestions: true,
        focusTime: 25
    }
};

// Load data from localStorage
function loadData() {
    Object.keys(STORAGE_KEYS).forEach(key => {
        const stored = localStorage.getItem(STORAGE_KEYS[key]);
        if (stored) {
            appData[key] = JSON.parse(stored);
        }
    });
}

// Save data to localStorage
function saveData() {
    Object.keys(STORAGE_KEYS).forEach(key => {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(appData[key]));
    });
}

// ===== PAGE NAVIGATION =====
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('data-page');
            
            // Remove active class from all items and pages
            navItems.forEach(nav => nav.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));
            
            // Add active class to clicked item and corresponding page
            item.classList.add('active');
            document.getElementById(pageId).classList.add('active');
        });
    });
}

// ===== DASHBOARD PAGE =====
function updateGreeting() {
    const greeting = document.getElementById('greeting');
    const dateElement = document.getElementById('current-date');
    const hour = new Date().getHours();
    
    let greetingText = 'Good morning';
    if (hour >= 12) greetingText = 'Good afternoon';
    if (hour >= 18) greetingText = 'Good evening';
    
    greeting.textContent = `${greetingText}, welcome back`;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date().toLocaleDateString('en-US', options);
    dateElement.textContent = date;
}

const quotes = [
    { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'Success is not final, failure is not fatal.', author: 'Winston Churchill' },
    { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
    { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
    { text: 'Your limitation—it\'s only your imagination.', author: 'Unknown' },
    { text: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' }
];

function updateDailyQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('daily-quote').textContent = quote.text;
    document.getElementById('quote-author').textContent = `— ${quote.author}`;
}

function updateDashboardStats() {
    const completedTasks = appData.tasks.filter(t => t.completed).length;
    document.getElementById('tasks-done').textContent = completedTasks;
    
    const completedHabits = appData.habits.filter(h => h.completed).length;
    const totalHabits = appData.habits.length;
    document.getElementById('habits-completed').textContent = completedHabits;
    document.getElementById('habits-total').textContent = totalHabits;
    
    const completedGoals = appData.goals.filter(g => g.progress === 100).length;
    const totalGoals = appData.goals.length;
    const goalProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    document.getElementById('goal-progress').textContent = `${goalProgress}%`;
    
    document.getElementById('productivity').textContent = completedTasks + completedHabits;
    
    updateLocalStorageCount();
}

function updateLocalStorageCount() {
    const totalItems = appData.tasks.length + appData.habits.length + appData.goals.length + appData.notes.length;
    document.getElementById('local-storage-count').textContent = totalItems;
}

function renderDashboardTasks() {
    const list = document.getElementById('dashboard-tasks-list');
    const todayTasks = appData.tasks.filter(t => !t.completed).slice(0, 5);
    
    if (todayTasks.length === 0) {
        list.innerHTML = '<p class="empty-state">Nothing planned. Add your first task above ✨</p>';
        return;
    }
    
    list.innerHTML = todayTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">🗑</button>
        </div>
    `).join('');
}

function renderDashboardGoals() {
    const container = document.getElementById('dashboard-goals');
    const goals = appData.goals.slice(0, 3);
    
    if (goals.length === 0) {
        container.innerHTML = '<p class="empty-state">No goals yet. <a href="#goals" class="link">Create one</a></p>';
        return;
    }
    
    container.innerHTML = goals.map(goal => `
        <div class="goal-item">
            <div class="goal-info">
                <div class="goal-title">${escapeHtml(goal.title)}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderDashboardHabits() {
    const container = document.getElementById('dashboard-habits');
    const habits = appData.habits.slice(0, 3);
    
    if (habits.length === 0) {
        container.innerHTML = '<p class="empty-state">Start tracking <a href="#habits" class="link">habits</a>.</p>';
        return;
    }
    
    container.innerHTML = habits.map(habit => `
        <div class="habit-item">
            <input type="checkbox" class="checkbox" ${habit.completed ? 'checked' : ''} onchange="toggleHabit(${habit.id})">
            <div class="habit-info">
                <div class="habit-name">${escapeHtml(habit.name)}</div>
                <div class="habit-streak">Streak: <span class="streak-badge">🔥 ${habit.streak}</span></div>
            </div>
        </div>
    `).join('');
}

// ===== TASKS PAGE =====
function initTasksPage() {
    const input = document.getElementById('task-input');
    const priority = document.getElementById('task-priority');
    const addBtn = document.getElementById('add-task-btn');
    
    addBtn.addEventListener('click', () => addTask(input.value, priority.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask(input.value, priority.value);
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.getAttribute('data-filter'));
        });
    });
    
    renderTasks('all');
}

function addTask(text, priority = 'Medium') {
    if (!text.trim()) return;
    
    const task = {
        id: Date.now(),
        text: text,
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    appData.tasks.unshift(task);
    saveData();
    
    document.getElementById('task-input').value = '';
    renderTasks('all');
    updateDashboardStats();
    renderDashboardTasks();
}

function toggleTask(id) {
    const task = appData.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderTasks('all');
        updateDashboardStats();
        renderDashboardTasks();
    }
}

function deleteTask(id) {
    appData.tasks = appData.tasks.filter(t => t.id !== id);
    saveData();
    renderTasks('all');
    updateDashboardStats();
    renderDashboardTasks();
}

function renderTasks(filter = 'all') {
    const list = document.getElementById('tasks-list');
    let tasks = appData.tasks;
    
    if (filter === 'active') tasks = tasks.filter(t => !t.completed);
    if (filter === 'done') tasks = tasks.filter(t => t.completed);
    if (filter === 'urgent') tasks = tasks.filter(t => t.priority === 'High');
    
    const active = appData.tasks.filter(t => !t.completed).length;
    const completed = appData.tasks.filter(t => t.completed).length;
    document.getElementById('tasks-count').textContent = `${active} active · ${completed} completed`;
    
    if (tasks.length === 0) {
        list.innerHTML = '<p class="empty-state">No tasks yet. Create one above!</p>';
        return;
    }
    
    list.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    <span>${new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">🗑</button>
        </div>
    `).join('');
}

// ===== CALENDAR PAGE =====
function initCalendar() {
    renderCalendar();
    
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('month-year').textContent = 
        currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createDayElement(day, 'other-month', new Date(year, month - 1, day));
        calendarDays.appendChild(dayEl);
    }
    
    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        let className = '';
        
        if (date.toDateString() === today.toDateString()) {
            className = 'today';
        }
        
        const dayEl = createDayElement(day, className, date);
        calendarDays.appendChild(dayEl);
    }
    
    // Next month days
    const remainingDays = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
        const dayEl = createDayElement(day, 'other-month', new Date(year, month + 1, day));
        calendarDays.appendChild(dayEl);
    }
}

function createDayElement(day, className, date) {
    const dayEl = document.createElement('div');
    dayEl.className = `calendar-day ${className}`;
    dayEl.textContent = day;
    dayEl.addEventListener('click', () => {
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        dayEl.classList.add('selected');
        updateCalendarEvents(date);
    });
    return dayEl;
}

function updateCalendarEvents(date) {
    const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    document.getElementById('selected-date').textContent = dateStr;
    
    // Get events for this date (tasks and habits scheduled)
    const eventsList = document.getElementById('calendar-events-list');
    const tasksOnDate = appData.tasks.filter(t => {
        const taskDate = new Date(t.createdAt).toDateString();
        return taskDate === date.toDateString();
    });
    
    if (tasksOnDate.length === 0) {
        eventsList.innerHTML = '<p class="empty-state">No events scheduled</p>';
        return;
    }
    
    eventsList.innerHTML = tasksOnDate.map(task => `
        <div class="event-item">${escapeHtml(task.text)}</div>
    `).join('');
}

// ===== HABITS PAGE =====
function initHabits() {
    const input = document.getElementById('habit-input');
    const addBtn = document.getElementById('add-habit-btn');
    
    addBtn.addEventListener('click', () => addHabit(input.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addHabit(input.value);
    });
    
    renderHabits();
}

function addHabit(name) {
    if (!name.trim()) return;
    
    const habit = {
        id: Date.now(),
        name: name,
        streak: 0,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    appData.habits.push(habit);
    saveData();
    
    document.getElementById('habit-input').value = '';
    renderHabits();
    updateDashboardStats();
    renderDashboardHabits();
}

function toggleHabit(id) {
    const habit = appData.habits.find(h => h.id === id);
    if (habit) {
        habit.completed = !habit.completed;
        if (habit.completed) habit.streak++;
        saveData();
        renderHabits();
        updateDashboardStats();
        renderDashboardHabits();
    }
}

function deleteHabit(id) {
    appData.habits = appData.habits.filter(h => h.id !== id);
    saveData();
    renderHabits();
    updateDashboardStats();
    renderDashboardHabits();
}

function renderHabits() {
    const list = document.getElementById('habits-list');
    
    if (appData.habits.length === 0) {
        list.innerHTML = '<p class="empty-state">No habits yet. Start with one!</p>';
        return;
    }
    
    list.innerHTML = appData.habits.map(habit => `
        <div class="habit-item">
            <input type="checkbox" class="checkbox" ${habit.completed ? 'checked' : ''} onchange="toggleHabit(${habit.id})">
            <div class="habit-info">
                <div class="habit-name">${escapeHtml(habit.name)}</div>
                <div class="habit-streak">Streak: <span class="streak-badge">🔥 ${habit.streak}</span></div>
            </div>
            <button class="delete-btn" onclick="deleteHabit(${habit.id})">🗑</button>
        </div>
    `).join('');
}

// ===== GOALS PAGE =====
function initGoals() {
    const input = document.getElementById('goal-input');
    const deadline = document.getElementById('goal-deadline');
    const addBtn = document.getElementById('add-goal-btn');
    
    addBtn.addEventListener('click', () => addGoal(input.value, deadline.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGoal(input.value, deadline.value);
    });
    
    renderGoals();
}

function addGoal(title, deadline) {
    if (!title.trim()) return;
    
    const goal = {
        id: Date.now(),
        title: title,
        deadline: deadline,
        progress: 0,
        createdAt: new Date().toISOString()
    };
    
    appData.goals.push(goal);
    saveData();
    
    document.getElementById('goal-input').value = '';
    document.getElementById('goal-deadline').value = '';
    renderGoals();
    updateDashboardStats();
    renderDashboardGoals();
}

function updateGoalProgress(id, progress) {
    const goal = appData.goals.find(g => g.id === id);
    if (goal) {
        goal.progress = Math.min(100, Math.max(0, progress));
        saveData();
        renderGoals();
        updateDashboardStats();
        renderDashboardGoals();
    }
}

function deleteGoal(id) {
    appData.goals = appData.goals.filter(g => g.id !== id);
    saveData();
    renderGoals();
    updateDashboardStats();
    renderDashboardGoals();
}

function renderGoals() {
    const list = document.getElementById('goals-list');
    
    if (appData.goals.length === 0) {
        list.innerHTML = '<p class="empty-state">No goals yet. Dream big!</p>';
        return;
    }
    
    list.innerHTML = appData.goals.map(goal => `
        <div class="goal-item">
            <div class="goal-info">
                <div class="goal-title">${escapeHtml(goal.title)}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                </div>
                <div class="goal-deadline">
                    Progress: ${goal.progress}% ${goal.deadline ? `• Due: ${new Date(goal.deadline).toLocaleDateString()}` : ''}
                </div>
            </div>
            <input type="range" min="0" max="100" value="${goal.progress}" 
                   onchange="updateGoalProgress(${goal.id}, this.value)" style="width: 100px;">
            <button class="delete-btn" onclick="deleteGoal(${goal.id})">🗑</button>
        </div>
    `).join('');
}

// ===== NOTES PAGE =====
function initNotes() {
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    const addBtn = document.getElementById('add-note-btn');
    
    addBtn.addEventListener('click', () => addNote(titleInput.value, contentInput.value));
    
    renderNotes();
}

function addNote(title, content) {
    if (!title.trim() || !content.trim()) return;
    
    const note = {
        id: Date.now(),
        title: title,
        content: content,
        createdAt: new Date().toISOString()
    };
    
    appData.notes.push(note);
    saveData();
    
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    renderNotes();
}

function deleteNote(id) {
    appData.notes = appData.notes.filter(n => n.id !== id);
    saveData();
    renderNotes();
}

function renderNotes() {
    const list = document.getElementById('notes-list');
    
    if (appData.notes.length === 0) {
        list.innerHTML = '<p class="empty-state">No notes yet. Start writing!</p>';
        return;
    }
    
    list.innerHTML = appData.notes.map(note => `
        <div class="note-item">
            <div class="note-title-display">${escapeHtml(note.title)}</div>
            <div class="note-preview">${escapeHtml(note.content.substring(0, 100))}...</div>
            <div class="note-date">${new Date(note.createdAt).toLocaleDateString()}</div>
            <button class="delete-btn" onclick="deleteNote(${note.id})">🗑</button>
        </div>
    `).join('');
}

// ===== ANALYTICS PAGE =====
function updateAnalytics() {
    document.getElementById('weekly-tasks').textContent = appData.tasks.filter(t => t.completed).length;
    document.getElementById('active-habits').textContent = appData.habits.length;
    
    const habitCompletion = appData.habits.length > 0 
        ? Math.round((appData.habits.filter(h => h.completed).length / appData.habits.length) * 100)
        : 0;
    document.getElementById('habit-rate').textContent = `${habitCompletion}%`;
    
    document.getElementById('total-goals').textContent = appData.goals.length;
    document.getElementById('completed-goals').textContent = appData.goals.filter(g => g.progress === 100).length;
    
    document.getElementById('monthly-tasks').textContent = appData.tasks.length;
    document.getElementById('daily-avg').textContent = (appData.tasks.length / 30).toFixed(1);
}

// ===== SETTINGS PAGE =====
function initSettings() {
    const darkModeToggle = document.getElementById('dark-mode');
    const suggestBtn = document.getElementById('suggest-tasks-btn');
    const startFocusBtn = document.getElementById('start-focus-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    
    darkModeToggle.addEventListener('change', toggleDarkMode);
    suggestBtn.addEventListener('click', suggestTasks);
    startFocusBtn.addEventListener('click', startFocusSession);
    clearDataBtn.addEventListener('click', clearAllData);
}

function toggleDarkMode(e) {
    document.body.classList.toggle('light-mode', !e.target.checked);
    appData.settings.darkMode = e.target.checked;
    saveData();
}

function suggestTasks() {
    const suggestions = [
        'Review daily goals',
        'Complete priority tasks',
        'Exercise for 30 minutes',
        'Read for 20 minutes',
        'Plan tomorrow'
    ];
    
    suggestions.slice(0, 5).forEach(task => {
        addTask(task, 'Medium');
    });
    
    alert('5 tasks suggested!');
}

function startFocusSession() {
    const minutes = parseInt(document.getElementById('focus-timer').value);
    alert(`Focus session started for ${minutes} minutes!`);
    // Implement timer functionality here
}

function clearAllData() {
    if (confirm('Are you sure you want to erase all data? This cannot be undone.')) {
        appData = {
            tasks: [],
            habits: [],
            goals: [],
            notes: [],
            settings: appData.settings
        };
        saveData();
        location.reload();
    }
}

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== DASHBOARD ADD TASK BUTTONS =====
function initDashboardAddTask() {
    const input = document.getElementById('dashboard-task-input');
    const priority = document.getElementById('dashboard-task-priority');
    const addBtn = document.getElementById('dashboard-add-task');
    
    addBtn.addEventListener('click', () => {
        addTask(input.value, priority.value);
        input.value = '';
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(input.value, priority.value);
            input.value = '';
        }
    });
}

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    // Load data first
    loadData();
    
    // Initialize all components
    initializeNavigation();
    updateGreeting();
    updateDailyQuote();
    initTasksPage();
    initCalendar();
    initHabits();
    initGoals();
    initNotes();
    initSettings();
    initDashboardAddTask();
    
    // Update all displays
    updateDashboardStats();
    renderDashboardTasks();
    renderDashboardGoals();
    renderDashboardHabits();
    updateAnalytics();
    
    // Update stats every minute
    setInterval(() => {
        updateGreeting();
        updateDashboardStats();
    }, 60000);
});

// Periodic save
setInterval(saveData, 30000);