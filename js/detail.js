import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
    getFirestore,
    doc,
    getDoc,
    deleteDoc,
    collection
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

const blogContent = document.getElementById('blog-content');
const actionButtons = document.getElementById('action-buttons');
const logoutBtn = document.getElementById('logout-btn');
let currentUser = null;
let currentBlogId = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (!user) {
        window.location.href = '/auth/sign-in.html';
    } else {
        loadBlog();
    }
});

async function loadBlog() {
    currentBlogId = window.location.hash.substring(1);
    if (!currentBlogId) {
        blogContent.innerHTML = '<p class="error">No blog specified.</p>';
        return;
    }

    try {
        const docRef = doc(blogCollectionRef, currentBlogId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const blogData = docSnap.data();
            renderBlog(blogData);
            
            if (currentUser && blogData.authorId === currentUser.uid) {
                actionButtons.innerHTML = `
                    <a href="/blogs/editor.html#${currentBlogId}" class="blog-btn">Edit</a>
                    <button class="logout-btn" id="delete-btn">Delete</button>
                `;
                
                document.getElementById('delete-btn').addEventListener('click', () => {
                    showConfirmation('Are you sure you want to delete this blog?', deleteBlog);
                });
            }
        } else {
            blogContent.innerHTML = '<p class="error">Blog not found.</p>';
        }
    } catch (error) {
        console.error("Error loading blog:", error);
        blogContent.innerHTML = '<p class="error">Failed to load blog. Please try again later.</p>';
    }
}

function renderBlog(blogData) {
    blogContent.innerHTML = `
        <h1>${blogData.title}</h1>
        ${blogData.imgLink ? `<img src="${blogData.imgLink}" alt="${blogData.title}" class="blog-image">` : ''}
        <div class="blog-meta">
            <span class="author">By ${blogData.author}</span>
            <span class="date">Published: ${new Date(blogData.publishedAt).toLocaleDateString()}</span>
        </div>
        <div class="blog-body">
            ${blogData.description.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
        </div>
    `;
}

async function deleteBlog() {
    try {
        await deleteDoc(doc(blogCollectionRef, currentBlogId));
        alert('Blog deleted successfully!');
        window.location.href = '/';
    } catch (error) {
        console.error("Error deleting blog:", error);
        alert('Failed to delete blog. Please try again.');
    }
}

logoutBtn.addEventListener('click', () => {
    showConfirmation('Are you sure you want to logout?', async () => {
        try {
            await signOut(auth);
            window.location.href = '/';
        } catch (error) {
            console.error("Logout error:", error);
        }
    });
});