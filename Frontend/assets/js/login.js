function login(){

  let users = JSON.parse(localStorage.getItem("users")) || [];

  let user = users.find(u =>
    u.email === email.value && u.password === password.value
  );

  if(!user){
    alert("Wrong details");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));

  if(user.role === "founder"){
    location.href = "founder-dashboard.html";
  }else{
    location.href = "member-dashboard.html";
  }
}
