// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

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
const analytics = getAnalytics(app);
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

// State management
let otpSent = false;
let pendingUserData = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    const submitBtn = document.getElementById('submitBtn');
    const otpBox = document.getElementById('otpBox');
    const googleBtn = document.querySelector('.google-btn');

    // Handle Google Sign-In
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            googleBtn.disabled = true;
            googleBtn.textContent = 'Connecting...';
            
            try {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                
                // Get role (default member if not selected)
                let role = document.getElementById('role').value;
                if (!role) role = 'member';
                
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
                
                if (data.success) {
                    // Store user data
                    const userData = {
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName,
                        role: role
                    };
                    localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));
                    localStorage.setItem("isLoggedIn", "true");
                    
                    alert(`✅ Welcome ${user.displayName}!`);
                    
                    if (role === 'founder') {
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
                googleBtn.textContent = 'Continue with Google';
            }
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

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

        if (!/^[0-9]{10,15}$/.test(phone)) {
            alert("Enter valid WhatsApp number with country code (e.g. 919876543210)");
            return;
        }

        if (!otpSent) {
            // Step 1: Create user and send verification email
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending OTP...";

            try {
                // Create user with Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Store user data for later use
                pendingUserData = { name, email, phone, role, user };

                // Send verification email
                await sendEmailVerification(user);
                
                otpSent = true;
                
                // Show OTP box
                otpBox.style.display = "block";
                
                // Update button text
                submitBtn.textContent = "Verify & Create Account";
                submitBtn.disabled = false;
                
                alert("✅ Verification link sent to your email! Please check your inbox and spam folder.");
                
            } catch (error) {
                const errorCode = error.code;
                let errorText = 'Registration failed. Please try again.';
                
                if (errorCode === 'auth/email-already-in-use') {
                    errorText = '❌ Email already in use.';
                } else if (errorCode === 'auth/weak-password') {
                    errorText = '❌ Password should be at least 6 characters.';
                } else if (errorCode === 'auth/invalid-email') {
                    errorText = '❌ Invalid email address.';
                }
                
                alert(errorText);
                submitBtn.disabled = false;
                submitBtn.textContent = "Continue";
            }
        } else {
            // Step 2: Verify email and complete registration
            submitBtn.disabled = true;
            submitBtn.textContent = "Verifying...";

            try {
                // Reload user to get updated emailVerified status
                // await auth.currentUser.reload();
                
                // We trust the link clicked, but here we can force a check if desired
                await pendingUserData.user.reload();

                if (pendingUserData.user.emailVerified) {
                    // Email verified successfully
                    
                    // Prepare user data for backend (optional)
                    const userData = {
                        name: pendingUserData.name,
                        email: pendingUserData.email,
                        phone: pendingUserData.phone,
                        role: pendingUserData.role,
                        uid: pendingUserData.user.uid
                    };

                    // Store user data in localStorage for future sessions
                    localStorage.setItem(`user_${userData.uid}`, JSON.stringify(userData));
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("loggedInUser", JSON.stringify(userData));


                    // Optional: Make API call to your backend to save user data
                    try {
                        const response = await fetch('http://localhost:5000/api/auth/register-firebase', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                uid: userData.uid,
                                name: userData.name,
                                email: userData.email,
                                phone: userData.phone,
                                role: userData.role,
                                provider: 'firebase'
                            })
                        });
                        
                        if (!response.ok) {
                            console.error('Backend sync failed:', await response.text());
                        }
                    } catch (err) {
                        console.error('Backend sync error:', err);
                    }

                    alert("✅ Account created successfully!");
                    
                    // Redirect based on role
                    if (pendingUserData.role === 'founder') {
                        window.location.href = 'founder-dashboard.html';
                    } else if (pendingUserData.role === 'member') {
                        window.location.href = 'member-dashboard.html';
                    }
                } else {
                    alert("❌ Email not verified yet. Please check your email and click the verification link, then try again.");
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Verify & Create Account";
                }
            } catch (error) {
                console.error("Verification error:", error);
                alert("❌ Verification failed. Please try again.");
                submitBtn.disabled = false;
                submitBtn.textContent = "Verify & Create Account";
            }
        }
    });
});