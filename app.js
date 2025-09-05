// TaskCraft - Smart Task Management App
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('taskcraft_tasks') || '[]');
        this.doLaterItems = JSON.parse(localStorage.getItem('taskcraft_doLater') || '[]');
        this.currentTheme = localStorage.getItem('taskcraft_theme') || 'light';
        this.pendingTask = null;

        // Common task synonyms for intelligent detection
        this.taskSynonyms = {
            'gym': ['workout', 'exercise', 'fitness', 'training', 'cardio', 'weights'],
            'homework': ['hw', 'assignment', 'study', 'schoolwork', 'project'],
            'shopping': ['groceries', 'buy', 'purchase', 'store', 'market'],
            'cleaning': ['clean', 'tidy', 'organize', 'vacuum', 'dust'],
            'cooking': ['cook', 'meal', 'dinner', 'lunch', 'breakfast', 'recipe'],
            'work': ['job', 'office', 'meeting', 'project', 'task', 'deadline'],
            'reading': ['read', 'book', 'novel', 'article', 'study'],
            'walking': ['walk', 'stroll', 'jog', 'run', 'hike']
        };

        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.showMainApp();
                this.updateDate();
                this.updateMotivationalTip();
                lucide.createIcons();
            });
        } else {
            this.setupEventListeners();
            this.showMainApp();
            this.updateDate();
            this.updateMotivationalTip();
            lucide.createIcons();
        }
    }

    setupEventListeners() {

        // Task management events
        const addTaskForm = document.getElementById('addTaskForm');
        const addDoLaterForm = document.getElementById('addDoLaterForm');
        const prePlanForm = document.getElementById('prePlanForm');

        if (addTaskForm) {
            addTaskForm.addEventListener('submit', (e) => {
                console.log('Add task form submitted');
                this.addTask(e);
            });
        }

        if (addDoLaterForm) {
            addDoLaterForm.addEventListener('submit', (e) => {
                console.log('Add do later form submitted');
                this.addDoLaterItem(e);
            });
        }

        if (prePlanForm) {
            prePlanForm.addEventListener('submit', (e) => {
                console.log('Pre-plan form submitted');
                this.addPrePlanTask(e);
            });
        }

        // Theme management
        const themeBtn = document.getElementById('themeBtn');
        const themeMenu = document.getElementById('themeMenu');

        if (themeBtn && themeMenu) {
            themeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                themeMenu.classList.toggle('hidden');
            });

            document.addEventListener('click', () => {
                themeMenu.classList.add('hidden');
            });
        }

        // Confirmation modal
        const confirmCancel = document.getElementById('confirmCancel');
        const confirmAdd = document.getElementById('confirmAdd');

        if (confirmCancel) {
            confirmCancel.addEventListener('click', () => this.hideConfirmModal());
        }

        if (confirmAdd) {
            confirmAdd.addEventListener('click', () => this.confirmAddTask());
        }

        // Help modal
        const helpBtn = document.getElementById('helpBtn');
        const closeHelp = document.getElementById('closeHelp');

        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelpModal());
        }

        if (closeHelp) {
            closeHelp.addEventListener('click', () => this.hideHelpModal());
        }

        // Apply saved theme
        this.setTheme(this.currentTheme);

        // Category and priority selectors
        this.setupCategorySelector();
        this.setupPrioritySelector();
        this.setupSearch();
        this.setupKeyboardShortcuts();
    }

    setupCategorySelector() {
        const categoryOptions = document.querySelectorAll('.category-option, .category-option-compact');
        const selectedCategoryInput = document.getElementById('selectedCategory');

        categoryOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                categoryOptions.forEach(opt => opt.classList.remove('selected'));

                // Add selected class to clicked option
                option.classList.add('selected');

                // Update hidden input
                if (selectedCategoryInput) {
                    selectedCategoryInput.value = option.dataset.category;
                }
            });
        });
    }

    setupPrioritySelector() {
        const priorityOptions = document.querySelectorAll('.priority-option, .priority-option-compact');
        const selectedPriorityInput = document.getElementById('selectedPriority');

        priorityOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                priorityOptions.forEach(opt => opt.classList.remove('selected'));

                // Add selected class to clicked option
                option.classList.add('selected');

                // Update hidden input
                if (selectedPriorityInput) {
                    selectedPriorityInput.value = option.dataset.priority;
                }
            });
        });
    }

    setupSearch() {
        const searchBtn = document.getElementById('searchBtn');
        const searchContainer = document.getElementById('searchContainer');
        const searchInput = document.getElementById('searchInput');

        if (searchBtn && searchContainer && searchInput) {
            searchBtn.addEventListener('click', () => {
                searchContainer.classList.toggle('hidden');
                if (!searchContainer.classList.contains('hidden')) {
                    searchInput.focus();
                }
            });

            searchInput.addEventListener('input', (e) => {
                this.filterTasks(e.target.value);
            });

            // Close search on escape
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchContainer.classList.add('hidden');
                    searchInput.value = '';
                    this.filterTasks('');
                }
            });
        }
    }

    filterTasks(searchTerm) {
        const taskItems = document.querySelectorAll('.task-item');
        const term = searchTerm.toLowerCase();

        taskItems.forEach(item => {
            const taskText = item.querySelector('p').textContent.toLowerCase();
            if (taskText.includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + / to toggle search
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                const searchBtn = document.getElementById('searchBtn');
                if (searchBtn) searchBtn.click();
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                const confirmModal = document.getElementById('confirmModal');
                const helpModal = document.getElementById('helpModal');
                const searchContainer = document.getElementById('searchContainer');

                if (confirmModal && !confirmModal.classList.contains('hidden')) {
                    this.hideConfirmModal();
                }

                if (helpModal && !helpModal.classList.contains('hidden')) {
                    this.hideHelpModal();
                }

                if (searchContainer && !searchContainer.classList.contains('hidden')) {
                    searchContainer.classList.add('hidden');
                    document.getElementById('searchInput').value = '';
                    this.filterTasks('');
                }
            }

            // Focus task input with Ctrl/Cmd + N
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                const taskInput = document.getElementById('taskInput');
                if (taskInput) taskInput.focus();
            }
        });
    }



    showMainApp() {
        this.renderTasks();
        this.renderDoLaterItems();
        this.updateStats();
        lucide.createIcons();
    }

    saveUserData() {
        localStorage.setItem('taskcraft_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('taskcraft_doLater', JSON.stringify(this.doLaterItems));
    }

    updateDate() {
        const today = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        document.getElementById('todayDate').textContent = today.toLocaleDateString('en-US', options);
    }

    updateMotivationalTip() {
        const tips = [
            "Every great achievement starts with a single task.",
            "Progress, not perfection, is the goal.",
            "Small steps lead to big victories.",
            "Your future self will thank you for starting today.",
            "Consistency beats intensity every time.",
            "The best time to start was yesterday. The second best time is now.",
            "Focus on what you can control, let go of what you can't.",
            "Success is the sum of small efforts repeated daily.",
            "Don't wait for motivation, create momentum.",
            "Every task completed is a step closer to your goals."
        ];

        const tipElement = document.getElementById('motivationalTip');
        if (tipElement) {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            tipElement.textContent = `"${randomTip}"`;
        }
    }

    addTask(e) {
        e.preventDefault();
        console.log('Adding task...');

        const taskInput = document.getElementById('taskInput');
        const selectedCategoryInput = document.getElementById('selectedCategory');
        const selectedPriorityInput = document.getElementById('selectedPriority');

        if (!taskInput || !taskInput.value.trim()) {
            console.log('No task input or empty value');
            return;
        }

        const taskText = taskInput.value.trim();
        const category = selectedCategoryInput ? selectedCategoryInput.value : 'personal';
        const priority = selectedPriorityInput ? selectedPriorityInput.value : 'medium';

        // Check for similar tasks
        const similarTask = this.findSimilarTask(taskText);
        if (similarTask) {
            this.pendingTask = {
                text: taskText,
                category: category,
                priority: priority
            };
            this.showConfirmModal(similarTask, taskText);
            return;
        }

        this.createTask(taskText, category, priority);
        taskInput.value = '';
    }

    findSimilarTask(newTaskText) {
        const normalizedNew = newTaskText.toLowerCase().trim();

        // Get all existing tasks (today's tasks + do later items)
        const allTasks = [...this.tasks, ...this.doLaterItems];

        for (const task of allTasks) {
            const normalizedExisting = task.text.toLowerCase().trim();

            // Direct similarity check (70% match)
            if (this.calculateSimilarity(normalizedNew, normalizedExisting) > 0.7) {
                return task;
            }

            // Synonym check
            if (this.checkSynonyms(normalizedNew, normalizedExisting)) {
                return task;
            }
        }

        return null;
    }

    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    checkSynonyms(newTask, existingTask) {
        for (const [key, synonyms] of Object.entries(this.taskSynonyms)) {
            const keyInNew = newTask.includes(key) || synonyms.some(syn => newTask.includes(syn));
            const keyInExisting = existingTask.includes(key) || synonyms.some(syn => existingTask.includes(syn));

            if (keyInNew && keyInExisting) {
                return true;
            }
        }
        return false;
    }

    showConfirmModal(similarTask, newTaskText) {
        const modal = document.getElementById('confirmModal');
        const message = document.getElementById('confirmMessage');

        if (modal && message) {
            message.textContent = `You already have "${similarTask.text}". Do you still want to add "${newTaskText}"?`;
            modal.classList.remove('hidden');
        }
    }

    hideConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.pendingTask = null;
    }

    showHelpModal() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideHelpModal() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    confirmAddTask() {
        if (this.pendingTask) {
            this.createTask(this.pendingTask.text, this.pendingTask.category, this.pendingTask.priority);
            document.getElementById('taskInput').value = '';
        }
        this.hideConfirmModal();
    }

    createTask(text, category, priority = 'medium') {
        const newTask = {
            id: Date.now(),
            text: text,
            category: category,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        console.log('New task created:', newTask);

        this.tasks.push(newTask);
        this.saveUserData();
        this.renderTasks();
        this.updateStats();

        console.log('Task added successfully');
    }

    addDoLaterItem(e) {
        e.preventDefault();
        const input = document.getElementById('doLaterInput');

        if (!input.value.trim()) return;

        const newItem = {
            id: Date.now(),
            text: input.value.trim(),
            createdAt: new Date().toISOString()
        };

        this.doLaterItems.push(newItem);
        this.saveUserData();
        this.renderDoLaterItems();
        this.updateStats();

        input.value = '';
    }

    addPrePlanTask(e) {
        e.preventDefault();
        const taskInput = document.getElementById('prePlanInput');
        const dateInput = document.getElementById('prePlanDate');

        if (!taskInput.value.trim() || !dateInput.value) return;

        const newTask = {
            id: Date.now(),
            text: taskInput.value.trim(),
            category: 'personal',
            completed: false,
            scheduledDate: dateInput.value,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveUserData();
        this.renderTasks();
        this.updateStats();

        taskInput.value = '';
        dateInput.value = '';
    }

    renderTasks() {
        console.log('Rendering tasks...', this.tasks);

        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');

        if (!tasksList || !emptyState) {
            console.log('Tasks list or empty state element not found');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        let todayTasks = this.tasks.filter(task => {
            if (task.scheduledDate) {
                return task.scheduledDate === today;
            }
            return task.createdAt.split('T')[0] === today;
        });

        // Sort by priority (urgent > high > medium) and then by completion status
        const priorityOrder = { urgent: 3, high: 2, medium: 1 };
        todayTasks.sort((a, b) => {
            // Completed tasks go to bottom
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            // Sort by priority
            const aPriority = priorityOrder[a.priority || 'medium'];
            const bPriority = priorityOrder[b.priority || 'medium'];
            return bPriority - aPriority;
        });

        console.log('Today tasks:', todayTasks);

        if (todayTasks.length === 0) {
            tasksList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tasksList.innerHTML = todayTasks.map(task => this.createTaskHTML(task)).join('');

        // Add event listeners to task items
        todayTasks.forEach(task => {
            const taskElement = document.getElementById(`task-${task.id}`);
            if (taskElement) {
                const checkbox = taskElement.querySelector('.task-checkbox');
                const deleteBtn = taskElement.querySelector('.delete-task');
                const moveBtn = taskElement.querySelector('.move-to-later');

                if (checkbox) checkbox.addEventListener('change', () => this.toggleTask(task.id));
                if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
                if (moveBtn) moveBtn.addEventListener('click', () => this.moveToDoLater(task.id));
            }
        });

        // Update task counter
        this.updateTaskCounter(todayTasks);

        // Recreate icons for new elements
        lucide.createIcons();
    }

    updateTaskCounter(tasks) {
        const counter = document.getElementById('taskCounter');
        if (counter) {
            const completedCount = tasks.filter(t => t.completed).length;
            const totalCount = tasks.length;

            if (totalCount === 0) {
                counter.textContent = 'No tasks';
                counter.className = 'px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium';
            } else if (completedCount === totalCount) {
                counter.textContent = `All done! 🎉`;
                counter.className = 'px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium';
            } else {
                counter.textContent = `${completedCount}/${totalCount} done`;
                counter.className = 'px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium';
            }
        }
    }

    createTaskHTML(task) {
        const categoryIcons = {
            personal: 'user',
            work: 'briefcase',
            study: 'book-open',
            health: 'heart'
        };

        const categoryColors = {
            personal: 'bg-blue-100 text-blue-800',
            work: 'bg-green-100 text-green-800',
            study: 'bg-purple-100 text-purple-800',
            health: 'bg-pink-100 text-pink-800'
        };

        const priorityColors = {
            medium: 'bg-gray-100 text-gray-700',
            high: 'bg-yellow-100 text-yellow-800',
            urgent: 'bg-red-100 text-red-800'
        };

        const priorityIcons = {
            medium: 'minus',
            high: 'arrow-up',
            urgent: 'zap'
        };

        const priorityLabels = {
            medium: 'Normal',
            high: 'High',
            urgent: 'Urgent'
        };

        // Add priority border styling
        const priorityBorder = task.priority === 'urgent' ? 'border-l-4 border-l-red-500' :
            task.priority === 'high' ? 'border-l-4 border-l-yellow-500' : '';

        return `
            <div id="task-${task.id}" class="task-item card-bg rounded-lg p-3 hover:shadow-md transition-all ${task.completed ? 'opacity-60' : ''} border border-themed ${priorityBorder}">
                <div class="flex items-center space-x-3">
                    <input type="checkbox" class="task-checkbox w-4 h-4 rounded focus:ring-2" style="accent-color: var(--accent-primary)" ${task.completed ? 'checked' : ''}>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-themed ${task.completed ? 'line-through' : ''} font-medium mb-1">${task.text}</p>
                        <div class="flex items-center flex-wrap gap-1">
                            <span class="px-2 py-0.5 text-xs rounded-md ${categoryColors[task.category] || categoryColors.personal} flex items-center gap-1">
                                <i data-lucide="${categoryIcons[task.category] || 'user'}" class="w-2.5 h-2.5"></i>
                                ${task.category}
                            </span>
                            ${task.priority && task.priority !== 'medium' ? `
                                <span class="px-2 py-0.5 text-xs rounded-md ${priorityColors[task.priority]} flex items-center gap-1">
                                    <i data-lucide="${priorityIcons[task.priority]}" class="w-2.5 h-2.5"></i>
                                    ${priorityLabels[task.priority]}
                                </span>
                            ` : ''}
                            ${task.scheduledDate ? `<span class="text-xs text-themed-secondary bg-gray-100 px-2 py-0.5 rounded-md">📅</span>` : ''}
                        </div>
                    </div>
                    <div class="flex space-x-1">
                        <button class="move-to-later p-1.5 text-themed-secondary hover:text-purple-600 transition-colors rounded-md hover:bg-purple-50" title="Move to Future Craft">
                            <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                        </button>
                        <button class="delete-task p-1.5 text-themed-secondary hover:text-red-600 transition-colors rounded-md hover:bg-red-50" title="Delete Task">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderDoLaterItems() {
        console.log('Rendering do later items...', this.doLaterItems);

        const doLaterList = document.getElementById('doLaterList');
        if (!doLaterList) {
            console.log('Do later list element not found');
            return;
        }

        if (this.doLaterItems.length === 0) {
            doLaterList.innerHTML = '<p class="text-xs text-themed-secondary text-center py-3 opacity-60">No future items</p>';
            return;
        }

        doLaterList.innerHTML = this.doLaterItems.map(item => `
            <div class="flex items-center justify-between bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-all">
                <span class="text-xs text-themed font-medium truncate flex-1 mr-2">${item.text}</span>
                <div class="flex space-x-1">
                    <button onclick="app.moveToToday(${item.id})" class="p-1 text-themed-secondary hover:text-blue-600 transition-colors rounded hover:bg-blue-50" title="Move to Today's Craft">
                        <i data-lucide="arrow-left" class="w-3 h-3"></i>
                    </button>
                    <button onclick="app.deleteDoLaterItem(${item.id})" class="p-1 text-themed-secondary hover:text-red-600 transition-colors rounded hover:bg-red-50" title="Delete">
                        <i data-lucide="x" class="w-3 h-3"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Recreate icons for new elements
        lucide.createIcons();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const taskElement = document.getElementById(`task-${taskId}`);

            task.completed = !task.completed;

            // Add completion animation
            if (task.completed && taskElement) {
                taskElement.classList.add('task-complete');
                setTimeout(() => {
                    taskElement.classList.remove('task-complete');
                }, 500);
            }

            this.saveUserData();
            setTimeout(() => {
                this.renderTasks();
                this.updateStats();
            }, task.completed ? 300 : 0);
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveUserData();
        this.renderTasks();
        this.updateStats();
    }

    moveToDoLater(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const doLaterItem = {
                id: Date.now(),
                text: task.text,
                createdAt: new Date().toISOString()
            };

            this.doLaterItems.push(doLaterItem);
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveUserData();
            this.renderTasks();
            this.renderDoLaterItems();
            this.updateStats();
        }
    }

    moveToToday(itemId) {
        const item = this.doLaterItems.find(i => i.id === itemId);
        if (item) {
            const newTask = {
                id: Date.now(),
                text: item.text,
                category: 'personal',
                completed: false,
                createdAt: new Date().toISOString()
            };

            this.tasks.push(newTask);
            this.doLaterItems = this.doLaterItems.filter(i => i.id !== itemId);
            this.saveUserData();
            this.renderTasks();
            this.renderDoLaterItems();
            this.updateStats();
        }
    }

    deleteDoLaterItem(itemId) {
        this.doLaterItems = this.doLaterItems.filter(i => i.id !== itemId);
        this.saveUserData();
        this.renderDoLaterItems();
        this.updateStats();
    }

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.tasks.filter(task => {
            if (task.scheduledDate) {
                return task.scheduledDate === today;
            }
            return task.createdAt.split('T')[0] === today;
        });

        const completedTasks = todayTasks.filter(task => task.completed);
        const completionRate = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0;

        document.getElementById('todayTasksCount').textContent = todayTasks.length;
        document.getElementById('completedTasksCount').textContent = completedTasks.length;
        document.getElementById('doLaterCount').textContent = this.doLaterItems.length;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('taskcraft_theme', theme);

        // Update theme menu visibility
        const themeMenu = document.getElementById('themeMenu');
        if (themeMenu) {
            themeMenu.classList.add('hidden');
        }

        // Recreate icons to match theme
        setTimeout(() => {
            lucide.createIcons();
        }, 100);
    }

    // Enhanced do later item addition with duplicate checking
    addDoLaterItem(e) {
        e.preventDefault();
        const input = document.getElementById('doLaterInput');

        if (!input.value.trim()) return;

        const itemText = input.value.trim();

        // Check for similar items in do later
        const similarItem = this.doLaterItems.find(item =>
            this.calculateSimilarity(itemText.toLowerCase(), item.text.toLowerCase()) > 0.8
        );

        if (similarItem) {
            if (!confirm(`You already have "${similarItem.text}" in do later. Add anyway?`)) {
                return;
            }
        }

        const newItem = {
            id: Date.now(),
            text: itemText,
            createdAt: new Date().toISOString()
        };

        this.doLaterItems.push(newItem);
        this.saveUserData();
        this.renderDoLaterItems();
        this.updateStats();

        input.value = '';
    }

    // Enhanced pre-plan task with duplicate checking
    addPrePlanTask(e) {
        e.preventDefault();
        const taskInput = document.getElementById('prePlanInput');
        const dateInput = document.getElementById('prePlanDate');

        if (!taskInput.value.trim() || !dateInput.value) return;

        const taskText = taskInput.value.trim();

        // Check for similar tasks
        const similarTask = this.findSimilarTask(taskText);
        if (similarTask) {
            if (!confirm(`You already have "${similarTask.text}". Schedule anyway?`)) {
                return;
            }
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            category: 'personal',
            completed: false,
            scheduledDate: dateInput.value,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveUserData();
        this.renderTasks();
        this.updateStats();

        taskInput.value = '';
        dateInput.value = '';
    }
}

// Initialize the app when the page loads
let app;

// Create app instance immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, creating TodoApp...');
        app = new TodoApp();
    });
} else {
    console.log('DOM already loaded, creating TodoApp...');
    app = new TodoApp();
}