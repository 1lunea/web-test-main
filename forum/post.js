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

function getCurrentUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser ? currentUser.username : null;
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
    
    const userTagInfo = getUserTag(post.author);
    const currentUserId = getCurrentUserId();
    
    const hashtagsHTML = post.hashtags && post.hashtags.length > 0 
        ? `<div class="hashtags-container">
            ${post.hashtags.map(tag => 
                `<span class="hashtag" onclick="window.location.href='forum.html?hashtag=${tag.substring(1)}'">${tag}</span>`
            ).join('')}
           </div>`
        : '';
    
    const postContent = document.getElementById('postContent');
    postContent.innerHTML = `
        <article class="post-card">
            <div class="post-header">
                <div>
                    <div class="post-meta">
                        <span class="post-author" style="color: ${userTagInfo.color}">${post.authorName}</span>
                        ${userTagInfo.tag}
                        <span class="post-timestamp">${new Date(post.timestamp).toLocaleString()}</span>
                        ${(isAdmin() || currentUserId === post.author.username) ? 
                            `<button class="delete-btn" onclick="deletePost('${post.id}')">Delete Post</button>` : 
                            ''}
                    </div>
                    <h1 class="post-title">${post.title}</h1>
                    ${post.subtitle ? `<h2 class="post-subtitle">${post.subtitle}</h2>` : ''}
                </div>
            </div>
            <div class="post-content">${formatContent(post.content)}</div>
            ${hashtagsHTML}
            <div class="post-footer">
                <div class="post-info">
                    <span class="comment-count">${post.comments?.length || 0} comments</span>
                    ${post.category ? `<span class="post-category-label">${post.category}</span>` : ''}
                </div>
            </div>
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

    if (!window.commentQuill) {
        window.commentQuill = new Quill('#commentEditor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            },
            placeholder: 'Write your comment here...'
        });
    }

    if (post.comments && post.comments.length > 0) {
        const sortedComments = [...post.comments].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedComments.forEach(comment => {
            const commentCard = document.createElement('div');
            commentCard.className = 'comment-card';
            
            const userTagInfo = getUserTag(comment.author);
            
            const canDelete = isAdmin() || comment.author.username === currentUser.username;
            const deleteButton = canDelete ? 
                `<button class="delete-comment-btn" onclick="deleteComment('${comment.id}')">
                    Delete
                </button>` : '';

            commentCard.innerHTML = `
                <div class="comment-header">
                    <div class="post-meta">
                        <span class="post-author" style="color: ${userTagInfo.color}">${comment.authorName}</span>
                        ${userTagInfo.tag}
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
        
        if (postIndex !== -1 && posts[postIndex].comments) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const comment = posts[postIndex].comments.find(c => c.id === commentId);
            
            const canModerate = currentUser.role === 'admin' || currentUser.role === 'mod';
            if (canModerate || comment.author.username === currentUser.username) {
                posts[postIndex].comments = posts[postIndex].comments.filter(
                    comment => comment.id !== commentId
                );
                
                localStorage.setItem('forumPosts', JSON.stringify(posts));
                loadPost();
            }
        }
    }
}

function addComment(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const content = window.commentQuill.root.innerHTML.trim();
    
    if (!content || content === '<p><br></p>') return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        const newComment = {
            id: Date.now().toString(),
            content,
            author: {
                username: currentUser.username,
                role: currentUser.role,
                name: currentUser.name || currentUser.username
            },
            authorName: currentUser.name || currentUser.username,
            timestamp: new Date().toISOString()
        };
        
        if (!posts[postIndex].comments) {
            posts[postIndex].comments = [];
        }
        
        posts[postIndex].comments.push(newComment);
        localStorage.setItem('forumPosts', JSON.stringify(posts));
        
        window.commentQuill.setContents([]);
        
        loadPost();
    }
}

setInterval(() => {
    loadPost();
}, 5000);

function getUserTag(user) {
    switch(user.role) {
        case 'admin': 
            return {
                tag: '<span class="user-tag tag-admin">Admin</span>',
                color: '#8957e5'
            };
        case 'mod':
            return {
                tag: '<span class="user-tag tag-mod">Moderator</span>',
                color: '#f85149'
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

function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && (currentUser.username === 'adminquang' || currentUser.role === 'mod');
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        let posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
        posts = posts.filter(p => p.id !== postId);
        localStorage.setItem('forumPosts', JSON.stringify(posts));
        window.location.href = 'forum.html';
    }
}