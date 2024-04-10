// Check and add event listener for 'Create Account' button
if (document.getElementById('createAccountBtn')) {
    document.getElementById('createAccountBtn').addEventListener('click', function() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('createAccountForm').style.display = 'block';
    });
}

// Check and add event listener for 'Cancel' button in create account form
if (document.getElementById('cancelCreateAccountBtn')) {
    document.getElementById('cancelCreateAccountBtn').addEventListener('click', function() {
        document.getElementById('createAccountForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });
}

// Check and add event listener for user type selection change
if (document.getElementById('createUserType')) {
    document.getElementById('createUserType').addEventListener('change', function() {
        var selectedValue = this.value;
        var userTypeSelect = document.getElementById('createSchoolYear');
        if (selectedValue === 'Mentee') {
            userTypeSelect.style.display = 'block';
        } else {
            userTypeSelect.style.display = 'none';
        }
    });
}

// Check and add event listener for login form submission
if (document.getElementById('loginForm')) {
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
            if (data.message === 'Login successful') {
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid credentials. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    });
}

// Check and add event listener for create account form submission
if (document.getElementById('createAccountForm')) {
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
            if (data.message === 'Account created successfully') {
                alert('Account created successfully. You can now login.');
                window.location.href = 'login.html';
            } else {
                alert('Error creating account. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    });
}

// Event listener for DOMContentLoaded to handle user session and fetch matches
document.addEventListener('DOMContentLoaded', function() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        if (document.getElementById('userName')) {
            document.getElementById('userName').textContent = user.username;
        }
        fetchMatches(user.user_type, user.industry);
    }
});

// Fetch and display matches
function fetchMatches(userType, industry) {
    fetch(`http://127.0.0.1:5000/fetch-matches?user_type=${userType}&industry=${industry}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        displayMatches(data.matches);
    })
    .catch(error => console.error('Error fetching matches:', error));
}

// Display matches in the UI
function displayMatches(matches) {
    const menteesList = document.getElementById('menteesList');
    const mentorsList = document.getElementById('mentorsList');

    if (menteesList && mentorsList) {
        menteesList.innerHTML = '';
        mentorsList.innerHTML = '';

        matches.forEach(match => {
            const matchElement = document.createElement('li');
            matchElement.textContent = `User: ${match.username}, Industry: ${match.industry}, User Type: ${match.user_type}`;

            if (match.user_type === 'Mentee') {
                menteesList.appendChild(matchElement);
            } else if (match.user_type === 'Mentor') {
                mentorsList.appendChild(matchElement);
            }
        });
    }
}
