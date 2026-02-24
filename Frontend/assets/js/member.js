// COMPREHENSIVE AUTH GUARD FOR MEMBER PAGES
function validateMemberAuth() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const token = localStorage.getItem("token");
  
  // Check if user exists and is a member
  if (!user || user.role !== "member" || !token) {
    console.warn("Auth validation failed - redirecting to login");
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("login.html?redirect=member-dashboard");
    return false;
  }
  return true;
}

// Immediate validation on page load
if (!validateMemberAuth()) {
  throw new Error("Not authenticated as member");
}

// Listen for storage changes (logout from another tab)
window.addEventListener('storage', function(event) {
  if (event.key === 'loggedInUser' && event.newValue === null) {
    console.warn("Logout detected from another tab");
    window.location.replace("login.html?redirect=member-dashboard");
  }
});

// BFCache / Back Button Protection with popstate
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    // Page was restored from back-forward cache
    if (!validateMemberAuth()) {
      window.location.replace("login.html?redirect=member-dashboard");
    }
  }
});

// Prevent going back to this page after logout
window.addEventListener('pagehide', function(event) {
  // Push a new history entry to prevent back navigation
  window.history.pushState(null, null, window.location.href);
});

window.addEventListener('popstate', function(event) {
  // If user tries to go back, check auth
  if (!validateMemberAuth()) {
    window.history.forward();
  }
});

function logout() {
    if (window.logoutUser) {
        window.logoutUser();
    } else {
        // Fallback if logout.js not loaded
        if(confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        }
    }
}

// Global script to handle profile display can go here