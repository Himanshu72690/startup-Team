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
                        name: data.data.user.name || user.displayName,
                        role: data.data.user.role // Use role from backend
                    };
                    
                    localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("loggedInUser", JSON.stringify(userData));
                    localStorage.setItem("token", data.data.accessToken); // CRITICAL: Save JWT token from backend
                    localStorage.setItem("refreshToken", data.data.refreshToken);
                    
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
                
                const data = await response.json();
                console.log('Backend response status:', response.status);
                console.log('Backend response data:', JSON.stringify(data, null, 2)); // DEBUG - Pretty print
                console.log('Response structure check:');
                console.log('  - data.data exists:', !!data.data);
                console.log('  - data.data.user exists:', !!data.data?.user);
                console.log('  - data.data.user.role:', data.data?.user?.role);
                console.log('  - data.data.accessToken:', !!data.data?.accessToken);
                
                if (response.ok) {
                    // Ensure data structure is valid
                    if (!data.data || !data.data.user || !data.data.user.role) {
                        console.error('Missing user data in backend response', data);
                        console.error('Expected structure: data.data.user.role');
                        console.error('Actual data.data:', data.data);
                        throw new Error("User role not found in server response. Check console for details.");
                    }
                    
                    const userData = {
                        uid: user.uid,
                        email: user.email,
                        name: data.data.user.name || user.displayName,
                        role: data.data.user.role // CRITICAL: Get role from backend
                    };
                    
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("loggedInUser", JSON.stringify(userData));
                    localStorage.setItem("token", data.data.accessToken); // CRITICAL: Save JWT token from backend
                    localStorage.setItem("refreshToken", data.data.refreshToken);
                    localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));

                    console.log("Saved to localStorage:", {
                        loggedInUser: userData,
                        tokenExists: !!data.data.accessToken
                    });

                    alert(`✅ Welcome back, ${userData.name}!`);
                    
                    if (userData.role === 'founder') {
                        window.location.replace("founder-dashboard.html");
                    } else {
                        window.location.replace("member-dashboard.html");
                    }
                } else {
                    // Handle non-200 responses
                    console.error('Backend returned non-OK status:', response.status);
                    console.error('Error response:', data);
                    throw new Error(data.message || "Backend returned an error");
                }
            } catch (backendError) {
                console.error("Backend fetch error:", backendError);
                console.error("Full error object:", backendError);
                console.error("Error stack:", backendError.stack);
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
