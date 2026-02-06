console.log("🔥 Animation Engine Loaded");

const heroTitle = document.querySelector(".hero-content h1");
const heroImage = document.querySelector(".hero-image img");
const heroContent = document.querySelector(".hero-content");
const featureBoxes = document.querySelectorAll(".feature-box");
const sections = document.querySelectorAll("section, .feature-box");


if (heroTitle) {
  const text = heroTitle.textContent;
  heroTitle.textContent = "";
  let i = 0;

  (function type() {
    if (i < text.length) {
      heroTitle.textContent += text.charAt(i++);
      setTimeout(type, 28);
    }
  })();
}


if (window.innerWidth > 900) {
  document.addEventListener("mousemove", (e) => {
    if (!heroImage || !heroContent) return;

    const x = (window.innerWidth / 2 - e.clientX) / 40;
    const y = (window.innerHeight / 2 - e.clientY) / 40;

    heroImage.style.transform =
      `translate(${x}px, ${y}px) scale(1.03)`;
    heroContent.style.transform =
      `translate(${-x}px, ${-y}px)`;
  });
}


window.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (heroImage) heroImage.style.translate = `0 ${y * 0.12}px`;
  if (heroContent) heroContent.style.translate = `0 ${y * 0.05}px`;
});


function reveal() {
  sections.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 120) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }
  });
}

window.addEventListener("scroll", reveal);
window.addEventListener("load", reveal);


featureBoxes.forEach(card => {

  card.addEventListener("mousemove", (e) => {
    const x = e.offsetX - card.offsetWidth / 2;
    const y = e.offsetY - card.offsetHeight / 2;

    card.style.transform = `
      perspective(700px)
      rotateX(${(-y / 18)}deg)
      rotateY(${(x / 18)}deg)
      scale(1.04)
    `;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform =
      "perspective(700px) rotateX(0) rotateY(0) scale(1)";
  });

  card.addEventListener("click", () => {
    featureBoxes.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
  });
});

document.querySelectorAll(".primary-btn, .secondary-btn, .cta-btn")
.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const ripple = document.createElement("span");
    ripple.className = "ripple";

    const size = Math.max(btn.clientWidth, btn.clientHeight);
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.offsetX - size / 2 + "px";
    ripple.style.top = e.offsetY - size / 2 + "px";

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});


function createParticles(count = 25) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    const size = Math.random() * 6 + 3;

    p.style.width = p.style.height = size + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = 5 + Math.random() * 5 + "s";
    p.style.animationDelay = Math.random() * 3 + "s";

    document.body.appendChild(p);
  }
}
createParticles();


