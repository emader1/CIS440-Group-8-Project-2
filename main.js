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

// Event listener for DOMContentLoaded to handle user session and fetch matches.
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://127.0.0.1:5000/fetch-matches', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
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
    .catch(error => console.error('Error fetching current user:', error));
});
