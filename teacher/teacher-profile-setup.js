window.onload = function() {
    generateTeacherId();
    checkAuthorization();
};

function checkAuthorization() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'teacher') {
        window.location.href = '../login-signup.html';
    }
}

function completeProfileSetup() {
    const teacherId = document.getElementById('teacherId').value;
    const fullName = document.getElementById('fullName').value;
    const subject = document.getElementById('subject').value;
    const email = document.getElementById('email').value;

    if (!fullName.trim() || !subject.trim() || !email.trim()) {
        alert('Please fill in all required fields');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    const profile = {
        id: teacherId,
        fullName: fullName,
        subject: subject,
        email: email
    };

    // Update user profile in users array
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].profile = profile;
        localStorage.setItem('users', JSON.stringify(users));
        window.location.href = 'teacher-dashboard.html';
    }
}

function generateTeacherId() {
    const timestamp = Date.now().toString().slice(-6);
    const teacherId = `TCH${timestamp}`;
    document.getElementById('teacherId').value = teacherId;
}

function handleBackButton(event) {
    event.preventDefault();
    const confirmBack = confirm("Are you sure you want to go back? Your profile setup progress will be lost.");
    if (confirmBack) {
        window.location.href = '../setup-account.html';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Prevent accidental navigation
window.onbeforeunload = function() {
    return "Are you sure you want to leave? Your profile setup progress will be lost.";
}; 