// JS for login page.
    // Check and add event listener for 'Create Account' button.
    if (document.getElementById('createAccountBtn')) {
        document.getElementById('createAccountBtn').addEventListener('click', function() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('createAccountForm').style.display = 'block';
        });
    }

    // Check and add event listener for 'Cancel' button in create account form.
    if (document.getElementById('cancelCreateAccountBtn')) {
        document.getElementById('cancelCreateAccountBtn').addEventListener('click', function() {
            document.getElementById('createAccountForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        });
    }

    // Check and add event listener for user type selection change.
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

    // Event listener for login form.
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
    
    // Check and add event listener for create account form submission.
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

// JS for Home Page
    // Shows all available matches to mentees.
    

// JS For Org-Chart.
    // Pulls users from DB.
    // None of this JS is working. There is nothing on the backend to tell it what to do.
    function getUsers() {
        fetch('http://127.0.0.1:5000/fetch_users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            const users = data.users;
            const userProfileSelect = document.getElementById('userProfile');

            userProfileSelect.innerHTML = '';

            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.text = `${user.name} - ${user.role}`;
                userProfileSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
    };

    function selectUser() {
        const userId = document.getElementById('userProfile').value;
        fetch(`http://127.0.0.1:5000/user_details?id=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(user => {
            updateRelatedUsers(user);
            generateOrgChart(userId);
        })
        .catch(error => console.error('Error fetching user details:', error));
    }

    function updateRelatedUsers(user) {
        const relatedSelect = document.getElementById('relatedUsers');
        relatedSelect.innerHTML = '';

        let relatedUsers = [];
        if (user.role === 'Mentor') {
            relatedUsers = user.children;
        } else if (user.role === 'Mentee') {
            relatedUsers = user.mentors;
        }

        relatedUsers.forEach(relatedUserId => {
            const relatedUser = users.find(u => u.id === relatedUserId);
            if (relatedUser) {
                const option = document.createElement('option');
                option.value = relatedUser.id;
                option.text = `${relatedUser.name} - ${relatedUser.role}`;
                relatedSelect.appendChild(option);
            }
        });

        if (relatedUsers.length > 0) {
            document.getElementById('relationSelection').classList.remove('hidden');
        }
    }

    function generateOrgChart(userId) {
        fetch(`http://127.0.0.1:5000/user_details?id=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(user => {
            const orgChartDiv = document.getElementById('orgChart');
            orgChartDiv.innerHTML = '';

            const html = generateOrgChartHtml(user, users);
            orgChartDiv.innerHTML = html;
            orgChartDiv.classList.remove('hidden');
        })
        .catch(error => console.error('Error fetching user details:', error));
    }