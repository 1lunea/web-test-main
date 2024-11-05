window.onload = function() {
    checkTeacherAuth();
    loadCourses();
    loadTeacherName();
};

function checkTeacherAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'teacher') {
        window.location.href = '../login-signup.html';
    }
}

function switchView(view) {
    // Hide all views
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('coursesView').style.display = 'none';
    document.getElementById('accountView').style.display = 'none';

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
    const teacherCourses = courses.filter(course => course.teacherId === currentUser.id);
    
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';

    teacherCourses.forEach(course => {
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
            <button class="delete-btn" onclick="confirmDeleteCourse('${course.id}')">
                <span class="delete-icon">🗑️</span>
            </button>
        </div>
        <p class="course-description">${course.description}</p>
        <div class="course-stats">
            <div class="stat-item">
                <div class="stat-value">${course.students?.length || 0}</div>
                <div class="stat-label">Students</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${course.assignments?.length || 0}</div>
                <div class="stat-label">Assignments</div>
            </div>
        </div>
        <div class="course-actions">
            <button class="action-btn grade-btn" onclick="openGradeModal('${course.id}')">
                View Students
            </button>
            <button class="action-btn assign-btn" onclick="viewCourseAssignments('${course.id}')">
                View Assignments
            </button>
        </div>
        <div class="course-code-container">
            <span class="course-code">${course.code}</span>
            <button class="copy-btn" onclick="copyCode('${course.code}')">
                Copy Code
            </button>
        </div>
    `;
    
    return card;
}

function viewCourseAssignments(courseId) {
    window.location.href = `teacher-assignments.html?courseId=${courseId}`;
}

function openGradeModal(courseId, assignmentId) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const course = courses.find(c => c.id === courseId);
    const assignment = course.assignments.find(a => a.id === assignmentId);
    
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = `
        <h3>Submissions for ${assignment.name}</h3>
    `;

    if (course.students && course.students.length > 0) {
        course.students.forEach(student => {
            const submission = assignment.submissions?.[student.id];
            const studentItem = document.createElement('div');
            studentItem.className = 'student-item';
            
            studentItem.innerHTML = `
                <div class="student-info">
                    <span class="student-name">${student.username}</span>
                    <div class="student-stats">
                        ${submission ? `
                            <div class="submission-content">
                                <p>${submission.text}</p>
                                ${submission.file ? `
                                    <a href="${submission.file.url}" 
                                       target="_blank" 
                                       class="file-link">
                                        View File: ${submission.file.name}
                                    </a>
                                ` : ''}
                                <span class="submission-date">
                                    Submitted: ${new Date(submission.timestamp).toLocaleString()}
                                </span>
                            </div>
                        ` : '<span class="no-submission">No submission yet</span>'}
                    </div>
                </div>
            `;
            
            studentsList.appendChild(studentItem);
        });
    }

    document.getElementById('gradeModal').style.display = 'block';
}

function confirmDeleteAllStudents(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const course = courses.find(c => c.id === courseId);
    const studentCount = course.students?.length || 0;

    if (studentCount === 0) {
        alert('No students to remove.');
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to remove all students (${studentCount} students) from this course? This action cannot be undone.`);
    if (confirmDelete) {
        deleteAllStudents(courseId);
    }
}

function deleteAllStudents(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex !== -1) {
        // Remove all students from the course
        courses[courseIndex].students = [];
        
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Refresh the modal content
        openGradeModal(courseId);
        // Refresh the course cards
        loadCourses();
    }
}

function confirmRemoveStudent(courseId, studentId, studentName) {
    const confirmRemove = confirm(`Are you sure you want to remove ${studentName} from this course?`);
    if (confirmRemove) {
        removeStudent(courseId, studentId);
    }
}

function removeStudent(courseId, studentId) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex !== -1) {
        // Remove student from the course
        courses[courseIndex].students = courses[courseIndex].students.filter(
            student => student.id !== studentId
        );
        
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Refresh the modal content
        openGradeModal(courseId);
        // Refresh the course cards
        loadCourses();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function addAssignment(event) {
    event.preventDefault();
    
    const courseId = document.getElementById('courseIdInput').value;
    const assignmentName = document.getElementById('assignmentName').value;
    const assignmentDescription = document.getElementById('assignmentDescription').value;

    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex !== -1) {
        if (!courses[courseIndex].assignments) {
            courses[courseIndex].assignments = [];
        }
        
        courses[courseIndex].assignments.push({
            id: 'assignment_' + Date.now(),
            name: assignmentName,
            description: assignmentDescription,
            dateCreated: new Date().toISOString(),
            grades: {}
        });
        
        localStorage.setItem('courses', JSON.stringify(courses));
        closeModal('assignmentModal');
        document.getElementById('assignmentForm').reset();
        loadCourses();
    }
}

function updateGrade(courseId, studentId, grade) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex !== -1) {
        const studentIndex = courses[courseIndex].students.findIndex(s => s.id === studentId);
        if (studentIndex !== -1) {
            courses[courseIndex].students[studentIndex].grade = grade;
            localStorage.setItem('courses', JSON.stringify(courses));
        }
    }
}

// Add event listeners for clicking outside modals
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        // Show temporary success message
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    });
}

function confirmDeleteCourse(courseId) {
    const confirmDelete = confirm('Are you sure you want to delete this course? This action cannot be undone.');
    if (confirmDelete) {
        deleteCourse(courseId);
    }
}

function deleteCourse(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const updatedCourses = courses.filter(course => course.id !== courseId);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    loadCourses(); // Refresh the courses list
}

function confirmDeleteAllCourses() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const teacherCourses = courses.filter(course => course.teacherId === currentUser.id);
    
    if (teacherCourses.length === 0) {
        alert('You have no courses to delete.');
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete all your courses (${teacherCourses.length} courses)? This action cannot be undone.`);
    if (confirmDelete) {
        deleteAllCourses();
    }
}

function deleteAllCourses() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    
    // Keep only courses that don't belong to the current teacher
    const updatedCourses = courses.filter(course => course.teacherId !== currentUser.id);
    
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    loadCourses(); // Refresh the courses list
}

function loadTeacherName() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const teacher = users.find(user => user.id === currentUser.id);
    
    const teacherNameSpan = document.getElementById('teacherName');
    teacherNameSpan.textContent = teacher.profile?.fullName || currentUser.username;
}


