document.addEventListener("DOMContentLoaded", () => {

  console.log("🔥 signup.js loaded");

  const form = document.getElementById("signupForm");
  const otpBox = document.getElementById("otpBox");
  const otpInput = form.querySelector('input[name="otp"]');

  const email = form.querySelector('input[name="email"]');
  const password = form.querySelector('input[name="password"]');
  const confirmPassword = form.querySelector('input[name="confirmPassword"]');
  const role = form.querySelector('select[name="role"]');

  let generatedOtp = null;
  let otpSent = false;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // STEP 1: SEND OTP
    if (!otpSent) {

      if (!email.value || !password.value || !confirmPassword.value || !role.value) {
        alert("⚠ Fill all required fields");
        return;
      }

      if (password.value !== confirmPassword.value) {
        alert("❌ Password mismatch");
        return;
      }

      generatedOtp = Math.floor(100000 + Math.random() * 900000);

      console.log("📩 OTP (DEMO):", generatedOtp);

      alert("📩 OTP sent (check console)");

      otpBox.style.display = "block";
      otpInput.focus();
      otpSent = true;
      return;
    }

    // STEP 2: VERIFY OTP
    if (parseInt(otpInput.value) !== generatedOtp) {
      alert("❌ Invalid OTP");
      return;
    }

    // SAVE USER
    localStorage.setItem(
      "startupUser",
      JSON.stringify({
        email: email.value,
        role: role.value
      })
    );

    alert("✅ Account created successfully!");
    window.location.href = "login.html";
  });

});


function signup(){

  let users = JSON.parse(localStorage.getItem("users")) || [];

  let roleInput = document.querySelector('input[name="role"]:checked');

  if(!roleInput){
    alert("Select role");
    return;
  }

  let user = {
    id: Date.now(),
    name: name.value,
    email: email.value,
    password: password.value,
    role: roleInput.value
  };

  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup done");
  window.location.href = "login.html";
}
