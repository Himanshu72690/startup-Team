// ROLE + LOGIN GUARD
const user = JSON.parse(localStorage.getItem("loggedInUser"));
if(!user || user.role !== "founder"){
  window.location.href = "../login.html";
}

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

// LOGOUT (auth.js ke logout ko call karta hai)
function logout(){
  localStorage.clear();
  window.location.href = "../login.html";
}


/* SAVE FOUNDER PROFILE */
function saveFounderProfile(e) {
  e.preventDefault();

  const p = {
    name: document.getElementById("fname").value,
    experience: document.getElementById("experience").value,
    bio: document.getElementById("bio").value,
    skills: document.getElementById("skills").value,
    complete: true
  };

  localStorage.setItem("founderProfile", JSON.stringify(p));
  alert("Founder profile saved");
  window.location.href = "founder-profile.html";
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
