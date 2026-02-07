document.addEventListener("DOMContentLoaded", () => {
    const forgotForm = document.getElementById("forgotForm");
    const otpBox = document.getElementById("otpBox");
    const newPassBox = document.getElementById("newPassBox");
    const resetBtn = document.getElementById("resetBtn");

    let generatedOtp = null;
    let step = 1; // 1: Email, 2: OTP, 3: New Password

    forgotForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("resetEmail").value;
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex === -1) {
            alert("❌ Email not found in our records.");
            return;
        }

        if (step === 1) {
            // Step 1: Send OTP
            generatedOtp = Math.floor(100000 + Math.random() * 900000);
            console.log("📩 RESET OTP:", generatedOtp);
            alert("Reset code sent! (Check console)");
            
            otpBox.style.display = "block";
            resetBtn.innerText = "Verify OTP";
            step = 2;
        } 
        else if (step === 2) {
            // Step 2: Verify OTP
            const userOtp = document.getElementById("otpInput").value;
            if (parseInt(userOtp) === generatedOtp) {
                otpBox.style.display = "none";
                newPassBox.style.display = "block";
                resetBtn.innerText = "Update Password";
                step = 3;
            } else {
                alert("❌ Invalid OTP!");
            }
        } 
        else if (step === 3) {
            // Step 3: Update Password in LocalStorage
            const newPass = document.getElementById("newPassword").value;
            if (newPass.length < 8) {
                alert("Password must be 8+ characters");
                return;
            }

            users[userIndex].password = newPass;
            localStorage.setItem("users", JSON.stringify(users));

            alert("✅ Password updated successfully!");
            window.location.href = "login.html";
        }
    });
});