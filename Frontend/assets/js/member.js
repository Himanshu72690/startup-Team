function logout() {
    if(confirm("Bhai, logout karna hai?")) {
        localStorage.removeItem("isLoggedIn");
        window.location.href = "../../index.html"; // Aapke login page ka path
    }
}

// Global script to handle profile display can go here