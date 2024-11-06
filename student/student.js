// Check if user is logged in and is a student
window.onload = function() {
    checkStudentAuth();
    if (window.location.pathname.includes('student-dashboard.html')) {
        loadCourses();
        loadStudentName();
    } else if (window.location.pathname.includes('student-assignments.html')) {
        loadCourseFilter();
        filterAssignments();
        loadStudentName();
    }
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
        <div class="course-actions">
            <button class="view-assignments-btn" onclick="window.location.href='student-assignments.html'">
                View Assignments
            </button>
            <button class="leave-course-btn" onclick="leaveCourse('${course.id}')">
                Leave Course
            </button>
        </div>
    `;
    
    return card;
}

function leaveCourse(courseId) {
    if (!confirm('Are you sure you want to leave this course?')) {
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
        courses[courseIndex].students = courses[courseIndex].students.filter(
            student => student.id !== currentUser.id
        );
        
        localStorage.setItem('courses', JSON.stringify(courses));
        loadCourses(); // Refresh the courses list
    }
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
                timestamp: new Date().toISOString(),
                status: 'pending' // Reset status to pending for new submissions
            };
            
            localStorage.setItem('courses', JSON.stringify(courses));
            closeModal('submissionModal');
            document.getElementById('submissionForm').reset();
            document.getElementById('selectedFile').textContent = 'No file selected';
            filterAssignments();
        }
    }
}

// Add file input change handler
document.getElementById('submissionFile')?.addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'No file selected';
    document.getElementById('selectedFile').textContent = fileName;
});

function loadCourseFilter() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const studentCourses = courses.filter(course => 
        course.students?.some(student => student.id === currentUser.id)
    );
    
    const courseFilter = document.getElementById('courseFilter');
    
    // Clear existing options except "All Courses"
    courseFilter.innerHTML = '<option value="all">All Courses</option>';
    
    // Add course options
    studentCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        courseFilter.appendChild(option);
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function formatDueDate(dateString) {
    if (!dateString) return 'No due date';
    return formatDate(dateString);
}

function isOverdue(dateString) {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    if (isNaN(dueDate.getTime())) return false;
    return new Date() > dueDate;
}

function filterAssignments() {
    const selectedCourseId = document.getElementById('courseFilter').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    let filteredCourses;
    
    if (selectedCourseId === 'all') {
        filteredCourses = courses.filter(course => 
            course.students?.some(student => student.id === currentUser.id)
        );
    } else {
        filteredCourses = courses.filter(course => 
            course.id === selectedCourseId && 
            course.students?.some(student => student.id === currentUser.id)
        );
    }
    
    const assignmentsList = document.getElementById('assignmentsList');
    assignmentsList.innerHTML = '';

    let hasAssignments = false;

    filteredCourses.forEach(course => {
        if (course.assignments && course.assignments.length > 0) {
            hasAssignments = true;
            const courseSection = document.createElement('div');
            courseSection.className = 'course-section';
            courseSection.innerHTML = `<h3>${course.name || 'Unnamed Course'}</h3>`;
            
            const assignmentsGrid = document.createElement('div');
            assignmentsGrid.className = 'assignments-grid';

            course.assignments.forEach(assignment => {
                const submission = assignment.submissions?.[currentUser.id];
                const isSubmitted = submission !== undefined;
                let statusClass, statusText;

                if (isSubmitted) {
                    switch(submission.status) {
                        case 'rejected':
                            statusClass = 'status-rejected';
                            statusText = 'Rejected';
                            break;
                        case 'accepted':
                            statusClass = 'status-accepted';
                            statusText = 'Accepted';
                            break;
                        default:
                            statusClass = 'status-pending';
                            statusText = 'Pending Review';
                    }
                } else {
                    statusClass = 'status-pending';
                    statusText = 'Not Submitted';
                }

                const assignmentCard = document.createElement('div');
                assignmentCard.className = 'assignment-card';
                assignmentCard.innerHTML = `
                    <h4>${assignment.name || 'Untitled Assignment'}</h4>
                    <div class="assignment-content">
                        <p>${assignment.description || 'No description provided'}</p>
                        ${assignment.content ? `<div class="assignment-details">${assignment.content}</div>` : ''}
                    </div>
                    <div class="assignment-dates">
                        <div class="date-item">
                            <span class="date-label">Posted:</span>
                            <span class="date-value">${formatDate(assignment.dateCreated)}</span>
                        </div>
                        <div class="date-item">
                            <span class="date-label">Due:</span>
                            <span class="date-value ${isOverdue(assignment.dueDate) ? 'overdue' : ''}">${formatDueDate(assignment.dueDate)}</span>
                        </div>
                    </div>
                    <span class="assignment-status ${statusClass}">${statusText}</span>
                    ${submission?.grade ? `
                        <div class="grade-display">
                            Grade: ${submission.grade}/100
                        </div>
                    ` : ''}
                    ${submission?.rejectionReason ? `
                        <div class="rejection-reason">
                            Rejection Reason: ${submission.rejectionReason}
                        </div>
                    ` : ''}
                    ${(!isSubmitted || submission?.status === 'rejected') ? `
                        <button class="submit-btn" 
                                onclick="openSubmissionModal('${course.id}', '${assignment.id}')">
                            ${isSubmitted ? 'Resubmit' : 'Submit'} Assignment
                        </button>
                    ` : ''}
                `;
                assignmentsGrid.appendChild(assignmentCard);
            });

            courseSection.appendChild(assignmentsGrid);
            assignmentsList.appendChild(courseSection);
        }
    });

    if (!hasAssignments) {
        assignmentsList.innerHTML = '<p style="color: #8b949e; text-align: center;">No assignments available.</p>';
    }
}
