const pageThemeBtn = document.getElementById("themeBtn");
const pageSavedTheme = localStorage.getItem("theme");

if (pageSavedTheme === "dark") {
    document.body.classList.add("dark");
    if (pageThemeBtn) pageThemeBtn.textContent = "☀️";
}

if (pageThemeBtn) {
    pageThemeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const dark = document.body.classList.contains("dark");
        localStorage.setItem("theme", dark ? "dark" : "light");
        pageThemeBtn.textContent = dark ? "☀️" : "🌙";
    });
}
