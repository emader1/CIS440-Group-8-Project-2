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
                credentials: 'include',
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
                credentials: 'include',
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
    // Home page button.
    if (document.getElementById('homeBtn')) {
        document.getElementById('homeBtn').addEventListener('click', function() {
            window.location.href = 'dashboard.html'
        });
    }

    // Home page button mobile view.
    if (document.getElementById('homeBtnMobile')) {
        document.getElementById('homeBtnMobile').addEventListener('click', function() {
            window.location.href = 'dashboard.html'
        });
    }

    // OrgChart page button.
    if (document.getElementById('orgchartBtn')) {
        document.getElementById('orgchartBtn').addEventListener('click', function() {
            window.location.href = 'orgchart.html'
        });
    }

    // Orgchart page button mobile view.
    if (document.getElementById('orgchartBtnMobile')) {
        document.getElementById('orgchartBtnMobile').addEventListener('click', function() {
            window.location.href = 'orgchart.html'
        });
    }

    // Logout button.
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
                localStorage.clear();
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Logout error:', error);
                alert('Logout failed. Please try again.');
            });
        });
    }

    // Logout button mobile view.
    if (document.getElementById('logoutBtnMobile')) {
        document.getElementById('logoutBtnMobile').addEventListener('click', function() {
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
                localStorage.clear();
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Logout error:', error);
                alert('Logout failed. Please try again.');
            });
        });
    }



    function updateWelcomeMessage() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.username) {
            const welcomeMessage = document.getElementById('welcomeMessage');
            welcomeMessage.textContent = `Welcome, ${user.username}`;
        }
    }

    function fetchUnmatchedUsers() {
        fetch('http://127.0.0.1:5000/available_matches', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            const userList = document.getElementById('unmatchedUsersList');
            userList.innerHTML = '';
            data.forEach(username => {
                // Places each user/button in a div.
                const userContainer = document.createElement('div');
                userContainer.classList.add('user_container');
    
                // List for usernames.
                const listItem = document.createElement('li');
                listItem.textContent = username;
    
                // Button for matching users.
                const matchButton = document.createElement('button');
                matchButton.textContent = 'Match';
                matchButton.onclick = function() { matchUser(username); };
    
                userContainer.appendChild(listItem);
                userContainer.appendChild(matchButton);
    
                userList.appendChild(userContainer);
            });
        })
        .catch(error => console.error('Error fetching available matches:', error));
    }
    
    
    function matchUser(matchUsername) {
        const userId = JSON.parse(localStorage.getItem('user')).id;
        fetch('http://127.0.0.1:5000/update_match', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                match_username: matchUsername
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchUnmatchedUsers();
            fetchMatchedUsers();
        })
        .catch(error => console.error('Error updating match:', error));
    }
    
    function fetchMatchedUsers() {
        const user = JSON.parse(localStorage.getItem('user'));
        fetch(`http://127.0.0.1:5000/fetch_matches`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            const matchedList = document.getElementById('matchedUsersList');
            matchedList.innerHTML = '';
            data.forEach(match => {
                const listItem = document.createElement('li');
                listItem.textContent = match;
                matchedList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching matches:', error));
    }