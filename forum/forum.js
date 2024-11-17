window.onload = function() {
    checkAuth();
    setupNavigation();
    loadPosts();
};

function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../login-signup.html';
    }
}

function setupNavigation() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../login-signup.html';
        return;
    }

    // Set up the back button and account button
    const backButton = document.getElementById('backButton');
    const accountButton = document.getElementById('accountButton');
    
    if (currentUser.role === 'teacher') {
        backButton.onclick = () => window.location.href = '../teacher/teacher-dashboard.html';
        accountButton.onclick = () => window.location.href = '../teacher/teacher-account.html';
    } else if (currentUser.role === 'student') {
        backButton.onclick = () => window.location.href = '../student/student-dashboard.html';
        accountButton.onclick = () => window.location.href = '../student/student-account.html';
    } else if (currentUser.role === 'admin') {
        backButton.onclick = () => window.location.href = '../admin/admin-panel.html';
        accountButton.onclick = () => window.location.href = '../admin/admin-account.html';
    } else if (currentUser.role === 'mod') {
        backButton.onclick = () => window.location.href = '../mod/mod-panel.html';
        accountButton.onclick = () => window.location.href = '../mod/mod-account.html';
    }
}

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

function getCurrentUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser ? currentUser.username : null;
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
        const currentUserId = getCurrentUserId();
        
        // Add hashtags HTML
        const hashtagsHTML = post.hashtags && post.hashtags.length > 0 
            ? `<div class="hashtags-container">
                ${post.hashtags.map(tag => 
                    `<span class="hashtag" onclick="searchByHashtag('${tag}')">${tag}</span>`
                ).join('')}
               </div>`
            : '';
        
        postCard.innerHTML = `
            <div class="post-header">
                <div>
                    <div class="post-meta">
                        <span class="post-author" style="color: ${userTagInfo.color}">${post.authorName}</span>
                        ${userTagInfo.tag}
                        <span class="post-timestamp">${new Date(post.timestamp).toLocaleString()}</span>
                        ${(isAdmin() || currentUserId === post.author.username) ? 
                            `<button class="delete-btn">Delete Post</button>` : 
                            ''}
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                </div>
            </div>
            <div class="post-preview">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</div>
            ${hashtagsHTML}
            <div class="post-footer">
                <span class="comment-count">${post.comments?.length || 0} comments</span>
                <span class="post-category-label">${post.category || ''}</span>
            </div>
        `;

        // Add click event for the entire post card
        postCard.addEventListener('click', (e) => {
            // Only navigate if we didn't click the delete button
            if (!e.target.classList.contains('delete-btn')) {
                viewPost(post.id);
            }
        });

        // Add separate click handler for delete button
        const deleteBtn = postCard.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();  // Prevent any default button behavior
                e.stopPropagation(); // Prevent the click from triggering the post card click
                handleDeletePost(post.id);
            });
        }
        
        postsList.appendChild(postCard);
    });
}

function handleDeletePost(postId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const post = posts.find(p => p.id === postId);
    
    // Check if user has permission to delete
    const canModerate = currentUser.role === 'admin' || currentUser.role === 'mod';
    if (!post || (!canModerate && currentUser.username !== post.author.username)) {
        alert('You do not have permission to delete this post.');
        return;
    }
    
    if (confirm('Are you sure you want to delete this post?')) {
        const updatedPosts = posts.filter(p => p.id !== postId);
        localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
        loadPosts(); // Refresh the display
    }
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
    const subtitle = document.getElementById('postSubtitle').value;
    const content = document.getElementById('postContent').value;
    const category = document.getElementById('postCategory').value;
    const hashtagsInput = document.getElementById('postHashtags').value;
    
    // Process hashtags
    const hashtags = hashtagsInput
        .split(' ')
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .filter(tag => tag.length > 1); // Filter out empty tags
    
    const newPost = {
        id: Date.now().toString(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        content: content.trim(),
        category: category,
        hashtags: hashtags,
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
    const categoryFilter = document.querySelector('.filter-select:nth-child(2)').value;
    const posterFilter = document.querySelector('.filter-select:nth-child(3)').value;
    applyFilters(query, categoryFilter, posterFilter);
}

function viewPost(postId) {
    window.location.href = `post.html?id=${postId}`;
}

function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && (currentUser.username === 'adminquang' || currentUser.role === 'mod');
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
    const currentUserId = getCurrentUserId();
    const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const post = posts.find(p => p.id === postId);
    
    // Check if user has permission to delete
    if (!post || (!isAdmin() && currentUserId !== post.author.username)) {
        alert('You do not have permission to delete this post.');
        return;
    }
    
    if (confirm('Are you sure you want to delete this post?')) {
        const updatedPosts = posts.filter(p => p.id !== postId);
        localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
        loadPosts(); // Refresh the display
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

function checkUserPermissions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return { canPost: false, canModerate: false };

    return {
        canPost: true, // All logged-in users can post
        canModerate: currentUser.role === 'admin' || currentUser.role === 'mod'
    };
}

function createPostElement(post) {
    const { canModerate } = checkUserPermissions();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.id = `post-${post.id}`;
    
    // Get user role badge
    const roleBadge = getRoleBadge(post.authorRole);
    
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-info">
                <span class="post-author">${post.author}</span>
                ${roleBadge}
                <span class="post-date">${new Date(post.timestamp).toLocaleString()}</span>
            </div>
            ${(canModerate || currentUser?.username === post.author) ? `
                <button class="delete-post-btn" onclick="deletePost('${post.id}')">
                    <span class="delete-icon">🗑️</span>
                </button>
            ` : ''}
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-actions">
            <button onclick="toggleComments('${post.id}')" class="comment-toggle-btn">
                Comments (${post.comments?.length || 0})
            </button>
        </div>
        <div class="comments-section" id="comments-${post.id}" style="display: none;">
            <div class="comments-container" id="comments-container-${post.id}">
                ${createCommentsHTML(post.comments || [])}
            </div>
            <div class="add-comment">
                <textarea class="comment-input" placeholder="Write a comment..."></textarea>
                <button onclick="addComment('${post.id}')" class="add-comment-btn">Add Comment</button>
            </div>
        </div>
    `;
    
    return postElement;
}

function getRoleBadge(role) {
    const badges = {
        'admin': '<span class="role-badge admin-badge">Admin</span>',
        'mod': '<span class="role-badge mod-badge">Moderator</span>',
        'teacher': '<span class="role-badge teacher-badge">Teacher</span>',
        'student': '<span class="role-badge student-badge">Student</span>'
    };
    return badges[role] || '';
}

function createCommentElement(comment) {
    const { canModerate } = checkUserPermissions();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.id = `comment-${comment.id}`;
    
    // Get user role badge
    const roleBadge = getRoleBadge(comment.authorRole);
    
    commentElement.innerHTML = `
        <div class="comment-header">
            <div class="comment-info">
                <span class="comment-author">${comment.author}</span>
                ${roleBadge}
                <span class="comment-date">${new Date(comment.timestamp).toLocaleString()}</span>
            </div>
            ${(canModerate || currentUser?.username === comment.author) ? `
                <button class="delete-comment-btn" onclick="deleteComment('${comment.postId}', '${comment.id}')">
                    <span class="delete-icon">🗑️</span>
                </button>
            ` : ''}
        </div>
        <div class="comment-content">${comment.content}</div>
    `;
    
    return commentElement;
}

async function deletePost(event, postId) {
    event.stopPropagation(); // Prevent post click event from triggering
    
    if (confirm('Are you sure you want to delete this post?')) {
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any authentication headers your API requires
                }
            });

            if (response.ok) {
                // Remove the post from the UI
                const postElement = event.target.closest('.post-card');
                postElement.remove();
            } else {
                throw new Error('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        }
    }
}

// Add these functions to handle filtering
function filterByTag(category) {
    const searchQuery = document.querySelector('.search-bar').value;
    const posterFilter = document.querySelector('.filter-select:nth-child(3)').value;
    applyFilters(searchQuery, category, posterFilter);
}

function filterByPoster(posterType) {
    const searchQuery = document.querySelector('.search-bar').value;
    const categoryFilter = document.querySelector('.filter-select:nth-child(2)').value;
    applyFilters(searchQuery, categoryFilter, posterType);
}

function searchPosts(query) {
    const categoryFilter = document.querySelector('.filter-select:nth-child(2)').value;
    const posterFilter = document.querySelector('.filter-select:nth-child(3)').value;
    applyFilters(query, categoryFilter, posterFilter);
}

function clearFilters() {
    // Clear all filter inputs
    document.querySelector('.search-bar').value = '';
    document.querySelectorAll('.filter-select').forEach(select => {
        select.value = '';
    });
    
    // Reset to show all posts
    applyFilters('', '', '');
}

function applyFilters(searchQuery, category, posterType) {
    let posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Filter by search query
    if (searchQuery) {
        posts = posts.filter(post => 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Filter by category
    if (category) {
        posts = posts.filter(post => post.category === category);
    }

    // Filter by poster type
    if (posterType) {
        switch (posterType) {
            case 'my-posts':
                posts = posts.filter(post => post.author.username === currentUser.username);
                break;
            case 'staff':
                posts = posts.filter(post => 
                    post.author.role === 'admin' || 
                    post.author.role === 'mod'
                );
                break;
            case 'teacher':
                posts = posts.filter(post => post.author.role === 'teacher');
                break;
            case 'students':
                posts = posts.filter(post => post.author.role === 'student');
                break;
        }
    }

    // Display filtered posts
    displayFilteredPosts(posts);
}

function displayFilteredPosts(posts) {
    const postsList = document.getElementById('postsList');
    postsList.innerHTML = '';

    if (posts.length === 0) {
        postsList.innerHTML = `
            <div class="no-posts-message" style="text-align: center; padding: 2rem; color: #8b949e;">
                No posts found matching your filters.
            </div>
        `;
        return;
    }

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';

        const userTagInfo = getUserTag(post.author);
        const currentUserId = getCurrentUserId();
        
        // Truncate content if it's too long
        const maxContentLength = 200;
        const truncatedContent = post.content.length > maxContentLength 
            ? post.content.substring(0, maxContentLength) + '...' 
            : post.content;
        
        const hashtagsHTML = post.hashtags && post.hashtags.length > 0 
            ? `<div class="hashtags-container">
                ${post.hashtags.map(tag => 
                    `<span class="hashtag" onclick="searchByHashtag('${tag}')">${tag}</span>`
                ).join('')}
               </div>`
            : '';
        
        postCard.innerHTML = `
            <div class="post-header">
                <div>
                    <div class="post-meta">
                        <span class="post-author" style="color: ${userTagInfo.color}">${post.authorName}</span>
                        ${userTagInfo.tag}
                        <span class="post-timestamp">${new Date(post.timestamp).toLocaleString()}</span>
                        ${(isAdmin() || currentUserId === post.author.username) ? 
                            `<button class="delete-btn">Delete Post</button>` : 
                            ''}
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    ${post.subtitle ? `<h4 class="post-subtitle">${post.subtitle}</h4>` : ''}
                </div>
            </div>
            <div class="post-preview">${truncatedContent}</div>
            ${hashtagsHTML}
            <div class="post-footer">
                <span class="comment-count">${post.comments?.length || 0} comments</span>
                <span class="post-category-label">${post.category || ''}</span>
            </div>
        `;

        // Add click event for the entire post card
        postCard.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                viewPost(post.id);
            }
        });

        // Add separate click handler for delete button
        const deleteBtn = postCard.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeletePost(post.id);
            });
        }
        
        postsList.appendChild(postCard);
    });
}

// Add function to search by hashtag
function searchByHashtag(hashtag) {
    event.stopPropagation(); // Prevent post card click
    
    // Clear other filters
    document.querySelector('.search-bar').value = '';
    document.querySelectorAll('.filter-select').forEach(select => {
        select.value = '';
    });
    
    // Filter posts by hashtag
    let posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const filteredPosts = posts.filter(post => 
        post.hashtags && post.hashtags.includes(hashtag)
    );
    
    displayFilteredPosts(filteredPosts);
} 