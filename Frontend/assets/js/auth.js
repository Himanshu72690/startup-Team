function signup(e){
  e.preventDefault();

  const user = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    role: document.getElementById("role").value
  };

  // SAVE USER
  localStorage.setItem("user", JSON.stringify(user));

  alert("Signup successful. Please login.");
  window.location.href = "login.html";
}

async function login(e){
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password")?.value || "";

  // Check for demo user
  if(email === "d@emo.com"){
    const demoUser = {
      _id: "demo123",
      name: "Demo User",
      email: "d@emo.com",
      role: "founder"
    };
    localStorage.setItem("loggedInUser", JSON.stringify(demoUser));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.removeItem("token");
    console.log("Demo login, user:", demoUser);
    window.location.href = "founder-dashboard.html";
    return;
  }

  try {
    // Call backend login API
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    console.log("Login response:", result);

    if (response.ok && result.data && result.data.user) {
      const userData = result.data.user;
      
      // Save token and user data
      localStorage.setItem("token", result.data.accessToken);
      localStorage.setItem("refreshToken", result.data.refreshToken);
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");
      
      console.log("User saved to localStorage:", userData);

      if(userData.role === "founder"){
        window.location.href = "founder-dashboard.html";
      } else {
        window.location.href = "member-dashboard.html";
      }
    } else {
      alert(result.message || "Login failed");
    }
  } catch (error) {
    console.error("Login API error:", error);
    // Fallback to localStorage auth only if there's an actual user saved
    let user = JSON.parse(localStorage.getItem("user"));
    if(!user){
      alert("Backend unavailable and no local account found. Please signup first.");
      return;
    }
    if(user.email !== email){
      alert("Email not registered locally.");
      return;
    }
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    if(user.role === "founder"){
      window.location.href = "founder-dashboard.html";
    } else {
      window.location.href = "member-dashboard.html";
    }
  }
}

function demoLogin(){
  const demoUser = {
    name: "Demo User",
    email: "d@emo.com",
    role: "founder",
    _id: "demo123"
  };

  // SAVE DEMO USER
  localStorage.setItem("loggedInUser", JSON.stringify(demoUser));
  localStorage.setItem("isLoggedIn", "true");
  // Remove token for demo user
  localStorage.removeItem("token");

  window.location.href = "founder-dashboard.html";
}

function logout(){
  localStorage.clear();
  window.location.href = "../pages/login.html";
}

