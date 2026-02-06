
document.addEventListener("DOMContentLoaded", () => {
    const headerContainer = document.getElementById("header-container");

    if (headerContainer) {
        fetch("../components/header.html")
            .then(res => res.text())
            .then(html => {
                headerContainer.innerHTML = html;

                initMobileMenu();
                addScrollShadow();
            })
            .catch(err => console.error("Header load failed:", err));
    } else {
        // If header already exists in index.html
        initMobileMenu();
        addScrollShadow();
    }
});


/* 2️⃣  MOBILE MENU TOGGLE */
function initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks   = document.querySelector(".nav-links");

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        menuToggle.classList.toggle("open");
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove("active");
            menuToggle.classList.remove("open");
        }
    });
}


/* 3️⃣  ADD SHADOW WHEN SCROLLING (Premium Navbar Effect) */
function addScrollShadow() {
    const header = document.querySelector("header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 10) {
            header.classList.add("header-shadow");
        } else {
            header.classList.remove("header-shadow");
        }
    });
}

