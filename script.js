const years = document.querySelectorAll(".year-btn");

years.forEach((button) => {

    button.addEventListener("click", () => {

        const content = button.nextElementSibling;

        content.classList.toggle("active");

        if (content.classList.contains("active")) {
            button.innerHTML = button.innerHTML.replace("▶", "▼");
        } else {
            button.innerHTML = button.innerHTML.replace("▼", "▶");
        }

    });

});

// =========================
// Tombol Laporan Keuangan Kabur™
// =========================

const tombolKabur = document.querySelector(".kabur");

const pesan = [
    "Hayoo ngapain",
    "Kepooo yaaaa",
    "Ga boleh ngintip",
    "Nah loh.....",
    "Akses ditolak",
    "Masih dicari?",
    "Finance sedang offline",
    "Balik kerja sana",
    "Dikira gampang?"
];

let posisiX = 0;
let posisiY = 0;

document.addEventListener("mousemove", (e) => {

    const rect = tombolKabur.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const jarak = Math.sqrt(dx * dx + dy * dy);

    if (jarak < 150 && jarak > 0) {

        const kecepatan = 20;

        posisiX += (-dx / jarak) * kecepatan;
        posisiY += (-dy / jarak) * kecepatan;

        // Biar ga kabur ke Kalimantan
        posisiX = Math.max(-100, Math.min(100, posisiX));
        posisiY = Math.max(-50, Math.min(50, posisiY));

        tombolKabur.style.transform =
            `translate(${posisiX}px, ${posisiY}px)`;

        tombolKabur.textContent =
            pesan[Math.floor(Math.random() * pesan.length)];

    }

});

// Balik normal kalau mouse keluar halaman
document.addEventListener("mouseleave", () => {

    posisiX = 0;
    posisiY = 0;

    tombolKabur.style.transform =
        "translate(0px, 0px)";

    tombolKabur.textContent =
        "Laporan Keuangan";

});
