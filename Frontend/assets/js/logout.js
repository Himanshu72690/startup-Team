// Shared logout functionality with Firebase support
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzHlKKF_1h2SR9AweAn9QDo5918o_l8Gg",
    authDomain: "startup-team-86ecf.firebaseapp.com",
    projectId: "startup-team-86ecf",
    storageBucket: "startup-team-86ecf.firebasestorage.app",
    messagingSenderId: "1013114845391",
    appId: "1:1013114845391:web:7130c2d253dd35110cdfba",
    measurementId: "G-KFSH747WBE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Global logout function
window.logoutUser = async function() {
    if (confirm("Are you sure you want to logout?")) {
        try {
            // Sign out from Firebase
            await signOut(auth);
            
            // Clear all localStorage data
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInUser");
            
            // Clear any user-specific data
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith("user_")) {
                    localStorage.removeItem(key);
                }
            });
            
            console.log("Logged out successfully");
            
            // Redirect to login page
            window.location.replace("login.html");
        } catch (error) {
            console.error("Logout error:", error);
            alert("Error logging out. Please try again.");
        }
    }
}
