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

// Create custom modal styles
const style = document.createElement('style');
style.textContent = `
  .logout-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  
  .logout-modal {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    text-align: center;
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .logout-modal-icon {
    width: 60px;
    height: 60px;
    background: #fee2e2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 32px;
  }
  
  .logout-modal h3 {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 10px;
  }
  
  .logout-modal p {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 30px;
    line-height: 1.5;
  }
  
  .logout-modal-buttons {
    display: flex;
    gap: 12px;
  }
  
  .logout-modal-btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .logout-btn-cancel {
    background: #f1f5f9;
    color: #64748b;
  }
  
  .logout-btn-cancel:hover {
    background: #e2e8f0;
  }
  
  .logout-btn-confirm {
    background: #ef4444;
    color: white;
  }
  
  .logout-btn-confirm:hover {
    background: #dc2626;
  }
`;
document.head.appendChild(style);

// Global logout function
window.logoutUser = async function() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'logout-modal-overlay';
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'logout-modal';
    modal.innerHTML = `
        <div class="logout-modal-icon">👋</div>
        <h3>Confirm Logout</h3>
        <p>Are you sure you want to logout? You'll need to login again to access your account.</p>
        <div class="logout-modal-buttons">
            <button class="logout-modal-btn logout-btn-cancel" id="cancelLogout">Cancel</button>
            <button class="logout-modal-btn logout-btn-confirm" id="confirmLogout">Logout</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Handle cancel button
    document.getElementById('cancelLogout').addEventListener('click', function() {
        overlay.remove();
    });
    
    // Handle confirm button
    document.getElementById('confirmLogout').addEventListener('click', async function() {
        try {
            // Sign out from Firebase
            await signOut(auth);
            
            // Clear all localStorage data
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("token");
            localStorage.removeItem("founderProfile");
            
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
            // Create error modal
            const errorOverlay = document.createElement('div');
            errorOverlay.className = 'logout-modal-overlay';
            const errorModal = document.createElement('div');
            errorModal.className = 'logout-modal';
            errorModal.innerHTML = `
                <div class="logout-modal-icon" style="background: #fee2e2; color: #ef4444;">⚠️</div>
                <h3>Logout Error</h3>
                <p>An error occurred while logging out. Please try again.</p>
                <div class="logout-modal-buttons">
                    <button class="logout-modal-btn logout-btn-confirm" id="closeError" style="background: #6366f1;">Close</button>
                </div>
            `;
            errorOverlay.appendChild(errorModal);
            document.body.appendChild(errorOverlay);
            document.getElementById('closeError').addEventListener('click', function() {
                errorOverlay.remove();
            });
        }
    });
}
