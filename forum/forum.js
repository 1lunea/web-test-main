window.onload = function() {
    checkAuth();
    loadPosts();
};

function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../login-signup.html';
    }
}

function goBack() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.role === 'teacher') {
        window.location.href = '../teacher/teacher-dashboard.html';
    } else if (currentUser.role === 'student') {
        window.location.href = '../student/student-dashboard.html';
    } else if (currentUser.role === 'admin') {
        window.location.href = '../admin/admin-dashboard.html';
    }
}

function getUserTag(user) {
    switch(user.role) {
        case 'admin': 
            return {
                tag: '<span class="user-tag tag-admin">Admin</span>',
                color: '#da3633'
            };
        case 'teacher': 
            return {
                tag: '<span class="user-tag tag-teacher">Teacher</span>',
                color: '#1f6feb'
            };
        case 'student': 
            return {
                tag: '<span class="user-tag tag-student">Student</span>',
                color: '#238636'
            };
        default: 
            return {
                tag: '<span class="user-tag tag-owner">Owner</span>',
                color: '#333333'
            };
    }
}

function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const postsList = document.getElementById('postsList');
    postsList.innerHTML = '';

    posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.onclick = () => viewPost(post.id);

        const userTagInfo = getUserTag(post.author);
        
        // Format content preview
        const contentPreview = post.content
            .replace(/\n/g, ' ')
            .substring(0, 200);
        
        postCard.innerHTML = `
            <div class="post-header">
                <div>
                    <div class="post-meta">
                        <span class="post-author" style="color: ${userTagInfo.color}">${post.authorName}</span>
                        ${userTagInfo.tag}
                        <span class="post-timestamp">${new Date(post.timestamp).toLocaleString()}</span>
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                </div>
            </div>
            <div class="post-preview">${contentPreview}${post.content.length > 200 ? '...' : ''}</div>
            <div class="post-footer">
                <span class="comment-count">${post.comments?.length || 0} comments</span>
            </div>
        `;
        postsList.appendChild(postCard);
    });
}

function openCreatePostModal() {
    document.getElementById('createPostModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function createPost(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    
    const newPost = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        author: currentUser,
        authorName: currentUser.username,
        timestamp: new Date().toISOString(),
        comments: []
    };
    
    const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    posts.unshift(newPost);
    localStorage.setItem('forumPosts', JSON.stringify(posts));
    
    closeModal('createPostModal');
    document.getElementById('postForm').reset();
    loadPosts();
}

function searchPosts(query) {
    const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase())
    );
    
    const postsList = document.getElementById('postsList');
    postsList.innerHTML = '';
    
    filteredPosts.forEach(post => {
        // ... same post card creation code as in loadPosts ...
    });
}

function viewPost(postId) {
    window.location.href = `post.html?id=${postId}`;
} 