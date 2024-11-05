window.onload = function() {
    // Check admin authentication first
    checkAdminAuth();
    
    // Then load users and set up event listeners
    loadUsers();
    document.getElementById('searchInput').addEventListener('input', filterUsers);
    document.getElementById('deleteAllBtn').addEventListener('click', deleteAllUsers);
};

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Ensure admin account exists
    const adminExists = users.some(user => user.username === 'adminquang');
    if (!adminExists) {
        users.push({
            id: 'admin',
            username: 'adminquang',
            password: 'adminfirst',
            role: 'admin',
            profile: {
                id: 'ADMIN001',
                fullName: 'Admin Account',
                email: 'admin@hmp.com'
            }
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    displayUsers(users);
}

function deleteAllUsers() {
    if (confirm('Are you sure you want to delete ALL users? This cannot be undone!')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Keep only the admin account
        const adminUser = users.find(user => user.username === 'adminquang');
        localStorage.setItem('users', JSON.stringify([adminUser]));
        
        // Refresh the display
        loadUsers();
    }
}

function deleteUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userToDelete = users.find(user => user.id === userId);
    
    if (userToDelete.username === 'adminquang') {
        alert('Cannot delete owner account!');
        return;
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            loadUsers();
        }
    }
}

function displayUsers(users) {
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        
        // ID Column
        const idCell = document.createElement('td');
        idCell.textContent = user.id;
        row.appendChild(idCell);
        
        // Username Column
        const usernameCell = document.createElement('td');
        usernameCell.textContent = user.username;
        row.appendChild(usernameCell);
        
        // Password Column
        const passwordCell = document.createElement('td');
        passwordCell.textContent = user.password;
        row.appendChild(passwordCell);
        
        // Role Column
        const roleCell = document.createElement('td');
        roleCell.textContent = user.role || 'Not set';
        row.appendChild(roleCell);
        
        // Profile Column
        const profileCell = document.createElement('td');
        if (user.profile) {
            const profileDetails = [
                `ID: ${user.profile.id}`,
                `Name: ${user.profile.fullName}`,
                user.role === 'student' ? `Grade: ${user.profile.grade}` : `Subject: ${user.profile.subject}`,
                `Email: ${user.profile.email}`
            ].join('\n');
            
            profileCell.style.whiteSpace = 'pre-line';
            profileCell.textContent = profileDetails;
        } else {
            profileCell.textContent = 'No profile';
        }
        row.appendChild(profileCell);
        
        // Actions Column
        const actionsCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn';
        
        // Disable delete button only for owner account
        if (user.username === 'adminquang') {
            deleteButton.disabled = true;
            deleteButton.style.opacity = '0.5';
            deleteButton.style.cursor = 'not-allowed';
            deleteButton.title = 'Cannot delete owner account';
        }
        
        deleteButton.onclick = () => deleteUser(user.id);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        
        // Add role indicator
        if (user.username === 'adminquang') {
            const ownerBadge = document.createElement('span');
            ownerBadge.textContent = '(Owner)';
            ownerBadge.style.color = '#238636';
            ownerBadge.style.marginLeft = '5px';
            roleCell.appendChild(ownerBadge);
        }
        
        tableBody.appendChild(row);
    });
}

function filterUsers(event) {
    const searchTerm = event.target.value.toLowerCase();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const filteredUsers = users.filter(user => {
        const searchString = [
            user.id,
            user.username,
            user.role,
            user.profile?.fullName,
            user.profile?.email
        ].join(' ').toLowerCase();
        
        return searchString.includes(searchTerm);
    });
    
    displayUsers(filteredUsers);
}

// Check if current user is admin (you might want to implement proper admin authentication)
function checkAdminAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.username !== 'adminquang') {
        window.location.href = '../login-signup.html';
    }
}
