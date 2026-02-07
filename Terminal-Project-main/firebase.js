// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    deleteDoc,
    doc,
    query,
    orderBy,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjSYn7bz-ZQp99c-lZTBNfnEQP5jTQ4Vw",
    authDomain: "portfoliobackend-73c33.firebaseapp.com",
    projectId: "portfoliobackend-73c33",
    storageBucket: "portfoliobackend-73c33.firebasestorage.app",
    messagingSenderId: "193996598742",
    appId: "1:193996598742:web:849c5a7003467a7219c877",
    measurementId: "G-2EPZWN3NH0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
    db,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    deleteDoc,
    doc,
    query,
    orderBy,
    updateDoc
};
