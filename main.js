// main.js

// Show create account form when "Create Account" button is clicked
document.getElementById('createAccountBtn').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('createAccountForm').style.display = 'block';
});

// Hide create account form and show login form when "Cancel" button is clicked
document.getElementById('cancelCreateAccountBtn').addEventListener('click', function() {
    document.getElementById('createAccountForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
});
// main.js (Update dashboard functionality)

// Fetch and display available matches based on user's industry
function fetchMatches(industry) {
    fetch(`http://localhost:5000/matches?industry=${industry}`)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Handle response from backend
            // Display available matches on the dashboard
            // You can customize this based on your UI requirements
            document.getElementById('menteesList').innerHTML = JSON.stringify(data.mentees);
            document.getElementById('mentorsList').innerHTML = JSON.stringify(data.mentors);
        })
        .catch(error => console.error('Error:', error));
}

// Example: Fetch matches when the dashboard page loads
document.addEventListener('DOMContentLoaded', function() {
    // Assuming you have the user's industry available in a variable
    const userIndustry = 'YourUserIndustry'; // Replace 'YourUserIndustry' with actual industry
    fetchMatches(userIndustry);
});


// Placeholder for login functionality
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Send POST request to backend for login
    fetch('http://localhost:5000/login', {
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
        console.log(data); // Handle response from backend
        // Redirect to dashboard.html upon successful login
        if (data.message === 'Login successful') {
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials. Please try again.'); // Display error message
        }
    })
    .catch(error => console.error('Error:', error));
});

// Placeholder for create account functionality
document.getElementById('createAccountForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('createEmail').value;
    const username = document.getElementById('createUsername').value;
    const password = document.getElementById('createPassword').value;
    const industry = document.getElementById('createIndustry').value;
    const schoolYear = document.getElementById('createSchoolYear').value;
    const userType = document.getElementById('createUserType').value;

    // Send POST request to backend for account creation
    fetch('http://localhost:5000/create-account', {
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
        console.log(data); // Handle response from backend
        if (data.message === 'Account created successfully') {
            alert('Account created successfully. You can now login.'); // Display success message
            window.location.href = 'index.html'; // Redirect to login page
        } else {
            alert('Error creating account. Please try again.'); // Display error message
        }
    })
    .catch(error => console.error('Error:', error));
});
