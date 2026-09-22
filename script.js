document.addEventListener("click", (event) => {
    const button = event.target.closest(".year-btn");
    if (!button) return;

    const content = button.nextElementSibling;
    const isOpen = content.classList.toggle("active");
    button.classList.toggle("is-open", isOpen);

    const chevron = button.querySelector(".year-chevron");
    if (chevron) chevron.textContent = isOpen ? "▼" : "▶";
});

function createPortalLink(link) {
    const anchor = document.createElement("a");
    anchor.href = link.href;
    anchor.className = "portal-link";
    anchor.textContent = link.label;

    if (link.targetBlank) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
    }

    if (link.className) {
        anchor.classList.add(link.className);
    }

    if (link.action === "openDrawing") {
        anchor.addEventListener("click", (event) => {
            event.preventDefault();
            bukaDrawing();
        });
    }

    return anchor;
}

function countLinks(cardData) {
    return cardData.groups.reduce((sum, g) => sum + (g.links ? g.links.length : 0), 0);
}

function renderPortalLinks(cards) {
    const container = document.getElementById("portal-links");
    container.replaceChildren();

    cards.forEach((cardData) => {
        const card = document.createElement("section");
        card.className = "portal-card";
        card.id = cardData.id;

        // Header
        const header = document.createElement("header");
        header.className = "portal-card-header";

        const icon = document.createElement("span");
        icon.className = "portal-card-icon";
        icon.textContent = cardData.icon || "📁";

        const headerText = document.createElement("div");
        headerText.className = "portal-card-header-text";

        const heading = document.createElement("h2");
        heading.textContent = cardData.title;

        const meta = document.createElement("p");
        meta.className = "portal-card-meta";
        const n = countLinks(cardData);
        meta.textContent = n + " tautan";

        headerText.append(heading, meta);
        header.append(icon, headerText);
        card.appendChild(header);

        // Body
        const body = document.createElement("div");
        body.className = "portal-card-body";
        if (cardData.scrollable) {
            body.classList.add("is-scrollable");
        }

        cardData.groups.forEach((group) => {
            if (!group.year) {
                group.links.forEach((link) => {
                    body.appendChild(createPortalLink(link));
                });
                return;
            }

            const yearGroup = document.createElement("div");
            yearGroup.className = "year-group";

            const button = document.createElement("button");
            button.type = "button";
            button.className = "year-btn";
            button.dataset.year = group.year;

            const chevron = document.createElement("span");
            chevron.className = "year-chevron";
            chevron.textContent = "▶";

            const label = document.createElement("span");
            label.className = "year-label";
            label.textContent = group.year;

            const count = document.createElement("span");
            count.className = "year-count";
            count.textContent = String(group.links.length);

            button.append(chevron, label, count);

            const yearContent = document.createElement("div");
            yearContent.className = "year-content";

            group.links.forEach((link) => {
                yearContent.appendChild(createPortalLink(link));
            });

            yearGroup.append(button, yearContent);
            body.appendChild(yearGroup);
        });

        card.appendChild(body);
        container.appendChild(card);
    });

    tombolKabur = document.querySelector(".kabur-source");
}

function mapSupabaseCards(cards) {
    return cards.map((card) => ({
        id: card.id,
        title: card.title,
        icon: card.icon,
        scrollable: card.scrollable,
        groups: (card.link_groups || []).map((group) => ({
            year: group.year,
            links: (group.links || []).map((link) => ({
                label: link.label,
                href: link.href,
                targetBlank: link.target_blank,
                className: link.class_name,
                action: link.action
            }))
        }))
    }));
}

async function loadPortalFromSupabase() {
    if (typeof supabaseClient === "undefined") {
        throw new Error("Supabase client belum dimuat.");
    }

    const { data, error } = await supabaseClient
        .from("cards")
        .select(`
            id,
            title,
            icon,
            scrollable,
            sort_order,
            link_groups (
                id,
                year,
                sort_order,
                links (
                    label,
                    href,
                    target_blank,
                    class_name,
                    action,
                    sort_order
                )
            )
        `)
        .order("sort_order", { ascending: true })
        .order("sort_order", {
            foreignTable: "link_groups",
            ascending: true
        })
        .order("sort_order", {
            foreignTable: "link_groups.links",
            ascending: true
        });

    if (error) throw error;

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Data portal Supabase kosong.");
    }

    return mapSupabaseCards(data);
}

async function loadPortalFromFallback() {
    const response = await fetch("links.json");

    if (!response.ok) {
        throw new Error(`Gagal memuat links.json: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.cards)) {
        throw new TypeError("Format links.json tidak valid.");
    }

    return data.cards;
}

async function loadPortalLinks() {
    const container = document.getElementById("portal-links");

    try {
        const cards = await loadPortalFromSupabase();
        renderPortalLinks(cards);
        console.info("Portal dimuat dari Supabase.");
    } catch (supabaseError) {
        console.warn(
            "Supabase gagal dimuat. Menggunakan links.json sebagai fallback.",
            supabaseError
        );

        try {
            const cards = await loadPortalFromFallback();
            renderPortalLinks(cards);
            console.info("Portal dimuat dari links.json.");
        } catch (fallbackError) {
            console.error(fallbackError);
            container.textContent =
                "Tautan portal gagal dimuat. Silakan muat ulang halaman.";
        }
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

document.getElementById("quotes").textContent =
    "💡 " + quotes[Math.floor(Math.random() * quotes.length)];

const logo = document.getElementById("logo");
let klikLogo = 0;

logo.addEventListener("click", () => {
    klikLogo++;

    if (klikLogo === 5) {
        alert(
            "Developer mode activated! Kamu menemukan rahasia tersembunyi! Selamat menikmati fitur rahasia ini!"
        );
        window.location.href = "Sales.html";
        klikLogo = 0;
    }
});

function cari() {
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
}

function bukaDrawing() {
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
}

const themeBtn = document.getElementById("themeBtn");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
}

if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const dark = document.body.classList.contains("dark");
        localStorage.setItem("theme", dark ? "dark" : "light");
    });
}

const API =
    "https://script.google.com/macros/s/AKfycbyqnKHLkcxyobFHLJJY9I1G1zndJAe7HMZegvf3ghwQBHmeCYJ4IFbxPHP4TvLouLbfRQ/exec";

let lastJson = "";

const notyf = new Notyf({
    duration: 5000,
    position: {
        x: "right",
        y: "top"
    }
});

async function loadStatusAlat() {
    try {
        const res = await fetch(API + "?t=" + Date.now());
        const data = await res.json();
        const currentJson = JSON.stringify(data);

        const container = document.getElementById("status-list");
        container.innerHTML = "";

        data.forEach((item) => {
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

function aktifkanTombolKabur(e) {
    if (sudahKabur || !tombolKabur) return;

    const rect = tombolKabur.getBoundingClientRect();

    tombolKaburClone = tombolKabur.cloneNode(true);
    tombolKaburClone.classList.remove("kabur-source");
    tombolKaburClone.classList.add("kabur-flyer");
    tombolKaburClone.removeAttribute("id");

    tombolKaburClone.style.width = `${rect.width}px`;
    tombolKaburClone.style.height = `${rect.height}px`;

    document.body.appendChild(tombolKaburClone);

    tombolKaburClone.style.left = `${rect.left}px`;
    tombolKaburClone.style.top = `${rect.top}px`;

    tombolKabur.classList.add("is-flying");
    sudahKabur = true;

    ubahPesanKabur();
    kaburkanDariCursor(e);
}

function ubahPesanKabur() {
    if (!tombolKaburClone) return;

    const index = Math.floor(Math.random() * pesanKabur.length);
    tombolKaburClone.textContent = pesanKabur[index];
}

function kaburkanDariCursor(e) {
    if (!tombolKaburClone) return;

    const rect = tombolKaburClone.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = centerX - e.clientX;
    let dy = centerY - e.clientY;

    const jarak = Math.hypot(dx, dy);

    if (jarak < 1) {
        dx = Math.random() - 0.5;
        dy = Math.random() - 0.5;
    } else {
        dx /= jarak;
        dy /= jarak;
    }

    const escapeDistance = 220;

    let x = rect.left + dx * escapeDistance;
    let y = rect.top + dy * escapeDistance;

    const maxX = window.innerWidth - rect.width - MARGIN_VIEWPORT;
    const maxY = window.innerHeight - rect.height - MARGIN_VIEWPORT;

    if (
        x < MARGIN_VIEWPORT ||
        x > maxX ||
        y < MARGIN_VIEWPORT ||
        y > maxY
    ) {
        const kandidat = cariPosisiAman(rect, e.clientX, e.clientY);
        x = kandidat.x;
        y = kandidat.y;
    }

    tombolKaburClone.style.left = `${x}px`;
    tombolKaburClone.style.top = `${y}px`;

    ubahPesanKabur();
}

function cariPosisiAman(rect, mouseX, mouseY) {
    const maxX = window.innerWidth - rect.width - MARGIN_VIEWPORT;
    const maxY = window.innerHeight - rect.height - MARGIN_VIEWPORT;

    let kandidatX = rect.left;
    let kandidatY = rect.top;
    let jarakTerbaik = 0;

    for (let i = 0; i < 30; i++) {
        const x =
            MARGIN_VIEWPORT +
            Math.random() * Math.max(1, maxX - MARGIN_VIEWPORT);

        const y =
            MARGIN_VIEWPORT +
            Math.random() * Math.max(1, maxY - MARGIN_VIEWPORT);

        const centerX = x + rect.width / 2;
        const centerY = y + rect.height / 2;

        const jarak = Math.hypot(centerX - mouseX, centerY - mouseY);

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

document.addEventListener("mousemove", (e) => {
    if (!tombolKabur) return;

    if (!sudahKabur) {
        const rect = tombolKabur.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const jarak = Math.hypot(
            e.clientX - centerX,
            e.clientY - centerY
        );

        if (jarak < JARAK_TRIGGER) {
            aktifkanTombolKabur(e);
        }

        return;
    }

    if (!tombolKaburClone) return;

    const rect = tombolKaburClone.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const jarak = Math.hypot(
        e.clientX - centerX,
        e.clientY - centerY
    );

    if (jarak < JARAK_TRIGGER) {
        kaburkanDariCursor(e);
    }
});