/* ============================================================
   Portal v5.0 — Shared scroll motion (progress bar + back-to-top)
   Used by Sales, develop, shop drawing, laporan keuangan, admin,
   and the Hiburan games. Safe no-op if the elements aren't present.
   ============================================================ */

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

const scrollTopBtn = document.getElementById("scrollTopBtn");

if (scrollTopBtn) {
    window.addEventListener(
        "scroll",
        () => {
            scrollTopBtn.classList.toggle("is-visible", window.scrollY > 320);
        },
        { passive: true }
    );

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
