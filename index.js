class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        // Form ketika submit
        document.getElementById('todoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter buttons
        document.getElementById('filterAll').addEventListener('click', () => this.setFilter('all'));
        document.getElementById('filterPending').addEventListener('click', () => this.setFilter('pending'));
        document.getElementById('filterCompleted').addEventListener('click', () => this.setFilter('completed'));
        document.getElementById('filterOverdue').addEventListener('click', () => this.setFilter('overdue'));
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const dueDate = document.getElementById('dueDate');
        
        if (!input.value.trim()) return;

        const todo = {
            id: Date.now(),
            text: input.value.trim(),
            completed: false,
            dueDate: dueDate.value || null,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.render();
        this.updateStats();
        
        // Clear form
        input.value = '';
        dueDate.value = '';
        input.focus();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
        this.updateStats();
    }

    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.updateFilterButtons();
        this.render();
    }

    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-white/40');
            btn.classList.add('bg-white/20');
        });
        
        const activeBtn = document.getElementById(`filter${this.currentFilter.charAt(0).toUpperCase() + this.currentFilter.slice(1)}`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-white/40');
            activeBtn.classList.remove('bg-white/20');
        }
    }

    getFilteredTodos() {
        const today = new Date().toISOString().split('T')[0];
        
        switch (this.currentFilter) {
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'overdue':
                return this.todos.filter(todo => 
                    !todo.completed && 
                    todo.dueDate && 
                    todo.dueDate < today
                );
            default:
                return this.todos;
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    getDaysUntilDue(dueDateString) {
        if (!dueDateString) return null;
        const today = new Date();
        const dueDate = new Date(dueDateString);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    isOverdue(todo) {
        if (!todo.dueDate || todo.completed) return false;
        const today = new Date().toISOString().split('T')[0];
        return todo.dueDate < today;
    }

    getDueDateStatus(todo) {
        if (!todo.dueDate) return { text: '', class: '', icon: '' };
        
        const daysUntil = this.getDaysUntilDue(todo.dueDate);
        const isOverdue = this.isOverdue(todo);
        
        if (isOverdue) {
            return {
                text: `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`,
                class: 'overdue',
                icon: 'fas fa-exclamation-triangle'
            };
        } else if (daysUntil === 0) {
            return {
                text: 'Due today!',
                class: 'due-today',
                icon: 'fas fa-clock'
            };
        } else if (daysUntil === 1) {
            return {
                text: 'Due tomorrow',
                class: 'due-tomorrow',
                icon: 'fas fa-clock'
            };
        } else if (daysUntil <= 3) {
            return {
                text: `Due in ${daysUntil} days`,
                class: 'due-soon',
                icon: 'fas fa-calendar'
            };
        } else {
            return {
                text: `Due in ${daysUntil} days`,
                class: 'due-later',
                icon: 'fas fa-calendar'
            };
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        todoList.innerHTML = filteredTodos.map(todo => {
            const dueDateStatus = this.getDueDateStatus(todo);
            const dueDateText = todo.dueDate ? this.formatDate(todo.dueDate) : '';
            
            return `
                <div class="todo-item ${todo.completed ? 'completed' : ''}">
                    <div class="todo-content">
                        <div class="todo-main">
                            <button 
                                onclick="app.toggleTodo(${todo.id})"
                                class="toggle-btn ${todo.completed ? 'completed' : ''}"
                            >
                                ${todo.completed ? '<i class="fas fa-check icon-small"></i>' : ''}
                            </button>
                            <div class="todo-text">
                                <p class="${todo.completed ? 'completed' : ''}">
                                    ${todo.text}
                                </p>
                                ${todo.dueDate ? `
                                    <div class="due-date-info">
                                        <i class="${dueDateStatus.icon} icon-small"></i>
                                        <span class="${dueDateStatus.class}">
                                            ${dueDateStatus.text}
                                        </span>
                                        <span class="due-date-text">
                                            (${dueDateText})
                                        </span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <button 
                            onclick="app.deleteTodo(${todo.id})"
                            class="delete-btn"
                            title="Delete todo"
                        >
                            <i class="fas fa-trash icon-small"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const total = this.todos.length;
        const pending = this.todos.filter(todo => !todo.completed).length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const overdue = this.todos.filter(todo => this.isOverdue(todo)).length;

        document.getElementById('todoStats').textContent = 
            `Total: ${total} | Pending: ${pending} | Completed: ${completed}${overdue > 0 ? ` | Overdue: ${overdue}` : ''}`;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// Inisialisasi web ketika DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});

