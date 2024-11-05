window.onload = function() {
    checkTeacherAuth();
};

function checkTeacherAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'teacher') {
        window.location.href = '../login-signup.html';
    }
}

function generateCourseCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function createCourse(event) {
    event.preventDefault();
    
    const courseName = document.getElementById('courseName').value;
    const courseDescription = document.getElementById('courseDescription').value;
    const courseCode = generateCourseCode();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const newCourse = {
        id: 'course_' + Date.now(),
        name: courseName,
        description: courseDescription,
        code: courseCode,
        teacherId: currentUser.id,
        students: [],
        assignments: []
    };

    // Save to localStorage
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    courses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(courses));

    // Show success message with course code
    const successMessage = document.getElementById('successMessage');
    const courseCodeSpan = document.getElementById('courseCode');
    courseCodeSpan.textContent = courseCode;
    successMessage.style.display = 'block';

    // Reset form
    document.getElementById('createCourseForm').reset();

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
        window.location.href = 'teacher-dashboard.html';
    }, 2000);
}
