// Shared logout functionality
// Firebase is loaded from external CDN via script tags (see login.html)

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
            // Try to sign out from Firebase if available
            if (typeof firebase !== 'undefined' && firebase.auth) {
                try {
                    await firebase.auth().signOut();
                } catch (firebaseError) {
                    console.warn("Firebase signout error (non-fatal):", firebaseError);
                }
            }
            
            // Clear ALL localStorage data comprehensively
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("founderProfile");
            localStorage.removeItem("startup");
            localStorage.removeItem("requests");
            localStorage.removeItem("user");
            localStorage.removeItem("viewMemberId");
            
            // Clear any user-specific data
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith("user_") || key.startsWith("startup_") || key.startsWith("member_")) {
                    localStorage.removeItem(key);
                }
            });
            
            // Also clear sessionStorage
            sessionStorage.clear();
            
            console.log("Logged out successfully - all data cleared");
            
            // Prevent back button from showing cached page
            try {
                window.history.pushState(null, null, window.location.href);
                window.addEventListener('popstate', function(event) {
                    // Redirect back to login if user tries back button
                    window.location.href = './login.html';
                });
            } catch (historyError) {
                console.warn("History manipulation failed:", historyError);
            }
            
            // Redirect to login page with cache busting
            // Use different URLs depending on current page structure
            const currentPath = window.location.pathname;
            let loginPath = './login.html';
            
            // If not in /pages/ directory, try to navigate appropriately
            if (!currentPath.includes('/pages/')) {
                loginPath = 'pages/login.html';
            }
            
            try {
                window.location.href = loginPath + '?logout=' + Date.now();
            } catch (err) {
                console.warn("Location redirect failed, trying fallback:", err);
                try {
                    window.location.replace(loginPath);
                } catch (err2) {
                    console.error("All redirects failed:", err2);
                    // Still clear data even if redirect fails
                }
            }
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
};

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
