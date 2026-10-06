/* ============================================================
   Portal script — Favorites, Recent, Copy, Global Clicks, Changelog
   ============================================================ */

document.addEventListener("click", (event) => {
    const button = event.target.closest(".year-btn");
    if (!button) return;

    const content = button.nextElementSibling;
    const isOpen = content.classList.toggle("active");
    button.classList.toggle("is-open", isOpen);

    const chevron = button.querySelector(".year-chevron");
    if (chevron) chevron.textContent = isOpen ? "▼" : "▶";
});

/* ---------- Local storage helpers ---------- */

const FAV_KEY = "plm_favorites";
const RECENT_KEY = "plm_recent";
const CHANGELOG_SEEN_KEY = "plm_changelog_seen";
const MAX_RECENT = 10;

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFavorites() {
    return loadJSON(FAV_KEY, []);
}

function isFavorite(href) {
    return getFavorites().some((item) => item.href === href);
}

function toggleFavorite(link) {
    let list = getFavorites();
    const exists = list.some((item) => item.href === link.href);

    if (exists) {
        list = list.filter((item) => item.href !== link.href);
    } else {
        list.unshift({ href: link.href, label: link.label });
    }

    saveJSON(FAV_KEY, list);
    refreshSpecialCards();
    return !exists;
}

function getRecent() {
    return loadJSON(RECENT_KEY, []);
}

function addToRecent(link) {
    let list = getRecent().filter((item) => item.href !== link.href);
    list.unshift({ href: link.href, label: link.label });
    if (list.length > MAX_RECENT) list = list.slice(0, MAX_RECENT);
    saveJSON(RECENT_KEY, list);
    refreshSpecialCards();
}

/* ---------- Global click counter (Supabase) ---------- */

async function incrementClick(link) {
    if (typeof supabaseClient === "undefined") return;

    try {
        const { error } = await supabaseClient.rpc("increment_link_click", {
            p_href: link.href,
            p_label: link.label
        });

        if (error) throw error;
    } catch (rpcError) {
        // Fallback: manual upsert (works even if RPC not created yet)
        try {
            const { data } = await supabaseClient
                .from("link_clicks")
                .select("click_count")
                .eq("href", link.href)
                .maybeSingle();

            const next = (data?.click_count || 0) + 1;

            await supabaseClient.from("link_clicks").upsert({
                href: link.href,
                label: link.label,
                click_count: next,
                last_clicked_at: new Date().toISOString()
            });
        } catch (upsertError) {
            console.warn("Gagal mencatat klik:", upsertError);
        }
    }
}

/* ---------- Copy link ---------- */

async function copyLink(href) {
    try {
        await navigator.clipboard.writeText(href);
        if (typeof notyf !== "undefined") {
            notyf.success("Link disalin");
        }
    } catch {
        if (typeof notyf !== "undefined") {
            notyf.error("Gagal menyalin link");
        }
    }
}

/* ---------- Create link row (with ★ and 📋) ---------- */

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

function createPortalLinkRow(link) {
    const row = document.createElement("div");
    row.className = "portal-link-row";

    const anchor = createPortalLink(link);

    // Track recent + global click on every open
    anchor.addEventListener("click", () => {
        if (link.action === "openDrawing") return;
        addToRecent(link);
        incrementClick(link);
    });

    const actions = document.createElement("div");
    actions.className = "portal-link-actions";

    // Favorite button
    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "portal-action-btn" + (isFavorite(link.href) ? " is-fav" : "");
    favBtn.title = isFavorite(link.href) ? "Hapus dari favorit" : "Tambah ke favorit";
    favBtn.setAttribute("aria-label", favBtn.title);
    favBtn.textContent = isFavorite(link.href) ? "★" : "☆";
    favBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowFav = toggleFavorite(link);
        favBtn.textContent = nowFav ? "★" : "☆";
        favBtn.classList.toggle("is-fav", nowFav);
        favBtn.title = nowFav ? "Hapus dari favorit" : "Tambah ke favorit";
        if (typeof notyf !== "undefined") {
            notyf.success(nowFav ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
        }
    });

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "portal-action-btn";
    copyBtn.title = "Salin link";
    copyBtn.setAttribute("aria-label", "Salin link");
    copyBtn.textContent = "📋";
    copyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        copyLink(link.href);
    });

    actions.append(favBtn, copyBtn);
    row.append(anchor, actions);
    return row;
}

function countLinks(cardData) {
    return cardData.groups.reduce((sum, g) => sum + (g.links ? g.links.length : 0), 0);
}

/* ---------- Special cards (Favorit & Recent) ---------- */

function buildSimpleCard(id, title, icon, links) {
    const card = document.createElement("section");
    card.className = "portal-card is-special";
    card.id = id;

    const header = document.createElement("header");
    header.className = "portal-card-header";

    const iconEl = document.createElement("span");
    iconEl.className = "portal-card-icon";
    iconEl.textContent = icon;

    const headerText = document.createElement("div");
    headerText.className = "portal-card-header-text";

    const heading = document.createElement("h2");
    heading.textContent = title;

    const meta = document.createElement("p");
    meta.className = "portal-card-meta";
    meta.textContent = links.length + " tautan";

    headerText.append(heading, meta);
    header.append(iconEl, headerText);
    card.appendChild(header);

    const body = document.createElement("div");
    body.className = "portal-card-body is-scrollable";

    if (links.length === 0) {
        const empty = document.createElement("p");
        empty.className = "portal-card-meta";
        empty.style.padding = "10px";
        empty.textContent = "Belum ada data.";
        body.appendChild(empty);
    } else {
        links.forEach((link) => {
            body.appendChild(
                createPortalLinkRow({
                    label: link.label,
                    href: link.href,
                    targetBlank: true,
                    className: null,
                    action: null
                })
            );
        });
    }

    card.appendChild(body);
    return card;
}

function refreshSpecialCards() {
    const container = document.getElementById("portal-links");
    if (!container) return;

    // Remove old special cards
    container.querySelectorAll(".is-special").forEach((el) => el.remove());

    const favs = getFavorites();
    const recent = getRecent();

    const fragment = document.createDocumentFragment();

    if (favs.length > 0) {
        fragment.appendChild(buildSimpleCard("favorit", "Favorit", "⭐", favs));
    }

    if (recent.length > 0) {
        fragment.appendChild(buildSimpleCard("recent", "Baru Dibuka", "🕒", recent));
    }

    container.prepend(fragment);
}

/* ---------- Main portal render ---------- */

function renderPortalLinks(cards) {
    const container = document.getElementById("portal-links");
    container.replaceChildren();

    // Special cards first
    const favs = getFavorites();
    const recent = getRecent();

    if (favs.length > 0) {
        container.appendChild(buildSimpleCard("favorit", "Favorit", "⭐", favs));
    }
    if (recent.length > 0) {
        container.appendChild(buildSimpleCard("recent", "Baru Dibuka", "🕒", recent));
    }

    cards.forEach((cardData) => {
        const card = document.createElement("section");
        card.className = "portal-card";
        card.id = cardData.id;

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

        const body = document.createElement("div");
        body.className = "portal-card-body";
        if (cardData.scrollable) {
            body.classList.add("is-scrollable");
        }

        cardData.groups.forEach((group) => {
            if (!group.year) {
                group.links.forEach((link) => {
                    body.appendChild(createPortalLinkRow(link));
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
                yearContent.appendChild(createPortalLinkRow(link));
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

function showPortalSkeleton() {
    const container = document.getElementById("portal-links");

    if (container) {
        container.innerHTML = `
            <div class="portal-skeleton-grid" aria-hidden="true">
                ${Array.from({ length: 6 }, () => `
                    <section class="skeleton-card">
                        <div class="skeleton-card-header">
                            <span class="skeleton skeleton-icon"></span>
                            <div class="skeleton-header-text">
                                <span class="skeleton skeleton-title"></span>
                                <span class="skeleton skeleton-meta"></span>
                            </div>
                        </div>
                        <div class="skeleton-card-body">
                            <span class="skeleton skeleton-link"></span>
                            <span class="skeleton skeleton-link"></span>
                            <span class="skeleton skeleton-link"></span>
                            <span class="skeleton skeleton-link"></span>
                            <span class="skeleton skeleton-link"></span>
                        </div>
                    </section>
                `).join("")}
            </div>
        `;
    }

    const statusContainer = document.getElementById("status-list");

    if (statusContainer) {
        statusContainer.innerHTML = `
            <div class="status-skeleton" aria-hidden="true">
                <span class="skeleton status-skeleton-item"></span>
                <span class="skeleton status-skeleton-item"></span>
                <span class="skeleton status-skeleton-item"></span>
            </div>
        `;
    }
}

async function loadPortalLinks() {
    const container = document.getElementById("portal-links");

    showPortalSkeleton();

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

/* ---------- Changelog ---------- */

async function loadChangelogBanner() {
    if (typeof supabaseClient === "undefined") return;

    const banner = document.getElementById("changelogBanner");
    if (!banner) return;

    try {
        const { data, error } = await supabaseClient
            .from("changelog")
            .select("id, title, description, created_at")
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) throw error;
        if (!data || data.length === 0) return;

        const latest = data[0];
        const seenId = localStorage.getItem(CHANGELOG_SEEN_KEY);

        if (seenId === latest.id) return;

        const textEl = document.getElementById("changelogBannerText");
        if (textEl) {
            textEl.innerHTML = `<strong>Update:</strong> ${escapeHtml(latest.title)}`;
        }

        banner.classList.add("is-visible");

        const dismissBtn = document.getElementById("changelogDismiss");
        if (dismissBtn) {
            dismissBtn.onclick = () => {
                localStorage.setItem(CHANGELOG_SEEN_KEY, latest.id);
                banner.classList.remove("is-visible");
            };
        }

        const detailBtn = document.getElementById("changelogDetail");
        if (detailBtn) {
            detailBtn.onclick = () => {
                const desc = latest.description
                    ? `<p style="margin-top:8px;opacity:.85">${escapeHtml(latest.description)}</p>`
                    : "";

                Swal.fire({
                    title: latest.title,
                    html: desc,
                    icon: "info",
                    confirmButtonText: "Oke"
                });

                localStorage.setItem(CHANGELOG_SEEN_KEY, latest.id);
                banner.classList.remove("is-visible");
            };
        }
    } catch (err) {
        console.warn("Changelog gagal dimuat:", err);
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* ---------- Quotes, logo easter egg, theme, status alat ---------- */

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

/* Load changelog after portal */
loadChangelogBanner();

/* ---------- Kabur button ---------- */

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
