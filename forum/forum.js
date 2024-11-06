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
        window.location.href = '../admin/admin-panel.html';
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

        const userTagInfo = getUserTag(post.author);
        
        // Add admin delete button if user is admin
        const adminControls = isAdmin() ? `
            <button onclick="event.stopPropagation(); deletePost('${post.id}')" class="mod-delete-btn">
                Delete Post
            </button>
        ` : '';
        
        postCard.innerHTML = `
            <div class="post-header">
                <div>
                    <div class="post-meta">
                        <span class="post-author" style="color: ${userTagInfo.color}">${post.authorName}</span>
                        ${userTagInfo.tag}
                        <span class="post-timestamp">${new Date(post.timestamp).toLocaleString()}</span>
                        ${adminControls}
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                </div>
            </div>
            <div class="post-preview">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</div>
            <div class="post-footer">
                <span class="comment-count">${post.comments?.length || 0} comments</span>
            </div>
        `;
        
        postCard.onclick = () => viewPost(post.id);
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

function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.username === 'adminquang';
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        
        let adminControls = '';
        if (isAdmin()) {
            adminControls = `
                <button onclick="deletePost('${post.id}')" class="mod-delete-btn">
                    Delete Post
                </button>
            `;
        }

        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-info">
                    <span class="post-author">${post.author}</span>
                    <span class="post-date">${new Date(post.timestamp).toLocaleString()}</span>
                </div>
                ${adminControls}
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button onclick="toggleComments('${post.id}')" class="action-btn">
                    Comments (${post.comments ? Object.keys(post.comments).length : 0})
                </button>
            </div>
            <div id="comments-${post.id}" class="comments-section" style="display: none;">
                <div class="comments-container" id="comments-container-${post.id}"></div>
                <div class="add-comment">
                    <textarea id="comment-input-${post.id}" placeholder="Add a comment..."></textarea>
                    <button onclick="addComment('${post.id}')" class="action-btn">Add Comment</button>
                </div>
            </div>
        `;
        
        postsContainer.appendChild(postElement);
    });
}

function displayComments(postId, comments) {
    const commentsContainer = document.getElementById(`comments-container-${postId}`);
    commentsContainer.innerHTML = '';
    
    Object.entries(comments).forEach(([commentId, comment]) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        let adminControls = '';
        if (isAdmin()) {
            adminControls = `
                <button onclick="deleteComment('${postId}', '${commentId}')" class="mod-delete-btn">
                    Delete
                </button>
            `;
        }

        commentElement.innerHTML = `
            <div class="comment-header">
                <div class="comment-info">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${new Date(comment.timestamp).toLocaleString()}</span>
                </div>
                ${adminControls}
            </div>
            <div class="comment-content">${comment.content}</div>
        `;
        
        commentsContainer.appendChild(commentElement);
    });
}

function deletePost(postId) {
    if (!isAdmin()) return;
    
    if (confirm('Are you sure you want to delete this post and all its comments?')) {
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const updatedPosts = posts.filter(post => post.id !== postId);
        localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
        window.location.reload(); // Reload the page to show changes
    }
}

function deleteComment(postId, commentId) {
    if (!isAdmin()) return;
    
    if (confirm('Are you sure you want to delete this comment?')) {
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1 && posts[postIndex].comments) {
            // Filter out the comment with the matching ID
            posts[postIndex].comments = posts[postIndex].comments.filter(
                comment => comment.id !== commentId
            );
            
            localStorage.setItem('forumPosts', JSON.stringify(posts));
            loadPosts(); // Refresh the display
        }
    }
} 