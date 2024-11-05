// Check if user is logged in and is a student
window.onload = function() {
    checkStudentAuth();
    loadCourses();
    loadAssignments();
    loadStudentName();
};

function checkStudentAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = '../login-signup.html';
    }
}

function switchView(view) {
    // Hide all views
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('assignmentsView').style.display = 'none';

    // Show selected view
    document.getElementById(`${view}View`).style.display = 'block';

    // Update active button
    const buttons = document.querySelectorAll('.nav-button');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent.toLowerCase().includes(view.toLowerCase())) {
            button.classList.add('active');
        }
    });
}

function loadCourses() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const studentCourses = courses.filter(course => 
        course.students?.some(student => student.id === currentUser.id)
    );
    
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';

    if (studentCourses.length === 0) {
        coursesList.innerHTML = '<p style="color: #8b949e; text-align: center; grid-column: 1/-1;">You haven\'t joined any courses yet.</p>';
        return;
    }

    studentCourses.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesList.appendChild(courseCard);
    });
}

function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    
    card.innerHTML = `
        <div class="course-header">
            <h3 class="course-title">${course.name}</h3>
        </div>
        <p class="course-description">${course.description}</p>
        <div class="course-stats">
            <div class="stat-item">
                <div class="stat-value">${course.assignments?.length || 0}</div>
                <div class="stat-label">Assignments</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${course.students?.length || 0}</div>
                <div class="stat-label">Students</div>
            </div>
        </div>
    `;
    
    return card;
}

function openJoinModal() {
    document.getElementById('joinCourseModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function joinCourse(event) {
    event.preventDefault();
    
    const courseCode = document.getElementById('courseCode').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    
    const course = courses.find(c => c.code === courseCode);
    
    if (!course) {
        alert('Invalid course code. Please try again.');
        return;
    }

    if (course.students?.some(student => student.id === currentUser.id)) {
        alert('You are already enrolled in this course.');
        return;
    }

    // Add student to course
    const courseIndex = courses.findIndex(c => c.code === courseCode);
    if (!courses[courseIndex].students) {
        courses[courseIndex].students = [];
    }
    
    courses[courseIndex].students.push({
        id: currentUser.id,
        username: currentUser.username
    });

    localStorage.setItem('courses', JSON.stringify(courses));
    
    // Reset form and close modal
    document.getElementById('joinCourseForm').reset();
    closeModal('joinCourseModal');
    
    // Refresh courses list
    loadCourses();
}

function loadAssignments() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const studentCourses = courses.filter(course => 
        course.students?.some(student => student.id === currentUser.id)
    );
    
    const assignmentsList = document.getElementById('assignmentsList');
    assignmentsList.innerHTML = '';

    let hasAssignments = false;

    studentCourses.forEach(course => {
        if (course.assignments && course.assignments.length > 0) {
            hasAssignments = true;
            const courseSection = document.createElement('div');
            courseSection.className = 'course-section';
            courseSection.innerHTML = `
                <h3>${course.name}</h3>
                <div class="assignments-grid">
                    ${course.assignments.map(assignment => `
                        <div class="assignment-card">
                            <h4>${assignment.name}</h4>
                            <p>${assignment.description}</p>
                            <div class="assignment-date">
                                Posted: ${new Date(assignment.dateCreated).toLocaleDateString()}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            assignmentsList.appendChild(courseSection);
        }
    });

    if (!hasAssignments) {
        assignmentsList.innerHTML = '<p style="color: #8b949e; text-align: center;">No assignments available.</p>';
    }
}

function loadStudentName() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const student = users.find(user => user.id === currentUser.id);
    
    const studentNameSpan = document.getElementById('studentName');
    studentNameSpan.textContent = student.profile?.fullName || currentUser.username;
}

// Add event listener for clicking outside modals
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}
function loadAssignments() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const studentCourses = courses.filter(course => 
        course.students?.some(student => student.id === currentUser.id)
    );
    
    const assignmentsList = document.getElementById('assignmentsList');
    assignmentsList.innerHTML = '';

    studentCourses.forEach(course => {
        if (course.assignments && course.assignments.length > 0) {
            const courseSection = document.createElement('div');
            courseSection.className = 'course-section';
            courseSection.innerHTML = `<h3>${course.name}</h3>`;
            
            const assignmentsGrid = document.createElement('div');
            assignmentsGrid.className = 'assignments-grid';

            course.assignments.forEach(assignment => {
                const isSubmitted = assignment.submissions?.[currentUser.id];
                const statusClass = isSubmitted ? 'status-submitted' : 'status-pending';
                const statusText = isSubmitted ? 'Submitted' : 'Pending';
                
                const assignmentCard = document.createElement('div');
                assignmentCard.className = 'assignment-card';
                assignmentCard.innerHTML = `
                    <h4>${assignment.name}</h4>
                    <p>${assignment.description}</p>
                    <div class="assignment-date">
                        Posted: ${new Date(assignment.dateCreated).toLocaleDateString()}
                    </div>
                    <span class="assignment-status ${statusClass}">${statusText}</span>
                    ${!isSubmitted ? `
                        <button class="submit-btn" 
                                onclick="openSubmissionModal('${course.id}', '${assignment.id}')">
                            Submit Assignment
                        </button>
                    ` : ''}
                `;
                assignmentsGrid.appendChild(assignmentCard);
            });

            courseSection.appendChild(assignmentsGrid);
            assignmentsList.appendChild(courseSection);
        }
    });
}

function openSubmissionModal(courseId, assignmentId) {
    document.getElementById('courseId').value = courseId;
    document.getElementById('assignmentId').value = assignmentId;
    document.getElementById('submissionModal').style.display = 'block';
}

function submitAssignment(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courseId = document.getElementById('courseId').value;
    const assignmentId = document.getElementById('assignmentId').value;
    const submissionText = document.getElementById('submissionText').value;
    const submissionFile = document.getElementById('submissionFile').files[0];
    
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex !== -1) {
        const assignmentIndex = courses[courseIndex].assignments.findIndex(
            a => a.id === assignmentId
        );
        
        if (assignmentIndex !== -1) {
            if (!courses[courseIndex].assignments[assignmentIndex].submissions) {
                courses[courseIndex].assignments[assignmentIndex].submissions = {};
            }
            
            courses[courseIndex].assignments[assignmentIndex].submissions[currentUser.id] = {
                text: submissionText,
                file: submissionFile ? {
                    name: submissionFile.name,
                    url: URL.createObjectURL(submissionFile)
                } : null,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('courses', JSON.stringify(courses));
            closeModal('submissionModal');
            document.getElementById('submissionForm').reset();
            loadAssignments();
        }
    }
}

// Add file input change handler
document.getElementById('submissionFile')?.addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'No file selected';
    document.getElementById('selectedFile').textContent = fileName;
});