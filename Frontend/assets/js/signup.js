document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("signupForm");
    const otpBox = document.getElementById("otpBox");
    const submitBtn = document.getElementById("submitBtn");

    let generatedOtp = null;
    let otpSent = false;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        // 🔐 Basic Validation
        if (!name || !email || !phone || !password || !role) {
            alert("Please fill all fields.");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters!");
            return;
        }

        if (!/^[0-9]{10,15}$/.test(phone)) {
            alert("Enter valid WhatsApp number with country code (e.g. 919876543210)");
            return;
        }

        // STEP 1: SEND OTP
        if (!otpSent) {

            generatedOtp = Math.floor(100000 + Math.random() * 900000);
            console.log("📩 SYSTEM OTP IS:", generatedOtp);
            alert("Verification code sent! (Check console F12)");

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

        // STEP 3: SAVE USER (WhatsApp ready)
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone, // 🔥 IMPORTANT (WhatsApp use hoga)
            password: password,
            role: role,
            joinedDate: new Date().toLocaleDateString()
        };

        let users = JSON.parse(localStorage.getItem("users")) || [];

        // Email duplicate check
        const exists = users.find(u => u.email === email);
        if (exists) {
            alert("Email already registered!");
            return;
        }

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        alert("✅ Account created successfully!");
        window.location.replace("login.html");
    });

});
