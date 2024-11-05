function handleBackButton(event) {
    event.preventDefault();
    
    const confirmBack = confirm("Are you sure you want to go back? Your signup progress will be lost.");
    
    if (confirmBack) {
        // Clear current user session
        localStorage.removeItem('currentUser');
        window.location.href = 'login-signup.html';
    }
}

function selectRole(role) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Update user's role in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].role = role;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user session
        currentUser.role = role;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Redirect to appropriate profile setup
        window.location.href = role === 'student' ? 
            'student/student-profile-setup.html' : 
            'teacher/teacher-profile-setup.html';
    }
}

// Add event listener for browser's back button
window.onbeforeunload = function() {
    return "Are you sure you want to leave? Your signup progress will be lost.";
}; 