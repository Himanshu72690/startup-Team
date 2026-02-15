// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

console.log("Firebase login script loaded!");

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

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        console.log("Login attempt started");
        console.log("Email:", email);
        console.log("Password length:", password.length);

        // Validation
        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }

        // Disable submit button during login
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";

        console.log("About to call Firebase signInWithEmailAndPassword...");

        try {
            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Sign in successful!");
            console.log("User credential:", userCredential);
            const user = userCredential.user;
            console.log("User object:", user);
            console.log("Email verified:", user.emailVerified);

            // Check if email is verified
            if (!user.emailVerified) {
                alert("❌ Please verify your email before logging in. Check your inbox for the verification link.");
                await auth.signOut();
                submitBtn.disabled = false;
                submitBtn.textContent = "Login Now";
                return;
            }

            // Get user data from localStorage or create basic profile
            // In a real app, you'd fetch this from your backend
            let userData = JSON.parse(localStorage.getItem(`user_${user.uid}`)) || {
                uid: user.uid,
                email: user.email,
                name: user.displayName || email.split('@')[0],
                role: null
            };

            // If role is not set, try to get it from backend or prompt user
            if (!userData.role) {
                // Try to fetch from backend
                try {
                    const response = await fetch(`http://localhost:5000/api/auth/user/${user.uid}`);
                    if (response.ok) {
                        const backendData = await response.json();
                        userData = { ...userData, ...backendData };
                    }
                } catch (err) {
                    console.error("Could not fetch user data from backend:", err);
                }
                
                // If still no role, default based on email or ask
                if (!userData.role) {
                    userData.role = "member"; // Default role
                }
            }

            alert(`✅ Welcome back, ${userData.name}!`);

            // Store session
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loggedInUser", JSON.stringify(userData));
            localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));

            // Redirect based on role
            if (userData.role === "founder") {
                window.location.replace("founder-dashboard.html");
            } else {
                window.location.replace("member-dashboard.html");
            }

        } catch (error) {
            const errorCode = error.code;
            console.error("Firebase login error:", error);
            console.error("Error code:", errorCode);
            console.error("Error message:", error.message);
            
            let errorText = "Login failed. Please try again.";

            if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password') {
                errorText = "❌ Invalid email or password.";
            } else if (errorCode === 'auth/user-not-found') {
                errorText = "❌ No account found with this email.";
            } else if (errorCode === 'auth/invalid-email') {
                errorText = "❌ Invalid email address.";
            } else if (errorCode === 'auth/too-many-requests') {
                errorText = "❌ Too many failed attempts. Please try again later.";
            } else {
                errorText = `❌ ${error.message}`;
            }

            alert(errorText);
            submitBtn.disabled = false;
            submitBtn.textContent = "Login Now";
        }
    });

});
