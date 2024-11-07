window.onload = function() {
    checkAuth();
    setupNavigation();
    loadCourses();
    setupEventListeners();
};

function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !['student', 'teacher', 'admin'].includes(currentUser.role)) {
        window.location.href = '../login-signup.html';
        return;
    }
    
    const createCourseBtn = document.getElementById('createCourseBtn');
    if (currentUser.role === 'admin') {
        createCourseBtn.style.display = 'block';
    }
}

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', filterCourses);
    
    // Category filters
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            filter.classList.toggle('active');
            filterCourses();
        });
    });
}

function filterCourses() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const activeCategories = Array.from(document.querySelectorAll('.category-filter.active'))
        .map(filter => filter.dataset.category);
    
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchQuery) || 
                            course.description.toLowerCase().includes(searchQuery);
        const matchesCategory = activeCategories.length === 0 || 
                              activeCategories.includes(course.category);
        
        return matchesSearch && matchesCategory;
    });
    
    displayCourses(filteredCourses);
}

function displayCourses(courses) {
    const coursesGrid = document.getElementById('coursesGrid');
    coursesGrid.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <span class="course-category ${course.category}">${course.category}</span>
            <h3 class="course-title">${course.name}</h3>
            <p class="course-description">${course.description}</p>
            <div class="course-stats">
                <span>${course.students?.length || 0} students</span>
                <span>${course.assignments?.length || 0} assignments</span>
            </div>
        `;
        
        courseCard.addEventListener('click', () => {
            window.location.href = `course-details.html?id=${course.id}`;
        });
        
        coursesGrid.appendChild(courseCard);
    });
    
    if (courses.length === 0) {
        coursesGrid.innerHTML = '<p style="text-align: center; color: #8b949e; grid-column: 1/-1;">No courses found.</p>';
    }
}

function setupNavigation() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../login-signup.html';
        return;
    }

    const dashboardButton = document.getElementById('backToDashboard');
    const accountButton = document.getElementById('accountButton');
    
    dashboardButton.textContent = '← Back';
    
    switch(currentUser.role) {
        case 'teacher':
            dashboardButton.onclick = () => window.location.href = '../teacher/teacher-dashboard.html';
            accountButton.onclick = () => window.location.href = '../teacher/teacher-account.html';
            break;
        case 'student':
            dashboardButton.onclick = () => window.location.href = '../student/student-dashboard.html';
            accountButton.onclick = () => window.location.href = '../student/student-account.html';
            break;
        case 'admin':
            dashboardButton.onclick = () => window.location.href = '../admin/admin-panel.html';
            accountButton.onclick = () => window.location.href = '../admin/admin-account.html';
            break;
    }
} 