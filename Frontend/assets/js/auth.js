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

function login(e){
  e.preventDefault();

  const email = document.getElementById("email").value;
  let user = JSON.parse(localStorage.getItem("user"));

  // Check for demo user
  if(email === "d@emo.com"){
    user = {
      name: "Demo User",
      email: "d@emo.com",
      role: "founder"
    };
    localStorage.setItem("user", JSON.stringify(user));
  }

  if(!user){
    alert("No account found. Please signup first.");
    return;
  }

  if(user.email !== email){
    alert("Email not registered.");
    return;
  }

  // LOGIN SUCCESS
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("loggedInUser", JSON.stringify(user));

  if(user.role === "founder"){
    window.location.href = "founder-dashboard.html";
  } else {
    window.location.href = "member-dashboard.html";
  }
}

function demoLogin(){
  const demoUser = {
    name: "Demo User",
    email: "d@emo.com",
    role: "founder"
  };

  // SAVE DEMO USER
  localStorage.setItem("user", JSON.stringify(demoUser));

  // LOGIN SUCCESS
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("loggedInUser", JSON.stringify(demoUser));

  window.location.href = "founder-dashboard.html";
}

function logout(){
  localStorage.clear();
  window.location.href = "../pages/login.html";
}

