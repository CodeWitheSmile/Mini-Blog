document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    function renderSignup() {
        app.innerHTML = `
            <h2>Signup</h2>
            <input type="text" id="signup-username" placeholder="Username">
            <input type="password" id="signup-password" placeholder="Password">
            <button id="signup-btn">Signup</button>
            <p>Already have an account? <a href="#" id="goto-login">Login here</a></p>
        `;
        document.getElementById('signup-btn').addEventListener('click', handleSignup);
        document.getElementById('goto-login').addEventListener('click', renderLogin);
    }

    function renderLogin() {
        app.innerHTML = `
            <h2>Login</h2>
            <input type="text" id="login-username" placeholder="Username">
            <input type="password" id="login-password" placeholder="Password">
            <button id="login-btn">Login</button>
            <p>Don't have an account? <a href="#" id="goto-signup">Signup here</a></p>
        `;
        document.getElementById('login-btn').addEventListener('click', handleLogin);
        document.getElementById('goto-signup').addEventListener('click', renderSignup);
    }

    function handleSignup() {
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        if (username && password) {
            if (!users.some(user => user.username === username)) {
                users.push({ username, password });
                localStorage.setItem('users', JSON.stringify(users));
                alert('Signup successful!');
                renderLogin();
            } else {
                alert('Username already taken');
            }
        } else {
            alert('Please fill in both fields');
        }
    }

    function handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        if (username && password) {
            const user = users.find(user => user.username === username && user.password === password);
            if (user) {
                loggedInUser = user;
                localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
                alert('Login successful!');
                renderBlogPage();
            } else {
                alert('Invalid credentials');
            }
        } else {
            alert('Please fill in both fields');
        }
    }

    function renderBlogPage() {
        app.innerHTML = `
            <h2>Welcome, ${loggedInUser.username}</h2>
            <button id="logout-btn">Logout</button>
            <h3>Blog Posts</h3>
            <div id="blog-posts"></div>
            <h3>Create a new post</h3>
            <input type="text" id="post-title" placeholder="Title">
            <textarea id="post-content" placeholder="Content"></textarea>
            <button id="create-post-btn">Create Post</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        document.getElementById('create-post-btn').addEventListener('click', createPost);
        loadPosts();
    }

    function handleLogout() {
        loggedInUser = null;
        localStorage.removeItem('loggedInUser');
        renderLogin();
    }

    function loadPosts() {
        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        const blogPostsContainer = document.getElementById('blog-posts');
        blogPostsContainer.innerHTML = '';
        posts.forEach((post, index) => {
            const postDiv = document.createElement('div');
            postDiv.innerHTML = `
                <h4>${post.title}</h4>
                <p>${post.content}</p>
                <button onclick="editPost(${index})">Edit</button>
                <button onclick="deletePost(${index})">Delete</button>
                <div class="replies" id="replies-${index}"></div>
                <input type="text" id="reply-${index}" placeholder="Write a reply...">
                <button onclick="addReply(${index})">Reply</button>
            `;
            blogPostsContainer.appendChild(postDiv);
            loadReplies(index);
        });
    }

    function loadReplies(index) {
        const repliesContainer = document.getElementById(`replies-${index}`);
        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        const post = posts[index];
        if (post.replies) {
            repliesContainer.innerHTML = '';
            post.replies.forEach(reply => {
                const replyDiv = document.createElement('div');
                replyDiv.innerHTML = `
                    <p><strong>${reply.user}:</strong> ${reply.content}</p>
                `;
                repliesContainer.appendChild(replyDiv);
            });
        }
    }

    function createPost() {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        if (title && content) {
            let posts = JSON.parse(localStorage.getItem('posts')) || [];
            posts.push({ title, content, replies: [] });
            localStorage.setItem('posts', JSON.stringify(posts));
            loadPosts();
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
        } else {
            alert('Please fill in both fields');
        }
    }

    window.editPost = function(index) {
        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        const post = posts[index];
        const title = prompt('Edit Title', post.title);
        const content = prompt('Edit Content', post.content);
        if (title && content) {
            posts[index] = { ...post, title, content };
            localStorage.setItem('posts', JSON.stringify(posts));
            loadPosts();
        } else {
            alert('Please fill in both fields');
        }
    }

    window.deletePost = function(index) {
        if (confirm('Are you sure you want to delete this post?')) {
            let posts = JSON.parse(localStorage.getItem('posts')) || [];
            posts.splice(index, 1);
            localStorage.setItem('posts', JSON.stringify(posts));
            loadPosts();
        }
    }

    window.addReply = function(index) {
        const replyInput = document.getElementById(`reply-${index}`).value.trim();
        if (replyInput) {
            let posts = JSON.parse(localStorage.getItem('posts')) || [];
            posts[index].replies = posts[index].replies || [];
            posts[index].replies.push({ user: loggedInUser.username, content: replyInput });
            localStorage.setItem('posts', JSON.stringify(posts));
            loadReplies(index);
            document.getElementById(`reply-${index}`).value = '';
        } else {
            alert('Please enter a reply');
        }
    }

    if (loggedInUser) {
        renderBlogPage();
    } else {
        renderLogin();
    }
});
