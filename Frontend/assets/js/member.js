// MEMBER AUTH GUARD
const user = JSON.parse(localStorage.getItem("loggedInUser"));
if(!user || user.role !== "member"){
    // If not logged in or wrong role, redirect immediately
    window.location.replace("login.html");
}

// BFCache / Back Button Protection
window.addEventListener('pageshow', function(event) {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        // Page was loaded from back/forward cache, re-run auth check
        const userCheck = JSON.parse(localStorage.getItem("loggedInUser"));
        if(!userCheck || userCheck.role !== "member"){
             window.location.replace("login.html");
        }
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