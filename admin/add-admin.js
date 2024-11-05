window.onload = function() {
    checkOwnerAuth();
    document.getElementById('addAdminForm').addEventListener('submit', handleAddAdmin);
};

function checkOwnerAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.username !== 'adminquang') {
        window.location.href = '../login-signup.html';
    }
}

async function handleAddAdmin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const email = document.getElementById('adminEmail').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(user => user.username === username)) {
        alert('Username already exists!');
        return;
    }

    const newAdmin = {
        id: 'admin_' + Date.now(),
        username: username,
        password: password,
        role: 'admin',
        profile: {
            id: 'ADMIN' + Date.now(),
            fullName: username,
            email: email
        }
    };

    users.push(newAdmin);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Admin account created successfully!');
    window.location.href = 'admin-panel.html';
} 