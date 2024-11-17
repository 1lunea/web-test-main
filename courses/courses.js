window.onload = function() {
    checkAuth();
    setupNavigation();
    loadCourses();
    setupEventListeners();
};

function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !['student', 'teacher', 'admin', 'mod'].includes(currentUser.role)) {
        window.location.href = '../login-signup.html';
        return;
    }
    
    const createECourseBtn = document.getElementById('createECourseBtn');
    if (currentUser.role === 'admin' || currentUser.role === 'mod') {
        createECourseBtn.style.display = 'block';
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

    // Add these new event listeners
    document.getElementById('createECourseBtn').addEventListener('click', showCreateCourseModal);
    document.getElementById('cancelCreate').addEventListener('click', hideCreateCourseModal);
    document.getElementById('createCourseForm').addEventListener('submit', handleCourseCreation);

    // Initialize Quill editor with video embedding and resizing
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['link', 'image', 'video'],
                [{ 'size': ['small', 'normal', 'large', 'huge'] }], // Add size options
                ['clean']
            ]
        }
    });

    // Add custom handler for video embedding with size options
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('video', () => {
        const url = prompt('Enter YouTube or Vimeo URL:');
        if (url) {
            // Convert URL to embed format if needed
            let embedUrl = url;
            if (url.includes('youtube.com/watch?v=')) {
                const videoId = url.split('v=')[1].split('&')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (url.includes('vimeo.com/')) {
                const videoId = url.split('vimeo.com/')[1];
                embedUrl = `https://player.vimeo.com/video/${videoId}`;
            }
            
            // Create resizable wrapper with iframe
            const videoEmbed = `
                <div class="resizable-iframe" data-width="640" data-height="480">
                    <iframe src="${embedUrl}" 
                        width="640" 
                        height="480" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                    <div class="resize-handle se"></div>
                </div>`;
            
            // Insert the video embed as HTML
            const range = quill.getSelection(true);
            quill.clipboard.dangerouslyPasteHTML(range.index, videoEmbed);

            // Add resize functionality after insertion
            setTimeout(() => {
                setupResizeHandlers();
            }, 100);
        }
    });
}

function filterCourses() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const activeCategories = Array.from(document.querySelectorAll('.category-filter.active'))
        .map(filter => filter.dataset.category);
    
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const filteredCourses = courses.filter(course => {
        // Only show e-courses on this page
        if (course.type !== 'ecourse') return false;
        
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
    
    // Filter to show only e-courses on this page
    const eCourses = courses.filter(course => course.type === 'ecourse');
    
    eCourses.forEach(course => {
        // Create a temporary div to strip HTML and get plain text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = course.description;
        const plainText = tempDiv.textContent || tempDiv.innerText;
        const truncatedText = plainText.slice(0, 100) + (plainText.length > 100 ? '...' : '');

        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <span class="course-category ${course.category}">${capitalize(course.category)}</span>
            <h3 class="course-title">${course.name}</h3>
            <p class="course-description">${truncatedText}</p>
            <div class="course-stats">
                <span>${course.students?.length || 0} students</span>
                <span>${course.assignments?.length || 0} assignments</span>
            </div>
        `;
        
        courseCard.addEventListener('click', () => {
            window.location.href = `view-course.html?id=${course.id}`;
        });
        
        coursesGrid.appendChild(courseCard);
    });
    
    if (eCourses.length === 0) {
        coursesGrid.innerHTML = '<p style="text-align: center; color: #8b949e; grid-column: 1/-1;">No E-Courses found.</p>';
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
        case 'mod':
            dashboardButton.onclick = () => window.location.href = '../moderator/moderator-panel.html';
            accountButton.onclick = () => window.location.href = '../moderator/moderator-account.html';
            break;
    }
}

let quill; // Global variable for the Quill editor

function showCreateCourseModal() {
    document.getElementById('createCourseModal').style.display = 'block';
}

function hideCreateCourseModal() {
    document.getElementById('createCourseModal').style.display = 'none';
    document.getElementById('createCourseForm').reset();
    quill.setContents([]);
}

function handleCourseCreation(e) {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const name = document.getElementById('courseName').value;
    const category = document.getElementById('courseCategory').value;
    const description = quill.root.innerHTML;

    const course = {
        id: Date.now().toString(),
        name,
        category,
        description,
        createdAt: new Date().toISOString(),
        students: [],
        assignments: [],
        creator: currentUser.id,
        creatorRole: currentUser.role,
        type: (currentUser.role === 'admin' || currentUser.role === 'mod') ? 'ecourse' : 'course'
    };

    // Get existing courses or initialize empty array
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    courses.push(course);
    localStorage.setItem('courses', JSON.stringify(courses));

    // Hide modal and refresh course list
    hideCreateCourseModal();
    loadCourses();
}

function loadCourses() {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    displayCourses(courses);
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function canModerate() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && (currentUser.role === 'admin' || currentUser.role === 'mod');
}

// Add resize functionality
function setupResizeHandlers() {
    const resizables = document.querySelectorAll('.ql-editor .resizable-iframe');
    
    resizables.forEach(container => {
        const handle = container.querySelector('.resize-handle');
        const iframe = container.querySelector('iframe');
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        handle.addEventListener('mousedown', initResize);

        function initResize(e) {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(container.dataset.width || iframe.width);
            startHeight = parseInt(container.dataset.height || iframe.height);

            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
            e.preventDefault();
        }

        function resize(e) {
            if (!isResizing) return;

            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);

            if (width > 200 && height > 150) {
                iframe.width = width;
                iframe.height = height;
                container.dataset.width = width;
                container.dataset.height = height;
            }
        }

        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }
    });
} 