// Récupération des éléments du DOM
const taskInput = document.getElementById('taskInput');
const taskAdderButton = document.getElementById('taskAdderButton');
const todoBody = document.getElementById('todoBody');
const sortOptions = document.getElementById('sortOptions');
const themeToggle = document.getElementById('themeToggle');

// Récupération des tâches depuis localStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Fonction pour afficher les tâches
function displayTaskLists() {
    todoBody.innerHTML = ''; // Clear existing tasks

    // Trier les tâches selon l'option sélectionnée
    const sortBy = sortOptions.value;
    todos.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });

    todos.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="task-title">${task.title}</td>
            <td>${task.state}</td>
            <td class="action-buttons">
                <button class="edit-button" onclick="editTask(${index})">✎</button>
                <button class="complete-button" onclick="completeTask(${index})">✔️</button>
                <button class="delete-button" onclick="deleteTask(${index})">✖</button>
            </td>
        `;
        todoBody.appendChild(row);
    });
}

// Fonction pour ajouter une tâche
function addTask() {
    const title = taskInput.value.trim();
    if (title) {
        todos.push({ title, state: 'En attente' });
        localStorage.setItem('todos', JSON.stringify(todos));
        taskInput.value = '';
        displayTaskLists();
    }
}

// Fonction pour modifier une tâche
function editTask(index) {
    const newTitle = prompt('Modifier le titre de la tâche :', todos[index].title);
    if (newTitle) {
        todos[index].title = newTitle;
        localStorage.setItem('todos', JSON.stringify(todos));
        displayTaskLists();
    }
}

// Fonction pour marquer une tâche comme terminée
function completeTask(index) {
    todos[index].state = todos[index].state === 'En attente' ? 'Terminé' : 'En attente';
    localStorage.setItem('todos', JSON.stringify(todos));
    displayTaskLists();
}

// Fonction pour supprimer une tâche
function deleteTask(index) {
    todos.splice(index, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    displayTaskLists();
}

// Fonction pour basculer le mode sombre/claire
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    document.querySelectorAll('#taskInput, #sortOptions').forEach(el => {
        el.classList.toggle('dark-mode-input');
        el.classList.toggle('light-mode-input');
    });
    document.querySelectorAll('table').forEach(el => {
        el.classList.toggle('dark-mode-table');
        el.classList.toggle('light-mode-table');
    });
    document.querySelectorAll('thead').forEach(el => {
        el.classList.toggle('dark-mode-thead');
        el.classList.toggle('light-mode-thead');
    });
}

// Événements
taskAdderButton.addEventListener('click', addTask);
sortOptions.addEventListener('change', displayTaskLists);
themeToggle.addEventListener('change', toggleTheme);

// Initialisation
displayTaskLists();
