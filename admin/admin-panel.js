window.onload = function() {
    // Check admin authentication first
    checkAdminAuth();
    
    // Set up account button navigation
    setupAccountButton();
    
    // Then load users and set up event listeners
    loadUsers();
    document.getElementById('searchInput').addEventListener('input', filterUsers);
    document.getElementById('deleteAllBtn').addEventListener('click', deleteAllUsers);
    
    // Add new event listener for the Add Moderator button
    const addModBtn = document.querySelector('.add-admin-btn');
    addModBtn.onclick = showModModal;
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
    updateStats();
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

function updateStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalStudents').textContent = 
        users.filter(user => user.role === 'student').length;
    document.getElementById('totalTeachers').textContent = 
        users.filter(user => user.role === 'teacher').length;
}

function setupAccountButton() {
    const accountButton = document.getElementById('accountButton');
    if (accountButton) {
        accountButton.addEventListener('click', () => {
            window.location.href = 'admin-account.html';
        });
    }
}

function showModModal() {
    document.getElementById('addModModal').style.display = 'flex';
}

function closeModModal() {
    document.getElementById('addModModal').style.display = 'none';
    // Clear the form
    document.getElementById('modUsername').value = '';
    document.getElementById('modPassword').value = '';
    document.getElementById('modFullName').value = '';
    document.getElementById('modEmail').value = '';
}

function addModerator() {
    const username = document.getElementById('modUsername').value;
    const password = document.getElementById('modPassword').value;
    const fullName = document.getElementById('modFullName').value;
    const email = document.getElementById('modEmail').value;

    // Basic validation
    if (!username || !password || !fullName || !email) {
        alert('Please fill in all fields');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if username already exists
    if (users.some(user => user.username === username)) {
        alert('Username already exists!');
        return;
    }

    // Create new moderator object
    const newMod = {
        id: 'MOD' + Date.now(),
        username: username,
        password: password,
        role: 'mod',
        profile: {
            id: 'MOD' + Date.now(),
            fullName: fullName,
            email: email
        }
    };

    // Add to users array
    users.push(newMod);
    localStorage.setItem('users', JSON.stringify(users));

    // Close modal and refresh display
    closeModModal();
    loadUsers();
    alert('Moderator added successfully!');
}
