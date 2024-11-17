window.onload = function() {
    // Check mod authentication first
    checkModAuth();
    
    // Set up account button navigation
    setupAccountButton();
    
    // Then load users
    loadUsers();
};

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    displayUsers(users);
    updateStats();
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
        
        tableBody.appendChild(row);
    });
}

function checkModAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'mod') {
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
            window.location.href = 'mod-account.html';
        });
    }
}
