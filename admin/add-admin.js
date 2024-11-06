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

async function handleAddModerator(e) {
    e.preventDefault();
    
    const username = document.getElementById('modUsername').value;
    const password = document.getElementById('modPassword').value;
    const email = document.getElementById('modEmail').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(user => user.username === username)) {
        alert('Username already exists!');
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