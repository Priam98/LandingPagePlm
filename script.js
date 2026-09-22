document.addEventListener("click", (event) => {
    const button = event.target.closest(".year-btn");
    if (!button) return;

    const content = button.nextElementSibling;
    content.classList.toggle("active");
    button.textContent = `${content.classList.contains("active") ? "▼" : "▶"} ${button.dataset.year}`;
});

function createPortalLink(link) {
    const anchor = document.createElement("a");
    anchor.href = link.href;
    anchor.textContent = link.label;

    if (link.targetBlank) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
    }
    if (link.className) anchor.className = link.className;
    if (link.action === "openDrawing") {
        anchor.addEventListener("click", (event) => {
            event.preventDefault();
            bukaDrawing();
        });
    }
    return anchor;
}

function renderPortalLinks(cards) {
    const container = document.getElementById("portal-links");
    container.replaceChildren();

    cards.forEach((cardData) => {
        const card = document.createElement("section");
        card.className = "card";
        card.id = cardData.id;

        const heading = document.createElement("h2");
        const icon = document.createElement("span");
        icon.className = "card-icon";
        icon.textContent = cardData.icon;
        heading.append(icon, cardData.title);
        card.appendChild(heading);

        const content = cardData.scrollable ? document.createElement("div") : card;
        if (cardData.scrollable) {
            content.className = "card-scroll";
            card.appendChild(content);
        }

        cardData.groups.forEach((group) => {
            if (!group.year) {
                group.links.forEach((link) => content.appendChild(createPortalLink(link)));
                return;
            }

            const button = document.createElement("button");
            button.type = "button";
            button.className = "year-btn";
            button.dataset.year = group.year;
            button.textContent = `▶ ${group.year}`;

            const yearContent = document.createElement("div");
            yearContent.className = "year-content";
            group.links.forEach((link) => yearContent.appendChild(createPortalLink(link)));
            content.append(button, yearContent);
        });

        container.appendChild(card);
    });

    tombolKabur = document.querySelector(".kabur-source");
}

async function loadPortalLinks() {
    const container = document.getElementById("portal-links");
    try {
        const response = await fetch("links.json");
        if (!response.ok) throw new Error(`Gagal memuat links.json: ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data.cards)) throw new TypeError("Format links.json tidak valid.");
        renderPortalLinks(data.cards);
    } catch (error) {
        console.error(error);
        container.textContent = "Tautan portal gagal dimuat. Silakan muat ulang halaman.";
    }
}

loadPortalLinks();


const quotes = [
    "Bug yang konsisten itu bukan bug, tapi fitur",
    "Spreadsheet adalah database yang tersesat",
    "Hari tanpa error adalah bonus",
    "Jika ragu, refresh saja dulu pake F5",
    "Kalu jalan, errornya jalan juga",
    "Developer ini sedang mencoba yang terbaik",
    "Versi paling stabil itu yang belum dirilis",
    "Data tidak akan hilang, Semoga😅",
    "Jika tombol bergerak, itu bukan bug, tapi fitur interaktif",
    "Developer sedang online, mungkin",
    "Bug sudah diperbaiki, bug baru sedang dibuat",
    "Kalau tombol tidak berfungsi, coba tatap dengan penuh amaran, mungkin dia butuh perhatian",
    "Kalau tombol kabur, itu bukan bug, tapi fitur untuk melatih kecepatan mouse kamu"
];
document.getElementById('quotes').textContent =
    "💡 " + quotes[Math.floor(Math.random() * quotes.length)]
    ;


const logo = document.getElementById("logo");
let klikLogo = 0;
logo.addEventListener("click", () => {
    klikLogo++;
    if (klikLogo === 5) {
        alert("Developer mode activated! Kamu menemukan rahasia tersembunyi! Selamat menikmati fitur rahasia ini!");
        window.location.href = "Sales.html";
        klikLogo = 0;
    }});


function cari() {
    const hasil = document.getElementById("hasilCari");
    const keyword = document.getElementById("searchInput").value;
    Swal.fire({
    icon: "error",
    title: "Tidak ditemukan",
    html: `
        <b>${keyword}</b> tidak ditemukan.<br><br>
        Coba tanya developer 😅<br>
        Dia lebih tahu letak spreadsheetnya daripada aku.
    `,
    footer: "Powered by ChatGPT",
    confirmButtonText: "Oke"
});
};

function bukaDrawing(){
Swal.fire({
    title: "Masuk Shop Drawing?",
    html: `
        Anda akan memasuki area <b>Shop Drawing</b>.<br><br>
        ☕ Siapkan kopi jika ingin memahami gambar kerja. Kopi sih ngga wajib, cuma disarankan, apalagi klo mau beliin developer ini kopi😅.
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Masuk",
    cancelButtonText: "Batal"
}).then((result) => {
    if (result.isConfirmed) {
        window.location.href = "shop drawing.html";
    }
});

};


const themeBtn = document.getElementById("themeBtn");

const savedTheme = localStorage.getItem("theme");

if(savedTheme==="dark"){
    document.body.classList.add("dark");
    themeBtn.textContent="☀️";
}

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    const dark=document.body.classList.contains("dark");

    localStorage.setItem("theme",dark?"dark":"light");

    themeBtn.textContent=dark?"☀️":"🌙";

});


const API = "https://script.google.com/macros/s/AKfycbyqnKHLkcxyobFHLJJY9I1G1zndJAe7HMZegvf3ghwQBHmeCYJ4IFbxPHP4TvLouLbfRQ/exec";

let lastJson = "";

const notyf = new Notyf({
    duration: 5000,
    position: {
        x: "right",
        y: "top"}});


async function loadStatusAlat() {
    try {
        const res = await fetch(API + "?t=" + Date.now());
        const data = await res.json();

        const currentJson = JSON.stringify(data);

        const container = document.getElementById("status-list");
        container.innerHTML = "";

        data.forEach(item => {
            container.innerHTML += `
                <div class="status-item">
                    <strong>${item.alat}</strong><br>
                    ${item.kode}<br>
                    ${item.status}
                </div>
            `;
        });

        if (lastJson !== "" && lastJson !== currentJson) {
            notyf.success("Status alat sudah diperbarui");
        }

        lastJson = currentJson;

    } catch (err) {
        console.error(err);
        notyf.error("Gagal memuat status alat");
    }
}


loadStatusAlat();

setInterval(loadStatusAlat, 60000);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        loadStatusAlat();
    }
});


// =========================================================
// TOMBOL NO SURAT JALAN - MODE KABUR
// =========================================================

let tombolKabur = null;

let tombolKaburClone = null;
let sudahKabur = false;

const pesanKabur = [
    "Hayoo ngapain",
    "Kepooo yaaa",
    "Ga boleh ngintip lho",
    "Nah loh....."
];

const JARAK_TRIGGER = 170;
const JARAK_AMAN = 230;
const MARGIN_VIEWPORT = 15;


// =========================================================
// Buat clone
// =========================================================

function aktifkanTombolKabur(e) {

    if (sudahKabur || !tombolKabur) {
        return;
    }

    const rect = tombolKabur.getBoundingClientRect();

    tombolKaburClone = tombolKabur.cloneNode(true);

    tombolKaburClone.classList.remove('kabur-source');
    tombolKaburClone.classList.add('kabur-flyer');

    tombolKaburClone.removeAttribute('id');

    /*
     * Pastikan ukuran clone sama dengan tombol asli.
     */
    tombolKaburClone.style.width = `${rect.width}px`;
    tombolKaburClone.style.height = `${rect.height}px`;

    /*
     * Masukkan ke body.
     */
    document.body.appendChild(tombolKaburClone);

    /*
     * Simpan posisi awal.
     */
    tombolKaburClone.style.left = `${rect.left}px`;
    tombolKaburClone.style.top = `${rect.top}px`;

    /*
     * Sembunyikan tombol asli TANPA mengubah layout.
     */
    tombolKabur.classList.add('is-flying');

    sudahKabur = true;

    ubahPesanKabur();

    /*
     * Langsung kabur dari cursor.
     */
    kaburkanDariCursor(e);
}


// =========================================================
// Random text
// =========================================================

function ubahPesanKabur() {

    if (!tombolKaburClone) {
        return;
    }

    const index = Math.floor(
        Math.random() * pesanKabur.length
    );

    tombolKaburClone.textContent =
        pesanKabur[index];
}


// =========================================================
// Cari posisi kabur
// =========================================================

function kaburkanDariCursor(e) {

    if (!tombolKaburClone) {
        return;
    }

    const rect =
        tombolKaburClone.getBoundingClientRect();

    const centerX =
        rect.left + rect.width / 2;

    const centerY =
        rect.top + rect.height / 2;

    let dx =
        centerX - e.clientX;

    let dy =
        centerY - e.clientY;

    const jarak =
        Math.hypot(dx, dy);

    /*
     * Kalau cursor tepat di tengah,
     * pilih arah random.
     */
    if (jarak < 1) {

        dx = Math.random() - 0.5;
        dy = Math.random() - 0.5;

    } else {

        dx /= jarak;
        dy /= jarak;

    }

    /*
     * Jarak kabur.
     */
    const escapeDistance = 220;

    let x =
        rect.left +
        dx * escapeDistance;

    let y =
        rect.top +
        dy * escapeDistance;


    // =====================================================
    // Batas viewport
    // =====================================================

    const maxX =
        window.innerWidth -
        rect.width -
        MARGIN_VIEWPORT;

    const maxY =
        window.innerHeight -
        rect.height -
        MARGIN_VIEWPORT;


    /*
     * Kalau arah kabur membawa tombol ke luar layar,
     * coba cari posisi random yang aman.
     */
    if (
        x < MARGIN_VIEWPORT ||
        x > maxX ||
        y < MARGIN_VIEWPORT ||
        y > maxY
    ) {

        const kandidat = cariPosisiAman(
            rect,
            e.clientX,
            e.clientY
        );

        x = kandidat.x;
        y = kandidat.y;
    }


    tombolKaburClone.style.left =
        `${x}px`;

    tombolKaburClone.style.top =
        `${y}px`;

    ubahPesanKabur();
}


// =========================================================
// Cari posisi random yang jauh dari cursor
// =========================================================

function cariPosisiAman(rect, mouseX, mouseY) {

    const maxX =
        window.innerWidth -
        rect.width -
        MARGIN_VIEWPORT;

    const maxY =
        window.innerHeight -
        rect.height -
        MARGIN_VIEWPORT;

    let kandidatX = rect.left;
    let kandidatY = rect.top;

    let jarakTerbaik = 0;

    /*
     * Coba 30 posisi random.
     * Ambil yang paling jauh dari cursor.
     */
    for (let i = 0; i < 30; i++) {

        const x =
            MARGIN_VIEWPORT +
            Math.random() *
            Math.max(
                1,
                maxX - MARGIN_VIEWPORT
            );

        const y =
            MARGIN_VIEWPORT +
            Math.random() *
            Math.max(
                1,
                maxY - MARGIN_VIEWPORT
            );

        const centerX =
            x + rect.width / 2;

        const centerY =
            y + rect.height / 2;

        const jarak =
            Math.hypot(
                centerX - mouseX,
                centerY - mouseY
            );

        if (jarak > jarakTerbaik) {

            jarakTerbaik = jarak;

            kandidatX = x;
            kandidatY = y;
        }
    }

    return {
        x: kandidatX,
        y: kandidatY
    };
}


// =========================================================
// Pantau cursor
// =========================================================

document.addEventListener(
    'mousemove',
    (e) => {

        if (!tombolKabur) {
            return;
        }


        // -------------------------------------------------
        // Belum kabur
        // -------------------------------------------------

        if (!sudahKabur) {

            const rect =
                tombolKabur.getBoundingClientRect();

            const centerX =
                rect.left + rect.width / 2;

            const centerY =
                rect.top + rect.height / 2;

            const jarak =
                Math.hypot(
                    e.clientX - centerX,
                    e.clientY - centerY
                );

            if (jarak < JARAK_TRIGGER) {

                aktifkanTombolKabur(e);

            }

            return;
        }


        // -------------------------------------------------
        // Sudah kabur
        // -------------------------------------------------

        if (!tombolKaburClone) {
            return;
        }

        const rect =
            tombolKaburClone.getBoundingClientRect();

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        const jarak =
            Math.hypot(
                e.clientX - centerX,
                e.clientY - centerY
            );


        /*
         * Cursor mendekat lagi?
         * Kabur lagi.
         */
        if (jarak < JARAK_TRIGGER) {

            kaburkanDariCursor(e);

        }

    }
);
