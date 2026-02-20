// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

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
const googleProvider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const googleBtn = document.querySelector('.google-btn');

    // Google OAuth login
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            googleBtn.disabled = true;
            googleBtn.textContent = 'Connecting...';
            
            try {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                
                // Fetch user data from backend
                const response = await fetch('http://localhost:5000/api/auth/register-firebase', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName,
                        provider: 'google'
                    })
                });

                const data = await response.json();
                
                if (response.ok) {
                    const userData = {
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName,
                        role: data.data.role // Use role from backend
                    };
                    
                    localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));
                    localStorage.setItem("isLoggedIn", "true");
                    
                    alert(`✅ Welcome back, ${userData.name}!`);
                    
                    if (userData.role === 'founder') window.location.href = "founder-dashboard.html";
                    else window.location.href = "member-dashboard.html";
                } else {
                    throw new Error(data.message || 'Login failed');
                }
            } catch (error) {
                console.error("Google Login Error:", error);
                alert(`❌ Login Failed: ${error.message}`);
                googleBtn.disabled = false;
                googleBtn.innerHTML = '<img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google"> Login with Google';
            }
        });
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        // Validation
        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }

        // Disable submit button during login
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";

        try {
            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if email is verified
            if (!user.emailVerified) {
                alert("❌ Please verify your email before logging in. Check your inbox.");
                await auth.signOut();
                submitBtn.disabled = false;
                submitBtn.textContent = "Login Now";
                return;
            }

            // Sync/Fetch user from backend to get correct role
            try {
                const response = await fetch('http://localhost:5000/api/auth/register-firebase', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName || email.split('@')[0],
                        provider: 'firebase'
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    console.log('Backend response:', data); // DEBUG
                    
                    // Ensure data structure is valid
                    if (!data.data || !data.data.role) {
                        console.error('Missing role in backend response', data);
                        throw new Error("User role not found in server response");
                    }
                    
                    const userData = {
                        uid: user.uid,
                        email: user.email,
                        name: data.data.name || user.displayName,
                        role: data.data.role // CRITICAL: Get role from backend
                    };
                    
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("loggedInUser", JSON.stringify(userData));
                    localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));

                    alert(`✅ Welcome back, ${userData.name}!`);
                    
                    if (userData.role === 'founder') {
                        window.location.replace("founder-dashboard.html");
                    } else {
                        window.location.replace("member-dashboard.html");
                    }
                } else {
                     throw new Error("Could not retrieve user profile");
                }
            } catch (backendError) {
                console.error("Backend fetch error:", backendError);
                // Fallback only if backend is down
                alert("Login successful but could not load profile. Using default member view.\nError: " + backendError.message);
                // improving debugging by not auto-redirecting if there's an error,
                // or at least logging it visibly
                window.location.replace("member-dashboard.html");
            }

        } catch (error) {
            console.error("Firebase login error:", error);
            let errorText = "Login failed. Please try again.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                errorText = "❌ Invalid email or password.";
            } else if (error.code === 'auth/user-not-found') {
                errorText = "❌ No account found with this email.";
            }
            alert(errorText);
            submitBtn.disabled = false;
            submitBtn.textContent = "Login Now";
        }
    });
});
