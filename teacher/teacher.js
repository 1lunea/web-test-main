window.onload = function() {
    checkTeacherAuth();
    loadTeacherName();
    
    // Check if we're on the assignments page
    if (window.location.href.includes('teacher-assignments.html')) {
        loadAssignments();
    } else {
        // We're on the dashboard page
        loadCourses();
    }
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

    if (teacherCourses.length === 0) {
        coursesList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #8b949e; padding: 2rem;">
                No courses created yet. Click "Create Course" to get started.
            </div>
        `;
        return;
    }

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
    // Store the selected courseId in sessionStorage
    sessionStorage.setItem('selectedCourseId', courseId);
    window.location.href = 'teacher-assignments.html';
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
    const dueDate = document.getElementById('dueDateInput').value;

    // Validate inputs
    if (!assignmentName || !assignmentDescription) {
        alert('Please fill in all required fields');
        return;
    }

    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex !== -1) {
        if (!courses[courseIndex].assignments) {
            courses[courseIndex].assignments = [];
        }
        
        // Create new assignment with all required fields
        const newAssignment = {
            id: 'assignment_' + Date.now(),
            name: assignmentName,
            description: assignmentDescription,
            dateCreated: new Date().toISOString(),
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            submissions: {},
            grades: {}
        };
        
        courses[courseIndex].assignments.push(newAssignment);
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Clear form and close modal
        closeModal('assignmentModal');
        document.getElementById('assignmentForm').reset();
        loadCourses();
    }
}

function createAssignmentCard(assignment, course) {
    const submissionsCount = Object.keys(assignment.submissions || {}).length;
    const totalStudents = course.students?.length || 0;
    const gradedCount = Object.values(assignment.submissions || {})
        .filter(sub => sub.grade !== undefined).length;

    const card = document.createElement('div');
    card.className = 'assignment-card';
    card.innerHTML = `
        <h4>${assignment.name || 'Untitled Assignment'}</h4>
        <div class="assignment-content">
            <p>${assignment.description || 'No description provided'}</p>
        </div>
        <div class="assignment-dates">
            <div class="date-item">
                <span class="date-label">Posted:</span>
                <span class="date-value">${new Date(assignment.dateCreated).toLocaleDateString()}</span>
            </div>
            <div class="date-item">
                <span class="date-label">Due:</span>
                <span class="date-value">${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</span>
            </div>
        </div>
        <div class="assignment-stats">
            <div class="stat-item">
                <div class="stat-value">${submissionsCount}</div>
                <div class="stat-label">Submitted</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${gradedCount}</div>
                <div class="stat-label">Graded</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${totalStudents}</div>
                <div class="stat-label">Total</div>
            </div>
        </div>
        <div class="assignment-actions">
            <button class="action-btn view-btn" onclick="viewSubmissions('${course.id}', '${assignment.id}')">
                View Submissions
            </button>
            <button class="action-btn delete-btn" onclick="confirmDeleteAssignment('${course.id}', '${assignment.id}')">
                Delete
            </button>
        </div>
    `;
    return card;
}

function populateCourseFilter() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const teacherCourses = courses.filter(course => course.teacherId === currentUser.id);
    
    const courseFilter = document.getElementById('courseFilter');
    courseFilter.innerHTML = '<option value="">All Courses</option>';
    
    teacherCourses.forEach(course => {
        courseFilter.innerHTML += `
            <option value="${course.id}">${course.name}</option>
        `;
    });
}

function filterAssignments() {
    const searchQuery = document.getElementById('searchFilter').value.toLowerCase();
    const selectedCourseId = document.getElementById('courseFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    let teacherCourses = courses.filter(course => course.teacherId === currentUser.id);
    
    // Filter by course if selected
    if (selectedCourseId) {
        teacherCourses = teacherCourses.filter(course => course.id === selectedCourseId);
    }
    
    const assignmentsList = document.getElementById('assignmentsList');
    assignmentsList.innerHTML = '';
    
    let hasAssignments = false;

    teacherCourses.forEach(course => {
        if (!course.assignments || course.assignments.length === 0) return;

        const filteredAssignments = course.assignments.filter(assignment => {
            const matchesSearch = (
                assignment.name?.toLowerCase().includes(searchQuery) || 
                assignment.description?.toLowerCase().includes(searchQuery)
            );
            
            let matchesStatus = true;
            if (status) {
                const now = new Date();
                const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
                
                switch (status) {
                    case 'due':
                        matchesStatus = dueDate && 
                            dueDate >= now && 
                            dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'upcoming':
                        matchesStatus = dueDate && 
                            dueDate > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'past':
                        matchesStatus = dueDate && dueDate < now;
                        break;
                }
            }
            
            return matchesSearch && matchesStatus;
        });

        if (filteredAssignments.length > 0) {
            hasAssignments = true;
            const courseSection = document.createElement('div');
            courseSection.className = 'course-section';
            courseSection.innerHTML = `
                <div class="course-header">
                    <h3 class="course-name">${course.name}</h3>
                    <span class="assignment-count">
                        ${filteredAssignments.length} assignment${filteredAssignments.length !== 1 ? 's' : ''}
                    </span>
                </div>
            `;
            
            const assignmentsGrid = document.createElement('div');
            assignmentsGrid.className = 'assignments-grid';
            
            filteredAssignments.forEach(assignment => {
                assignmentsGrid.appendChild(createAssignmentCard(assignment, course));
            });
            
            courseSection.appendChild(assignmentsGrid);
            assignmentsList.appendChild(courseSection);
        }
    });

    if (!hasAssignments) {
        assignmentsList.innerHTML = `
            <p style="color: #8b949e; text-align: center;">
                No assignments found matching the filters.
            </p>
        `;
    }
}

// Update the loadAssignments function
function loadAssignments() {
    populateCourseFilter();
    
    // Check if there's a selected course from the dashboard
    const selectedCourseId = sessionStorage.getItem('selectedCourseId');
    if (selectedCourseId) {
        // Set the course filter to the selected course
        document.getElementById('courseFilter').value = selectedCourseId;
        // Clear the stored selection
        sessionStorage.removeItem('selectedCourseId');
    }
    
    filterAssignments();
    
    // Add event listeners for filter changes
    document.getElementById('searchFilter').addEventListener('input', filterAssignments);
    document.getElementById('courseFilter').addEventListener('change', filterAssignments);
    document.getElementById('statusFilter').addEventListener('change', filterAssignments);
    
    // Add event listener for clear filters button
    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('searchFilter').value = '';
        document.getElementById('courseFilter').value = '';
        document.getElementById('statusFilter').value = '';
        filterAssignments();
    });
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

function deleteAssignment(courseId, assignmentId) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex !== -1) {
        // Filter out the assignment to delete
        courses[courseIndex].assignments = courses[courseIndex].assignments.filter(
            assignment => assignment.id !== assignmentId
        );
        
        // Save updated courses to localStorage
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Refresh the assignments list
        loadAssignments();
    }
}

function confirmDeleteAssignment(courseId, assignmentId) {
    const confirmDelete = confirm('Are you sure you want to delete this assignment? This action cannot be undone.');
    if (confirmDelete) {
        deleteAssignment(courseId, assignmentId);
    }
}

function viewSubmissions(courseId, assignmentId) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const course = courses.find(c => c.id === courseId);
    const assignment = course?.assignments.find(a => a.id === assignmentId);
    
    if (!course || !assignment) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeModal('submissionsModal')">&times;</span>
            <h2>Student Submissions</h2>
            <div class="submissions-grid">
                ${createSubmissionCards(course, assignment)}
            </div>
        </div>
    `;
    modal.id = 'submissionsModal';
    
    // Remove existing modal if any
    const existingModal = document.getElementById('submissionsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function createSubmissionCards(course, assignment) {
    if (!course.students || course.students.length === 0) {
        return '<p class="no-submissions">No students enrolled in this course.</p>';
    }

    // Check if there are any submissions
    const hasSubmissions = course.students.some(student => 
        assignment.submissions && assignment.submissions[student.id]
    );

    if (!hasSubmissions) {
        return '<p class="no-submissions">No work submitted</p>';
    }

    return course.students.map(student => {
        const submission = assignment.submissions?.[student.id];
        // Skip students who haven't submitted
        if (!submission) return '';
        
        let status = 'ungraded';
        let statusClass = 'status-ungraded';
        
        if (submission.grade) {
            status = 'graded';
            statusClass = 'status-graded';
        } else if (submission.status === 'rejected') {
            status = 'rejected';
            statusClass = 'status-rejected';
        }

        return `
            <div class="submission-card">
                <div class="submission-header">
                    <span class="student-name">${student.username || 'Unknown Student'}</span>
                    <span class="submission-status ${statusClass}">${status}</span>
                </div>
                <div class="submission-details">
                    <div class="submission-time">
                        Submitted: ${new Date(submission.timestamp).toLocaleString()}
                    </div>
                    ${submission.text ? `
                        <div class="submission-text">
                            ${submission.text.substring(0, 100)}${submission.text.length > 100 ? '...' : ''}
                        </div>
                    ` : ''}
                </div>
                <button class="view-submission-btn" 
                        onclick="window.location.href='submission-teacher.html?courseId=${course.id}&assignmentId=${assignment.id}&studentId=${student.id}'">
                    View Details
                </button>
            </div>
        `;
    }).filter(card => card !== '').join('');
}


