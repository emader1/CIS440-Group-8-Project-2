// JS for login page.
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('createAccountBtn')) {
        document.getElementById('createAccountBtn').addEventListener('click', function() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('createAccountForm').style.display = 'block';
        });
    }

    if (document.getElementById('cancelCreateAccountBtn')) {
        document.getElementById('cancelCreateAccountBtn').addEventListener('click', function() {
            document.getElementById('createAccountForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        });
    }

    if (document.getElementById('createUserType')) {
        document.getElementById('createUserType').addEventListener('change', function() {
            var selectedValue = this.value;
            var schoolYearSelect = document.getElementById('createSchoolYear');
            if (selectedValue === 'Mentee') {
                schoolYearSelect.style.display = 'block';
            } else {
                schoolYearSelect.style.display = 'none';
            }
        });
    }

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

    if (document.getElementById('createAccountForm')) {
        document.getElementById('createAccountForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('createEmail').value;
            const username = document.getElementById('createUsername').value;
            const password = document.getElementById('createPassword').value;
            const industry = document.getElementById('createIndustry').value;
            const schoolYear = document.getElementById('createSchoolYear').value;
            const userType = document.getElementById('createUserType').value;

            fetch('http://127.0.0.1:5000/create_account', {
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
});

// JS for the dashboard page.
document.addEventListener('DOMContentLoaded', function() {
    updateWelcomeMessage();
    fetchUnmatchedUsers();

    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', function() {
            fetch('http://127.0.0.1:5000/logout', {
                method: 'GET',
                credentials: 'include'
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Logout failed');
                }
            })
            .then(data => {
                alert(data.message);
                window.location.href = 'login.html';
                localStorage.clear();  // Clears the local storage
            })
            .catch(error => {
                console.error('Logout error:', error);
                alert('Logout failed. Please try again.');
            });
        });
    }
});

function updateWelcomeMessage() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.textContent = `Welcome, ${user.username}`;
    }
}

function fetchUnmatchedUsers() {
    fetch('http://127.0.0.1:5000/api/available-matches', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        const userList = document.getElementById('unmatchedUsersList');
        userList.innerHTML = ''; // Clear existing list
        data.forEach(username => {
            const listItem = document.createElement('li');
            listItem.textContent = username;
            userList.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error fetching available matches:', error));
}
