document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    const otpBox = document.getElementById("otpBox");
    const submitBtn = document.getElementById("submitBtn");
    
    let generatedOtp = null;
    let otpSent = false;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        // STEP 1: SEND OTP
        if (!otpSent) {
            if (password.length < 8) {
                alert("Password must be at least 8 characters!");
                return;
            }

            // Generate Demo OTP
            generatedOtp = Math.floor(100000 + Math.random() * 900000);
            console.log("📩 SYSTEM OTP IS:", generatedOtp);
            alert("Verification code sent! (Check your console F12)");

            // UI Changes
            otpBox.style.display = "block";
            submitBtn.innerText = "Verify & Create Account";
            otpSent = true;
            return;
        }

        // STEP 2: VERIFY OTP
        const userOtp = document.getElementById("otpInput").value;
        if (parseInt(userOtp) !== generatedOtp) {
            alert("❌ Invalid OTP! Please try again.");
            return;
        }

        // STEP 3: FINAL SIGNUP & SAVE
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            role: role,
            joinedDate: new Date().toLocaleDateString()
        };

        // Save to LocalStorage
        let users = JSON.parse(localStorage.getItem("users")) || [];
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        alert("✅ Welcome to StartupTeam! Account created.");
        window.location.href = "login.html";
    });
});