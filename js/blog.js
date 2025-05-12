import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc,
    query,
    where
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
const db = getFirestore(app);
const blogCollectionRef = collection(db, "BlogsWeb");

export async function fetchAllBlogs() {
    try {
        const querySnapshot = await getDocs(blogCollectionRef);
        const blogs = [];
        querySnapshot.forEach((doc) => {
            blogs.push({ id: doc.id, ...doc.data() });
        });
        displayBlogs(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
    }
}

export async function fetchUserBlogs(userId) {
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
    }
}

function displayBlogs(blogs) {
    const contentArea = document.getElementById('content-area');
    if (blogs.length === 0) {
        contentArea.innerHTML = '<p>No blogs found.</p>';
        return;
    }
    
    contentArea.innerHTML = blogs.map(blog => `
  <div class="card">
    <img src="${blog.imgLink || 'https://via.placeholder.com/337x200'}" alt="${blog.title}">
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
        fetchAllBlogs(); 
    } catch (error) {
        console.error("Error deleting blog:", error);
    }
}