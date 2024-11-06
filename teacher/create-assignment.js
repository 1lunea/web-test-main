window.onload = function() {
    checkTeacherAuth();
    loadCourseOptions();
    
    // Set minimum date to current date/time
    const dueDateInput = document.getElementById('assignmentDueDate');
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
    dueDateInput.min = localISOTime;
};

function checkTeacherAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'teacher') {
        window.location.href = '../login-signup.html';
    }
}

function loadCourseOptions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const teacherCourses = courses.filter(course => course.teacherId === currentUser.id);
    
    const courseSelect = document.getElementById('assignmentCourse');
    courseSelect.innerHTML = ''; // Clear existing options
    
    if (teacherCourses.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No courses available';
        option.disabled = true;
        courseSelect.appendChild(option);
        return;
    }
    
    teacherCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        courseSelect.appendChild(option);
    });
}

function createAssignment(event) {
    event.preventDefault();
    
    // Get form values
    const courseId = document.getElementById('assignmentCourse').value;
    const name = document.getElementById('assignmentName').value.trim();
    const description = document.getElementById('assignmentDescription').value.trim();
    const dueDate = document.getElementById('assignmentDueDate').value;
    
    // Validate inputs
    if (!courseId || !name || !description || !dueDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Validate due date is not in the past
    const now = new Date();
    const selectedDueDate = new Date(dueDate);
    
    if (selectedDueDate <= now) {
        alert('Due date must be in the future');
        return;
    }
    
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
        alert('Course not found');
        return;
    }
    
    // Create new assignment
    const newAssignment = {
        id: 'assignment_' + Date.now(),
        name: name,
        description: description,
        dateCreated: new Date().toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        submissions: {},
        grades: {}
    };
    
    // Initialize assignments array if it doesn't exist
    if (!courses[courseIndex].assignments) {
        courses[courseIndex].assignments = [];
    }
    
    // Add assignment to course
    courses[courseIndex].assignments.push(newAssignment);
    
    // Save to localStorage
    localStorage.setItem('courses', JSON.stringify(courses));
    
    // Redirect back to assignments page
    window.location.href = 'teacher-assignments.html';
}
