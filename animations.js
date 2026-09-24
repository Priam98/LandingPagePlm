/* ============================================================
   Portal v5.0 — Progressive motion enhancements
   (does not touch app logic in script.js / navbar.js)
   ============================================================ */

// ---------- Scroll progress bar ----------
const scrollProgressEl = document.getElementById("scrollProgress");

function updateScrollProgress() {
    if (!scrollProgressEl) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgressEl.style.width = pct + "%";
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

// ---------- Reveal-on-scroll ----------
const revealTargets = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealTargets.length) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
} else {
    revealTargets.forEach((el) => el.classList.add("in-view"));
}

// ---------- Scroll-to-top button ----------
const scrollTopBtn = document.getElementById("scrollTopBtn");

if (scrollTopBtn) {
    window.addEventListener(
        "scroll",
        () => {
            scrollTopBtn.classList.toggle("is-visible", window.scrollY > 480);
        },
        { passive: true }
    );

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ---------- Hero stat counters (fills in once cards are rendered) ----------
const statCardsEl = document.getElementById("statCards");
const statToolsEl = document.getElementById("statTools");

function animateCount(el, target) {
    if (!el) return;
    const duration = 700;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(progress * target);
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function refreshHeroStats() {
    const cardCount = document.querySelectorAll("#portal-links .portal-card").length;
    const toolCount = document.querySelectorAll("#status-list .status-item").length;

    if (cardCount) animateCount(statCardsEl, cardCount);
    if (toolCount) animateCount(statToolsEl, toolCount);
}

const portalLinksEl = document.getElementById("portal-links");
const statusListEl = document.getElementById("status-list");

if (portalLinksEl && "MutationObserver" in window) {
    new MutationObserver(refreshHeroStats).observe(portalLinksEl, { childList: true });
}

if (statusListEl && "MutationObserver" in window) {
    new MutationObserver(refreshHeroStats).observe(statusListEl, { childList: true });
}
