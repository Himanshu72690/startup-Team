document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const user = users.find(
            u => u.email === email && u.password === password
        );

        if (user) {

            alert(`Welcome back, ${user.name}!`);

            // 🔥 SESSION FIX
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loggedInUser", JSON.stringify(user));

            // 🔥 CORRECT REDIRECT PATH
            if (user.role === "founder") {
                window.location.replace("../pages/founder-dashboard.html");
            } else {
                window.location.replace("../pages/member-dashboard.html");
            }

        } else {
            alert("❌ Invalid email or password.");
        }

    });

});
