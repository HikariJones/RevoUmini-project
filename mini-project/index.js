// Todo List Application
class TodoWeb {
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
        // Form submission
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

    isOverdue(todo) {
        if (!todo.dueDate || todo.completed) return false;
        const today = new Date().toISOString().split('T')[0];
        return todo.dueDate < today;
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
            const isOverdue = this.isOverdue(todo);
            const dueDateText = todo.dueDate ? this.formatDate(todo.dueDate) : '';
            
            return `
                <div class="todo-item bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-all duration-300 ${todo.completed ? 'opacity-75' : ''}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center flex-1 min-w-0">
                            <button 
                                onclick="app.toggleTodo(${todo.id})"
                                class="mr-3 w-6 h-6 rounded-full border-2 border-white/60 flex items-center justify-center hover:border-white/80 transition-all duration-300 ${todo.completed ? 'bg-green-500 border-green-500' : 'hover:bg-white/20'}"
                            >
                                ${todo.completed ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                            </button>
                            <div class="flex-1 min-w-0">
                                <p class="text-white font-medium ${todo.completed ? 'line-through opacity-75' : ''} break-words">
                                    ${todo.text}
                                </p>
                                ${dueDateText ? `
                                    <p class="text-white/60 text-sm mt-1 ${isOverdue ? 'text-red-300 font-semibold' : ''}">
                                        <i class="fas fa-calendar-alt mr-1"></i>
                                        Due: ${dueDateText}
                                        ${isOverdue ? ' (Overdue!)' : ''}
                                    </p>
                                ` : ''}
                            </div>
                        </div>
                        <button 
                            onclick="app.deleteTodo(${todo.id})"
                            class="ml-3 p-2 text-white/60 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                            title="Delete todo"
                        >
                            <i class="fas fa-trash text-sm"></i>
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoWeb();
});

// Add some custom CSS for better styling
const style = document.createElement('style');
style.textContent = `
    .filter-btn.active {
        background-color: rgba(255, 255, 255, 0.4) !important;
        transform: scale(1.05);
    }
    
    .todo-item {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
    }
    
    input[type="date"]::-moz-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
    }
`;
document.head.appendChild(style);