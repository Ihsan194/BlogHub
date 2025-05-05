import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getAuth,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { showConfirmation } from './ui.js';

const firebaseConfig = {
    apiKey: "AIzaSyAPj4q8YQEZqLiD1wQ6o89rrlG1wfKwK0k",
    authDomain: "blogging-website-28.firebaseapp.com",
    projectId: "blogging-website-28",
    storageBucket: "blogging-website-28.appspot.com",
    messagingSenderId: "954301775210",
    appId: "1:954301775210:web:27361c6b3baed47923b913",
    measurementId: "G-8LE7H1H0H2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const blogCollectionRef = collection(db, "BlogsWeb");

const authNav = document.getElementById('auth-nav');
const contentArea = document.getElementById('content-area');
const modal = document.getElementById('confirmation-modal');
const modalMessage = document.getElementById('modal-message');
const confirmBtn = document.getElementById('confirm-action');
const cancelBtn = document.getElementById('cancel-action');

function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        updateUI(user);
        if (user) {
            fetchAllBlogs();
        } else {
            showWelcomeMessage();
        }
    });
}

function updateUI(user) {
    if (user) {
        authNav.innerHTML = `
            <button class="blog-btn" id="create-blog-btn">Create Blog</button>
            <button class="blog-btn" id="my-blogs-btn">My Blogs</button>
            <button class="blog-btn" id="all-blogs-btn">All Blogs</button>
            <button class="logout-btn" id="logout-btn">Logout</button>
        `;

        document.getElementById('create-blog-btn').addEventListener('click', () => {
            window.location.href = '/blogs/editor.html';
        });

        document.getElementById('my-blogs-btn').addEventListener('click', () => {
            fetchUserBlogs(user.uid);
        });

        document.getElementById('all-blogs-btn').addEventListener('click', fetchAllBlogs);

        document.getElementById('logout-btn').addEventListener('click', () => {
            showConfirmation('Are you sure you want to logout?', logout);
        });
    } else {
        authNav.innerHTML = `
            <button class="auth-btn" id="signin-btn">Sign In</button>
            <button class="auth-btn" id="signup-btn">Sign Up</button>
        `;

        document.getElementById('signin-btn')?.addEventListener('click', () => {
            window.location.href = '/auth/sign-in.html';
        });

        document.getElementById('signup-btn')?.addEventListener('click', () => {
            window.location.href = '/auth/sign-up.html';
        });
    }
}

async function showWelcomeMessage() {
    try {
        const querySnapshot = await getDocs(blogCollectionRef);
        const blogs = [];
        querySnapshot.forEach((doc) => {
            blogs.push({ id: doc.id, ...doc.data() });
        });
        displayBlogs(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        contentArea.innerHTML = `<p>Error loading blogs. Please try again later.</p>`;
    }
}

async function fetchAllBlogs() {
    try {
        const querySnapshot = await getDocs(blogCollectionRef);
        const blogs = [];
        querySnapshot.forEach((doc) => {
            blogs.push({ id: doc.id, ...doc.data() });
        });
        displayBlogs(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        contentArea.innerHTML = `<p>Error loading blogs. Please try again later.</p>`;
    }
}

async function fetchUserBlogs(userId) {
    try {
        const q = query(blogCollectionRef, where("authorId", "==", userId));
        const querySnapshot = await getDocs(q);
        const blogs = [];
        querySnapshot.forEach((doc) => {
            blogs.push({ id: doc.id, ...doc.data() });
        });
        displayBlogs(blogs);
    } catch (error) {
        console.error("Error fetching user blogs:", error);
        contentArea.innerHTML = `<p>Error loading your blogs. Please try again later.</p>`;
    }
}

function displayBlogs(blogs) {
    if (blogs.length === 0) {
        contentArea.innerHTML = '<p>No blogs found.</p>';
        return;
    }

    contentArea.innerHTML = blogs.map(blog => `
        <div class="card" data-id="${blog.id}">
            <img src="${blog.imgLink || 'https://via.placeholder.com/300'}" alt="${blog.title}">
            <h2>${blog.title}</h2>
            <p>${blog.description.slice(0, 100)}${blog.description.length > 100 ? '...' : ''}</p>
            <p>By: ${blog.author}</p>
            <p>Published: ${new Date(blog.publishedAt).toLocaleDateString()}</p>
            <a href="/blogs/detail.html#${blog.id}">Read More</a>
            ${blog.authorId === auth.currentUser?.uid ? `
                <button class="delete-btn" data-id="${blog.id}">Delete</button>
                <a href="/blogs/editor.html#${blog.id}" class="edit-btn">Edit</a>
            ` : ''}
        </div>
    `).join('');

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const blogId = e.target.getAttribute('data-id');
            showConfirmation('Are you sure you want to delete this blog?', () => {
                deleteBlog(blogId);
            });
        });
    });
}

async function deleteBlog(blogId) {
    try {
        await deleteDoc(doc(blogCollectionRef, blogId));
        fetchAllBlogs(); // Refresh the list
    } catch (error) {
        console.error("Error deleting blog:", error);
        alert('Failed to delete blog. Please try again.');
    }
}

async function logout() {
    try {
        await signOut(auth);
        window.location.href = '/';
    } catch (error) {
        console.error("Logout error:", error);
        alert('Failed to logout. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});

export { auth, db, showConfirmation };