document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        // LocalStorage se users ki list nikalein
        let users = JSON.parse(localStorage.getItem("users")) || [];

        // User ko find karein
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            alert(`Welcome back, ${user.name}!`);
            // Session save karein
            localStorage.setItem("currentUser", JSON.stringify(user));
            
            // Role ke hisaab se redirect karein
            if (user.role === "founder") {
                window.location.href = "founder-dashboard.html";
            } else {
                window.location.href = "member-dashboard.html";
            }
        } else {
            alert("❌ Invalid email or password. Please try again.");
        }
    });
});