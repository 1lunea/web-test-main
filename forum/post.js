window.onload = function() {
    checkAuth();
    loadPost();
};

function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../login-signup.html';
    }
}

function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        window.location.href = 'forum.html';
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        window.location.href = 'forum.html';
        return;
    }

    document.title = `${post.title} - HMP Forum`;
    
    const postContent = document.getElementById('postContent');
    postContent.innerHTML = `
        <article class="post-card">
            <div class="post-meta">
                <span class="post-author">${post.authorName}</span>
                ${getUserTag(post.author)}
                <span class="post-timestamp">${new Date(post.timestamp).toLocaleString()}</span>
            </div>
            <h1 class="post-title">${post.title}</h1>
            <div class="post-content">${formatContent(post.content)}</div>
        </article>
    `;

    updateCommentsCount(post);
    loadComments(post);
}

function formatContent(content) {
    return content.replace(/\n/g, '<br>');
}

function updateCommentsCount(post) {
    const commentsCount = document.getElementById('commentsCount');
    const count = post.comments?.length || 0;
    commentsCount.textContent = `(${count})`;
}

function loadComments(post) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (post.comments && post.comments.length > 0) {
        const sortedComments = [...post.comments].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedComments.forEach(comment => {
            const commentCard = document.createElement('div');
            commentCard.className = 'comment-card';
            
            // Add delete button if the comment belongs to current user
            const deleteButton = comment.author.username === currentUser.username ? 
                `<button class="delete-comment-btn" onclick="deleteComment('${comment.id}')">
                    Delete
                </button>` : '';

            commentCard.innerHTML = `
                <div class="comment-header">
                    <div class="post-meta">
                        <span class="post-author">${comment.authorName}</span>
                        ${getUserTag(comment.author)}
                        <span class="post-timestamp">${new Date(comment.timestamp).toLocaleString()}</span>
                    </div>
                    ${deleteButton}
                </div>
                <div class="comment-content">${formatContent(comment.content)}</div>
            `;
            commentsList.appendChild(commentCard);
        });
    } else {
        commentsList.innerHTML = `
            <div class="no-comments">
                <p>No comments yet. Be the first to comment!</p>
            </div>
        `;
    }
}

function deleteComment(commentId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1) {
            // Filter out the comment with the matching ID
            posts[postIndex].comments = posts[postIndex].comments.filter(
                comment => comment.id !== commentId
            );
            
            // Save the updated posts
            localStorage.setItem('forumPosts', JSON.stringify(posts));
            
            // Reload the post to show the changes
            loadPost();
        }
    }
}

function addComment(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const content = document.getElementById('commentText').value.trim();
    
    if (!content) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        const newComment = {
            id: Date.now().toString(),
            content,
            author: currentUser,
            authorName: currentUser.username,
            timestamp: new Date().toISOString()
        };
        
        if (!posts[postIndex].comments) {
            posts[postIndex].comments = [];
        }
        
        posts[postIndex].comments.push(newComment);
        localStorage.setItem('forumPosts', JSON.stringify(posts));
        
        document.getElementById('commentForm').reset();
        
        loadPost();
    }
}

setInterval(() => {
    loadPost();
}, 5000);

function getUserTag(user) {
    switch(user.role) {
        case 'admin': return '<span class="user-tag tag-admin">Admin</span>';
        case 'teacher': return '<span class="user-tag tag-teacher">Teacher</span>';
        case 'student': return '<span class="user-tag tag-student">Student</span>';
        default: return '<span class="user-tag tag-owner">Owner</span>';
    }
} 