window.onload = function() {
  const signUpElement = document.getElementById('signup');
  const loginElement = document.getElementById('login');
  const switchToLoginElement = document.getElementById('switchToLogin');
  const switchToSignupElement = document.getElementById('switchToSignup');

  switchToLoginElement.addEventListener('click', function() {
    switchForms(signUpElement, loginElement);
  });

  switchToSignupElement.addEventListener('click', function() {
    switchForms(loginElement, signUpElement);
  });

  setTimeout(function() {
    signUpElement.style.display = 'block';
    signUpElement.style.opacity = '0';
    fadeIn(signUpElement);
  }, 500);

  setTimeout(function() {
    loginElement.style.display = 'none';
  }, 1000);

  // Add login and signup handlers
  document.getElementById('signupButton').addEventListener('click', handleSignup);
  document.getElementById('loginButton').addEventListener('click', handleLogin);
}

//fade in animation
function fadeIn(element) {
  var op = 0.1;
  var timer = setInterval(function () {
    if (op >= 1) clearInterval(timer);
      element.style.opacity = op;
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
      op += op * 0.1;
  }, 10);
}

function switchForms(hideElement, showElement) {
  if (showElement.id === 'signup') {
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    const signupButton = document.getElementById('signupButton');
    signupButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (password.value !== confirmPassword.value) {
        alert('Passwords do not match!');
        return;
      }
    });
  }

  hideElement.style.display = 'none';
  showElement.style.display = 'block';
  showElement.style.opacity = '0';
  fadeIn(showElement);
}

function loadUsers() {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
  return true;
}

// Add these validation functions
function validateUsername(username) {
    // Username requirements: 3-20 characters, letters, numbers, underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return {
        isValid: usernameRegex.test(username),
        message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
    };
}

function validatePassword(password) {
    // Password requirements
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isValid = password.length >= minLength && 
                   hasUpperCase && 
                   hasLowerCase && 
                   hasNumbers && 
                   hasSpecialChar;

    return {
        isValid: isValid,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
    };
}

// Update the handleSignup function
async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Clear previous error messages
    clearErrors();

    if (!username || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }

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

    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return;
    }

    const users = loadUsers();
    if (users.some(user => user.username === username)) {
        showError('Username already exists!');
        return;
    }

    const newUser = {
        username,
        password,
        id: Date.now().toString(),
        profile: null,
        role: null
    };

    users.push(newUser);
    saveUsers(users);
    alert('Signup successful! Please login.');
    switchForms(document.getElementById('signup'), document.getElementById('login'));
}

// Add these helper functions for error display
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

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    alert('Please fill in all fields');
    return;
  }

  // Check for admin credentials
  if (username === 'adminquang' && password === 'adminfirst') {
    localStorage.setItem('currentUser', JSON.stringify({
      id: 'admin',
      username: 'adminquang',
      role: 'admin'
    }));
    window.location.href = 'admin/admin-panel.html';
    return;
  }

  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Store user session
    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role
    }));
    
    if (user.role && user.profile) {
      // User has completed setup, redirect to dashboard
      window.location.href = user.role === 'teacher' ? 
        'teacher/teacher-dashboard.html' : 
        'student/student-dashboard.html';
    } else {
      // User has not completed setup, redirect to setup-account.html
      window.location.href = 'setup-account.html';
    }
  } else {
    alert('Invalid username or password');
  }
}
