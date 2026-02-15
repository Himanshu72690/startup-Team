document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("signupForm");
    const otpBox = document.getElementById("otpBox");
    const submitBtn = document.getElementById("submitBtn");
    const resendBtn = document.getElementById("resendOtpBtn");
    const resendText = document.getElementById("resendText");
    const timerSpan = document.getElementById("timer");

    let otpSent = false;
    let userEmail = '';
    let resendTimer = null;
    let resendCountdown = 60;

    // API base URL 
    const API_BASE = 'http://localhost:5000/api';

    // Start resend timer
    const startResendTimer = () => {
        resendCountdown = 60;
        resendBtn.disabled = true;
        
        resendTimer = setInterval(() => {
            resendCountdown--;
            timerSpan.textContent = resendCountdown;
            
            if (resendCountdown <= 0) {
                clearInterval(resendTimer);
                resendBtn.disabled = false;
                resendText.innerHTML = 'Resend OTP';
            }
        }, 1000);
    };

    // Send OTP to backend
    const sendRegistrationRequest = async (userData) => {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Registration failed');
            }
            
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    // Verify OTP with backend
    const verifyOTP = async (email, otp) => {
        try {
            const response = await fetch(`${API_BASE}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'OTP verification failed');
            }
            
            return result;
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    };

    // Resend OTP
    const resendOTP = async (email) => {
        try {
            const response = await fetch(`${API_BASE}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to resend OTP');
            }
            
            return result;
        } catch (error) {
            console.error('Resend OTP error:', error);
            throw error;
        }
    };

    // Handle resend button click
    resendBtn.addEventListener("click", async () => {
        if (resendBtn.disabled) return;
        
        resendBtn.disabled = true;
        resendText.innerHTML = 'Sending...';
        
        try {
            await resendOTP(userEmail);
            alert('✅ New OTP sent to your email!');
            startResendTimer();
        } catch (error) {
            alert(`❌ Failed to resend OTP: ${error.message}`);
            resendBtn.disabled = false;
            resendText.innerHTML = 'Resend OTP';
        }
    });

    form.addEventListener("submit", async (e) => {
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
            submitBtn.disabled = true;
            submitBtn.innerText = "Sending OTP...";
            
            try {
                await sendRegistrationRequest({ name, email, phone, password, role });
                
                userEmail = email;
                otpBox.style.display = "block";
                submitBtn.innerText = "Verify & Create Account";
                submitBtn.disabled = false;
                otpSent = true;
                
                // Start resend timer
                startResendTimer();
                
                alert("✅ Verification code sent to your email! Please check your inbox.");
            } catch (error) {
                alert(`❌ Registration failed: ${error.message}`);
                submitBtn.disabled = false;
                submitBtn.innerText = "Continue";
            }
            return;
        }

        // STEP 2: VERIFY OTP
        const userOtp = document.getElementById("otpInput").value.trim();
        
        if (!userOtp || userOtp.length !== 6) {
            alert("❌ Please enter a valid 6-digit OTP!");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Verifying...";

        try {
            const result = await verifyOTP(userEmail, userOtp);
            
            // Clear timer
            if (resendTimer) {
                clearInterval(resendTimer);
            }
            
            alert("✅ Account created successfully!");
            window.location.replace("login.html");
        } catch (error) {
            alert(`❌ Verification failed: ${error.message}`);
            submitBtn.disabled = false;
            submitBtn.innerText = "Verify & Create Account";
        }
    });

});
