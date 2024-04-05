// Fetch matches based on user type and industry
function fetchMatches(userType, industry) {
    fetch(`http://127.0.0.1:5000/matches?user_type=${userType}&industry=${industry}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'  // Include credentials (cookies) in the request
    })
    .then(response => response.json())
    .then(data => {
        // Display the matches on the page
        displayMatches(data.matches);
    })
    .catch(error => console.error('Error fetching matches:', error));
}

// Display matches on the page
function displayMatches(matches) {
    const menteesList = document.getElementById('menteesList');
    const mentorsList = document.getElementById('mentorsList');

    // Clear previous matches
    menteesList.innerHTML = '';
    mentorsList.innerHTML = '';

    // Populate the lists based on match data
    matches.forEach(match => {
        const matchElement = document.createElement('li');
        matchElement.textContent = `User: ${match.username}, Industry: ${match.industry}, User Type: ${match.user_type}`;

        // Decide which list to append based on user type
        if (match.user_type === 'Mentee') {
            menteesList.appendChild(matchElement);
        } else if (match.user_type === 'Mentor') {
            mentorsList.appendChild(matchElement);
        }
    });
}

// Fetch matches for the logged-in user
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://127.0.0.1:5000/current-user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'  // Include credentials (cookies) in the request
    })
    .then(response => response.json())
    .then(user => {
        const userType = user.user_type;
        const industry = user.industry;
        fetchMatches(userType, industry);
    })
    .catch(error => console.error('Error fetching current user:', error));
});

// Shows the create account form when "Create Account" button is clicked.
document.getElementById('createAccountBtn').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('createAccountForm').style.display = 'block';
});

// Hides the create account form and shows login form when "Cancel" button is clicked.
document.getElementById('cancelCreateAccountBtn').addEventListener('click', function() {
    document.getElementById('createAccountForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
});

// Shows the school year selector when "mentee" is selected.
document.getElementById('createUserType').addEventListener('change', function() {
    var selectedValue = this.value;
    var userTypeSelect = document.getElementById('createSchoolYear');

    if (selectedValue === 'Mentee') {
        userTypeSelect.style.display = 'block';
    } else if (selectedValue === 'Mentor' || selectedValue === 'Manager') {
        userTypeSelect.style.display = 'none';
    }
});

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
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials. Please try again.');
        }
    })
    .catch(error => console.error('Error:', error));
});

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

document.addEventListener('DOMContentLoaded', function() {
    fetch('http://127.0.0.1:5000/current-user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'  // Include credentials (cookies) in the request
    })
    .then(response => response.json())
    .then(user => {
        document.getElementById('userName').textContent = user.email; // Assuming 'email' is a field in the user object
        fetchMatches(user.user_type, user.industry);
    })
    .catch(error => console.error('Error fetching current user:', error));
});
