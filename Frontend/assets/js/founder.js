// COMPREHENSIVE AUTH GUARD FOR FOUNDER PAGES
function validateFounderAuth() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const token = localStorage.getItem("token");
  
  // Check if user exists and is a founder
  if (!user || user.role !== "founder" || !token) {
    console.warn("Auth validation failed - redirecting to login");
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("login.html?redirect=founder-dashboard");
    return false;
  }
  return true;
}

// Immediate validation on page load
if (!validateFounderAuth()) {
  throw new Error("Not authenticated as founder");
}

// Listen for storage changes (logout from another tab)
window.addEventListener('storage', function(event) {
  if (event.key === 'loggedInUser' && event.newValue === null) {
    console.warn("Logout detected from another tab");
    window.location.replace("login.html?redirect=founder-dashboard");
  }
});

// BFCache / Back Button Protection with popstate
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    // Page was restored from back-forward cache
    if (!validateFounderAuth()) {
      window.location.replace("login.html?redirect=founder-dashboard");
    }
  }
});

// Prevent going back to this page after logout
window.addEventListener('pagehide', function(event) {
  // Push a new history entry to prevent back navigation
  window.history.pushState(null, null, window.location.href);
});

window.addEventListener('popstate', function(event) {
  // If user tries to go back, check auth
  if (!validateFounderAuth()) {
    window.history.forward();
  }
});

/* DEFAULT STORAGE */
if (!localStorage.getItem("founderProfile")) {
  localStorage.setItem(
    "founderProfile",
    JSON.stringify({ complete: false })
  );
}
if (!localStorage.getItem("startup")) {
  localStorage.setItem(
    "startup",
    JSON.stringify({ created: false, roles: [] })
  );
}
if (!localStorage.getItem("requests")) {
  localStorage.setItem("requests", "[]");
}

// LOGOUT (now uses shared logout.js)
function logout(){
  if (window.logoutUser) {
    window.logoutUser();
  } else {
    // Fallback if logout.js not loaded
    localStorage.clear();
    window.location.href = "login.html";
  }
}


/* SAVE FOUNDER PROFILE */
async function saveFounderProfile(e) {
  e.preventDefault();
  console.log("=== SAVE PROFILE DEBUG ===");

  const p = {
    name: document.getElementById("fname").value,
    experience: document.getElementById("experience").value,
    bio: document.getElementById("bio").value,
    skills: document.getElementById("skills").value,
    linkedin: document.getElementById("linkedin").value || "",
    portfolio: document.getElementById("portfolio").value || "",
    complete: true
  };

  console.log("Profile data to save:", p);

  const token = localStorage.getItem('token');
  console.log("Token exists:", !!token);

  try {
    // If token exists, send to backend
    if (token) {
      const response = await fetch('http://localhost:5000/api/founder/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(p)
      });

      const result = await response.json();
      console.log("Backend save response:", result);

      if (response.ok) {
        // Update localStorage
        localStorage.setItem("founderProfile", JSON.stringify(p));
        console.log("Saved founderProfile to localStorage");
        
        // Update the logged-in user's name
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
        console.log("Before update - loggedInUser:", loggedInUser);
        loggedInUser.name = p.name;
        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        console.log("After update - loggedInUser:", loggedInUser);
        
        // Use new message system or alert
        if (typeof showMessage === 'function') {
          showMessage("✓ Profile saved successfully!", "success");
          setTimeout(() => window.location.href = "founder-profile.html", 2500);
        } else {
          alert("Profile saved successfully!");
          window.location.href = "founder-profile.html";
        }
      } else {
        const errorMsg = result.message || "Please try again";
        if (typeof showMessage === 'function') {
          showMessage("✗ Error saving profile: " + errorMsg, "error");
        } else {
          alert("Error saving profile: " + errorMsg);
        }
      }
    } else {
      // No token, just save to localStorage
      console.log("No token, saving to localStorage only");
      localStorage.setItem("founderProfile", JSON.stringify(p));
      
      // Update the logged-in user's name
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
      console.log("Before update - loggedInUser:", loggedInUser);
      loggedInUser.name = p.name;
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      console.log("After update - loggedInUser:", loggedInUser);
      
      if (typeof showMessage === 'function') {
        showMessage("✓ Profile saved locally!", "success");
        setTimeout(() => window.location.href = "founder-profile.html", 2500);
      } else {
        alert("Profile saved locally!");
        window.location.href = "founder-profile.html";
      }
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    // Fallback: save to localStorage
    localStorage.setItem("founderProfile", JSON.stringify(p));
    
    // Update the logged-in user's name
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
    loggedInUser.name = p.name;
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    
    if (typeof showMessage === 'function') {
      showMessage("✓ Profile saved locally (backend unavailable)", "success");
      setTimeout(() => window.location.href = "founder-profile.html", 2500);
    } else {
      alert("Profile saved locally (backend unavailable)");
      window.location.href = "founder-profile.html";
    }
  }
}

/* SAVE STARTUP */
function saveStartup(e) {
  e.preventDefault();

  const s = {
    name: document.getElementById("sname").value,
    description: document.getElementById("sdesc").value,
    stage: document.getElementById("stage").value,
    created: true,
    roles: []
  };

  localStorage.setItem("startup", JSON.stringify(s));
  alert("Startup saved");
  window.location.href = "startup-profile.html";
}

/* POST ROLE */
function postRole(e) {
  e.preventDefault();

  const s = JSON.parse(localStorage.getItem("startup"));

  s.roles.push({
    title: document.getElementById("role").value,
    skills: document.getElementById("rskills").value,
    type: document.getElementById("rtype").value
  });

  localStorage.setItem("startup", JSON.stringify(s));
  alert("Role posted");
  window.location.href = "roles-list.html";
}
