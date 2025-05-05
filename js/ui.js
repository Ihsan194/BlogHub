import { fetchAllBlogs, fetchUserBlogs } from './blog.js';

export function updateUI(user) {
    const authNav = document.getElementById('auth-nav');
    const contentArea = document.getElementById('content-area');
    
    if (user) {
        authNav.innerHTML = `
            <button class="blog-btn" id="create-blog-btn">Create Blog</button>
            <button class="blog-btn" id="my-blogs-btn">My Blogs</button>
            <button class="blog-btn" id="all-blogs-btn">All Blogs</button>
            <button class="logout-btn" id="logout-btn">Logout</button>
        `;
        
        fetchAllBlogs();
        
        document.getElementById('create-blog-btn').addEventListener('click', () => {
            window.location.href = '/blogs/editor.html';
        });
        
        document.getElementById('my-blogs-btn').addEventListener('click', () => {
            fetchUserBlogs(user.uid);
        });
        
        document.getElementById('all-blogs-btn').addEventListener('click', () => {
            fetchAllBlogs();
        });
    } else {
        authNav.innerHTML = `
            <button class="auth-btn" id="signin-btn">Sign In</button>
            <button class="auth-btn" id="signup-btn">Sign Up</button>
        `;
        
        contentArea.innerHTML = `
            <div class="welcome-message">
                <h2>Welcome to our Blogging Platform</h2>
                <p>Please sign in or sign up to create and manage your blogs.</p>
            </div>
        `;
        
        document.getElementById('signin-btn')?.addEventListener('click', () => {
            window.location.href = '/auth/sign-in.html';
        });
        
        document.getElementById('signup-btn')?.addEventListener('click', () => {
            window.location.href = '/auth/sign-up.html';
        });
    }
}

export function showConfirmation(message, confirmCallback) {
    const modal = document.getElementById('confirmation-modal');
    const modalMessage = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('confirm-action');
    
    modalMessage.textContent = message;
    modal.style.display = 'flex';
    
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        confirmCallback();
        modal.style.display = 'none';
    });
}