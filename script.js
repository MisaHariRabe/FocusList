const body = document.body;
const overlay = document.getElementById('overlay');
const themeSwitcher = document.getElementById('theme');
const todoBody = document.getElementById('todoBody');
const sortOptions = document.getElementById('sortOptions');
const showFormButton = document.getElementById('showFormButton');
const hideFormButton = document.getElementById('hideFormButton');
const taskForm = document.getElementById('taskForm');
const filterInput = document.getElementById('filterInput');

let todos = [];

// Fonction pour demander la permission d'envoyer des notifications
function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            } else {
                console.log('Notification permission denied.');
            }
        });
    }
}

// Fonction pour afficher une notification
function showNotification(taskTitle, taskDeadline) {
    if (Notification.permission === 'granted') {
        const notificationOptions = {
            body: `Deadline: ${taskDeadline}`,
            icon: 'path/to/icon.png' // Remplacez par le chemin de votre icône
        };
        new Notification(taskTitle, notificationOptions);
    }
}

// Fonction pour planifier les notifications
function scheduleNotifications(tasks) {
    const now = new Date();

    tasks.forEach(task => {
        const deadline = new Date(task.dueDate);
        const timeUntilDeadline = deadline.getTime() - now.getTime();

        // Planifiez la notification pour 5 minutes avant la date limite
        if (timeUntilDeadline > 0) {
            const notificationTime = Math.max(timeUntilDeadline - 5 * 60 * 1000, 0);
            setTimeout(() => {
                showNotification(task.title, task.dueDate);
            }, notificationTime);
        }
    });
}

function displayTaskLists() {
    const filterText = filterInput.value.toLowerCase(); // Get filter text in lower case
    const sortBy = sortOptions.value;

    // Filter tasks
    const filteredTodos = todos.filter(task => {
        return filterText === '' || task.title.toLowerCase().includes(filterText) || task.description.toLowerCase().includes(filterText);
    });

    // Sort tasks
    filteredTodos.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });

    todoBody.innerHTML = ''; // Clear existing tasks

    filteredTodos.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="task-title">${task.title}</td>
            <td>
                <button class="state-button" onclick="toggleTaskState(${index})">${task.state}</button>
            </td>
            <td>${task.dueDate}</td>
            <td>${task.priority}</td>
            <td>${task.description}</td>
            <td class="action-buttons">
                <button class="edit-button" onclick="editTask(${index})">✎</button>
                <button class="delete-button" onclick="deleteTask(${index})">✖</button>
            </td>
        `;
        todoBody.appendChild(row);
    });

    // Planifiez les notifications pour les tâches affichées
    scheduleNotifications(filteredTodos);
}

function addTask() {
    const taskTitle = document.getElementById('taskInput').value.trim();
    const dueDate = document.getElementById('dueDateInput').value;
    const priority = document.getElementById('priorityInput').value;
    const description = document.getElementById('descriptionInput').value.trim();
    const tags = document.getElementById('tagsInput').value.split(',').map(tag => tag.trim()).filter(tag => tag);

    // Validation
    if (!taskTitle) {
        alert('Veuillez entrer un titre pour la tâche.');
        return;
    }

    todos.push({
        title: taskTitle,
        state: "En attente",
        dueDate: dueDate,
        priority: priority,
        description: description,
        tags: tags
    });
    localStorage.setItem('todos', JSON.stringify(todos));
    displayTaskLists();
    hideTaskForm();
}

function deleteTask(index) {
    todos.splice(index, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    displayTaskLists();
}

function editTask(index) {
    // Afficher un formulaire d'édition si souhaité
    const task = todos[index];
    document.getElementById('taskInput').value = task.title;
    document.getElementById('dueDateInput').value = task.dueDate;
    document.getElementById('priorityInput').value = task.priority;
    document.getElementById('descriptionInput').value = task.description;
    document.getElementById('tagsInput').value = task.tags.join(', ');

    showTaskForm();
    // Remplacer le bouton d'ajout par un bouton de sauvegarde
    const taskAdderButton = document.getElementById('taskAdderButton');
    taskAdderButton.textContent = 'Sauvegarder les modifications';
    taskAdderButton.removeEventListener('click', addTask);
    taskAdderButton.addEventListener('click', () => {
        todos[index] = {
            title: document.getElementById('taskInput').value.trim(),
            state: "En attente",
            dueDate: document.getElementById('dueDateInput').value,
            priority: document.getElementById('priorityInput').value,
            description: document.getElementById('descriptionInput').value.trim(),
            tags: document.getElementById('tagsInput').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        localStorage.setItem('todos', JSON.stringify(todos));
        displayTaskLists();
        hideTaskForm();
    });
}

function showTaskForm() {
    taskForm.style.display = 'block';
    overlay.style.display = 'block'; // Show overlay
    showFormButton.style.display = 'none';
}

function hideTaskForm() {
    taskForm.style.display = 'none';
    overlay.style.display = 'none'; // Hide overlay
    showFormButton.style.display = 'block';
    // Réinitialiser le bouton d'ajout
    const taskAdderButton = document.getElementById('taskAdderButton');
    taskAdderButton.textContent = 'Ajouter la tâche';
    taskAdderButton.removeEventListener('click', editTask);
    taskAdderButton.addEventListener('click', addTask);
}

function toggleTaskState(index) {
    // Toggle the task state between "En attente" and "Terminé"
    todos[index].state = todos[index].state === "En attente" ? "Terminé" : "En attente";
    localStorage.setItem('todos', JSON.stringify(todos));
    displayTaskLists();
}

document.getElementById('taskAdderButton').addEventListener('click', addTask);
showFormButton.addEventListener('click', showTaskForm);
hideFormButton.addEventListener('click', hideTaskForm);
overlay.addEventListener('click', hideTaskForm);
filterInput.addEventListener('input', displayTaskLists);
sortOptions.addEventListener('change', displayTaskLists);

themeSwitcher.addEventListener('change', () => {
    if (themeSwitcher.checked) {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Demander la permission pour les notifications
    requestNotificationPermission();

    const storedTodos = JSON.parse(localStorage.getItem('todos'));
    if (storedTodos) {
        todos = storedTodos;
    }
    displayTaskLists();

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
        themeSwitcher.checked = true;
        body.classList.add('dark-mode');
    } else {
        body.classList.add('light-mode');
    }
});
