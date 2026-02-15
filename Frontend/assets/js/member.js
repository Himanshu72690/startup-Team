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