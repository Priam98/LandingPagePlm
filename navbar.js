const topNavbar = document.getElementById("topNavbar");
const navMenuBtn = document.getElementById("navMenuBtn");
const navPanel = document.getElementById("navPanel");
const navLinks = document.querySelectorAll(".nav-links a");

function updateNavbarState() {
    topNavbar.classList.toggle("is-scrolled", window.scrollY > 8);
}

navMenuBtn.addEventListener("click", () => {
    const open = navPanel.classList.toggle("is-open");
    navMenuBtn.classList.toggle("is-open", open);
    navMenuBtn.setAttribute("aria-expanded", String(open));
});

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        navPanel.classList.remove("is-open");
        navMenuBtn.classList.remove("is-open");
        navMenuBtn.setAttribute("aria-expanded", "false");
    });
});

window.addEventListener("scroll", updateNavbarState, { passive: true });
updateNavbarState();
