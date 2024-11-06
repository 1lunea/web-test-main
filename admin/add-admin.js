window.onload = function() {
    checkOwnerAuth();
    document.getElementById('addModForm').addEventListener('submit', handleAddModerator);
};

function checkOwnerAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.username !== 'adminquang') {
        window.location.href = '../login-signup.html';
    }
}

function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return {
        isValid: usernameRegex.test(username),
        message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
    };
}

function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
        isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
    };
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
        isValid: emailRegex.test(email),
        message: 'Please enter a valid email address'
    };
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearErrors() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
}

async function handleAddModerator(e) {
    e.preventDefault();
    
    const username = document.getElementById('modUsername').value;
    const password = document.getElementById('modPassword').value;
    const email = document.getElementById('modEmail').value;

    // Clear previous errors
    clearErrors();

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
        showError(usernameValidation.message);
        return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showError(passwordValidation.message);
        return;
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        showError(emailValidation.message);
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(user => user.username === username)) {
        showError('Username already exists!');
        return;
    }

    const newModerator = {
        id: 'mod_' + Date.now(),
        username: username,
        password: password,
        role: 'moderator',
        profile: {
            id: 'MOD' + Date.now(),
            fullName: username,
            email: email,
            permissions: ['delete_posts', 'ban_users', 'moderate_comments']
        }
    };

    users.push(newModerator);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Moderator account created successfully!');
    window.location.href = 'admin-panel.html';
} 