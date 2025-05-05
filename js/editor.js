import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { showConfirmation } from './ui.js';
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

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

const blogForm = document.getElementById('blog-form');
const logoutBtn = document.getElementById('logout-btn');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
let currentUser = null;
let editMode = false;
let currentBlogId = null;



const supabaseUrl = "https://ekqrfblxohhiegedsvjo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcXJmYmx4b2hoaWVnZWRzdmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMTcyODUsImV4cCI6MjA2MDg5MzI4NX0.blg6ZN-lBgu0CnwhqoA3OdPsfeGtckp2gEBrv09ofAU";
const supabase = createClient(supabaseUrl, supabaseKey);


onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/auth/sign-in.html';
    } else {
        currentUser = user;
        checkEditMode();
    }
});

function checkEditMode() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        editMode = true;
        currentBlogId = hash;
        loadBlogForEditing(hash);
    }
}

async function loadBlogForEditing(blogId) {
    try {
        const docRef = doc(blogCollectionRef, blogId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const blogData = docSnap.data();
            document.getElementById('title').value = blogData.title;
            document.getElementById('description').value = blogData.description;
            document.getElementById('author').value = blogData.author;
            
            if (blogData.imgLink) {
                imagePreview.innerHTML = `<img src="${blogData.imgLink}" alt="Preview" style="max-width: 200px;">`;
            }
        }
    } catch (error) {
        console.error("Error loading blog for editing:", error);
    }
}

imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px;">`;
    };
    reader.readAsDataURL(file);
});

blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const author = document.getElementById('author').value;
    const file = imageInput.files[0];
    
    try {
        let imgUrl = '';
        
        if (file) {
            const fileName = `${currentUser.uid}-${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
                .from('blogs')
                .upload(`public/${fileName}`, file);
            
            if (error) throw error;
            imgUrl = `${supabaseUrl}/storage/v1/object/public/${data.fullPath}`;
        }
        
        const blogData = {
            title,
            description,
            author,
            authorId: currentUser.uid,
            publishedAt: new Date().toISOString(),
            ...(imgUrl && { imgLink: imgUrl })
        };
        
        if (editMode) {
            const docRef = doc(blogCollectionRef, currentBlogId);
            await updateDoc(docRef, blogData);
            alert('Blog updated successfully!');
        } else {
            await addDoc(blogCollectionRef, blogData);
            alert('Blog created successfully!');
        }
        
        window.location.href = '/';
    } catch (error) {
        console.error("Error saving blog:", error);
        alert('Failed to save blog. Please try again.');
    }
});

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