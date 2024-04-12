// Function to check if the user is logged in
function isLoggedIn() {
    return sessionStorage.getItem('user') !== null;
}

// Ensure DOM content is loaded before adding event listeners or making fetch requests
// Ensure DOM content is loaded before adding event listeners or making fetch requests
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');  // Add logging statement
    // Check if user is logged in before fetching matches
    if (isLoggedIn()) {
        console.log('User is logged in');  // Add logging statement
        fetchMatches();
    } else {
        console.log('User not logged in');
        // Handle user not logged in case
    }
});

// Function to fetch tasks based on user type
function fetchTasks() {
    fetch('http://127.0.0.1:5000/fetch-tasks', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // Include credentials for session
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Unauthorized or network error');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        displayTasks(data.tasks);
    })
    .catch(error => {
        console.error('Error fetching tasks:', error.message);
        alert('Error fetching tasks. Please try again.');
        console.error('Error fetching matches:', error.message);
        if (error.message.includes('Unauthorized')) {
            alert('You are not authorized to fetch matches. Please log in.');
        } else {
            alert('Error fetching matches. Please try again.');
        }
    });
    
}

// Function to display tasks on the page
function displayTasks(tasks) {
    const tasksContainer = document.getElementById('tasksContainer');
    tasksContainer.innerHTML = ''; // Clear previous tasks

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.innerHTML = `
            <h3>${task.TaskTitle}</h3>
            <p>${task.TaskDescription}</p>
            <button onclick="completeTask(${task.TaskID})">Complete Task</button>
        `;
        tasksContainer.appendChild(taskElement);
    });
}

// Function to complete a task
function completeTask(taskId) {
    fetch(`http://127.0.0.1:5000/complete-task/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // Include credentials for session
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Unauthorized or network error');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        alert('Task completed successfully');
        fetchTasks(); // Refresh tasks after completion
    })
    .catch(error => {
        console.error('Error completing task:', error.message);
        alert('Error completing task. Please try again.');
    });
}

// Add event listener to fetch tasks when the Send Tasks page is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Send Tasks page loaded');
    fetchTasks();
});

// Function to fetch matches based on user type and industry
// Function to fetch matches based on user type and industry
function fetchMatches() {
    fetch('http://127.0.0.1:5000/fetch-matches', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // Include credentials for session
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Unauthorized or network error');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        displayMatches(data.matches);
    })
    .catch(error => {
        console.error('Error fetching matches:', error.message); // Log and display the error message
        alert('Error fetching matches. Please try again.'); // Show an alert to the user
    });
}


// Function to display matches on the page
function displayMatches(matches) {
    console.log('Matches:', matches);
    // Implement your logic to display matches on the page
}

// Add event listener for login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.message === 'Login successful') {
            sessionStorage.setItem('user', JSON.stringify(data.user)); // Store user data in session
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials. Please try again.');
        }
    })
    .catch(error => console.error('Error:', error));
});

// Add event listener for create account form submission
document.getElementById('createAccountForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('createEmail').value;
    const username = document.getElementById('createUsername').value;
    const password = document.getElementById('createPassword').value;
    const industry = document.getElementById('createIndustry').value;
    const schoolYear = document.getElementById('createSchoolYear').value;
    const userType = document.getElementById('createUserType').value;

    fetch('http://127.0.0.1:5000/create-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            username: username,
            password: password,
            industry: industry,
            school_year: schoolYear,
            user_type: userType
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.message === 'Account created successfully') {
            alert('Account created successfully. You can now login.');
            window.location.href = 'index.html';
        } else {
            alert('Error creating account. Please try again.');
        }
    })
    .catch(error => console.error('Error:', error));
});
