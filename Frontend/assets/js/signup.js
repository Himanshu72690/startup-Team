// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

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
    const form = document.getElementById('signupForm');
    const submitBtn = document.getElementById('submitBtn');
    const googleBtn = document.querySelector('.google-btn');

    // Handle Google Sign-In
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            // Check if role is selected
            let role = document.getElementById('role').value;
            if (!role) {
                alert("Please select whether you are a Founder or Member first!");
                document.getElementById('role').focus();
                return;
            }

            googleBtn.disabled = true;
            googleBtn.textContent = 'Connecting...';
            
            try {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                
                // Double check role value just in case
                role = document.getElementById('role').value || 'member';
                
                // Backend sync
                const response = await fetch('http://localhost:5000/api/auth/register-firebase', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName,
                        role: role,
                        provider: 'google'
                    })
                });

                const data = await response.json();
                
                // We consider it a success if the backend returns success OR if it says user already exists
                if (response.ok) {
                    // Store user data
                    const finalRole = data.data && data.data.role ? data.data.role : role;
                    
                    const userData = {
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName,
                        role: finalRole
                    };
                    localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));
                    localStorage.setItem("isLoggedIn", "true");
                    
                    alert(`✅ Welcome ${user.displayName}!`);
                    
                    if (finalRole === 'founder') {
                        window.location.href = 'founder-dashboard.html';
                    } else {
                        window.location.href = 'member-dashboard.html';
                    }
                } else {
                    throw new Error(data.message || 'Registration failed');
                }
                
            } catch (error) {
                console.error("Google verify error:", error);
                alert(`❌ Login failed: ${error.message}`);
                googleBtn.disabled = false;
                googleBtn.innerHTML = '<img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google"> Continue with Google';
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            // Get inputs
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            // Validation
            if (!name || !email || !phone || !password || !role) {
                alert("Please fill in all fields");
                return;
            }

            if (password.length < 8) {
                alert("Password must be at least 8 characters!");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "Creating Account...";

            try {
                // Create user with Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Send verification email
                await sendEmailVerification(user);
                
                // Sync with Backend immediately
                try {
                    const response = await fetch('http://localhost:5000/api/auth/register-firebase', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: user.uid,
                            name: name,
                            email: email,
                            phone: phone,
                            role: role,
                            provider: 'firebase'
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Server setup failed');
                    }
                } catch (err) {
                    console.error('Backend sync error:', err);
                    alert(`⚠️ Account created in Firebase, but server sync failed: ${err.message}.\nYour account might default to MEMBER role on login.`);
                }

                alert(`✅ Account created successfully!\n\nA verification link has been sent to ${email}.\nCheck your inbox, verify, and then LOGIN.`);
                
                // Redirect to Login Page
                window.location.href = 'login.html';
                
            } catch (error) {
                console.error("Signup error:", error);
                let errorText = 'Registration failed. Please try again.';
                
                if (error.code === 'auth/email-already-in-use') {
                    errorText = '❌ Email already in use. Please try logging in.';
                } else if (error.code === 'auth/weak-password') {
                    errorText = '❌ Password should be at least 8 characters.';
                } else if (error.code === 'auth/invalid-email') {
                    errorText = '❌ Invalid email address.';
                }
                
                alert(errorText);
                submitBtn.disabled = false;
                submitBtn.textContent = "Continue";
            }
        });
    } else {
        console.error("Signup form not found!");
    }
});
