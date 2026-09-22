"use strict";

/*
 * ============================================================
 * ADMIN PORTAL - SUPABASE CRUD
 * ============================================================
 *
 * Mengelola:
 *   cards
 *   link_groups
 *   links
 *
 * Tidak mengubah links.json.
 * Tidak mengubah portal publik secara langsung.
 *
 * Semua operasi tulis membutuhkan:
 *   authenticated user
 *   user tersebut terdaftar di public.admins
 *
 * ============================================================
 */


// ============================================================
// STATE
// ============================================================

let cards = [];
let groups = [];
let links = [];

let modalMode = null;
let editingId = null;


// ============================================================
// DOM
// ============================================================

const loginView = document.getElementById("loginView");
const adminView = document.getElementById("adminView");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");

const logoutBtn = document.getElementById("logoutBtn");
const currentUser = document.getElementById("currentUser");

const cardsContainer = document.getElementById("cardsContainer");
const groupsContainer = document.getElementById("groupsContainer");
const linksContainer = document.getElementById("linksContainer");

const cardCount = document.getElementById("cardCount");
const groupCount = document.getElementById("groupCount");
const linkCount = document.getElementById("linkCount");

const addCardBtn = document.getElementById("addCardBtn");
const addGroupBtn = document.getElementById("addGroupBtn");
const addLinkBtn = document.getElementById("addLinkBtn");

const globalMessage = document.getElementById("globalMessage");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const crudForm = document.getElementById("crudForm");

const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", init);

async function init() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {
        showLoginMessage(
            "Supabase client tidak ditemukan. Periksa supabase-config.js."
        );

        return;
    }

    bindEvents();

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();

    if (session) {
        await handleAuthenticated(session);
    } else {
        showLogin();
    }

    supabaseClient.auth.onAuthStateChange(
        async (_event, session) => {

            if (session) {
                await handleAuthenticated(session);
            } else {
                showLogin();
            }

        }
    );
}


// ============================================================
// EVENTS
// ============================================================

function bindEvents() {

    loginForm.addEventListener(
        "submit",
        handleLogin
    );

    logoutBtn.addEventListener(
        "click",
        handleLogout
    );

    addCardBtn.addEventListener(
        "click",
        () => openCardModal()
    );

    addGroupBtn.addEventListener(
        "click",
        () => openGroupModal()
    );

    addLinkBtn.addEventListener(
        "click",
        () => openLinkModal()
    );

    closeModalBtn.addEventListener(
        "click",
        closeModal
    );

    cancelModalBtn.addEventListener(
        "click",
        closeModal
    );

    document
        .querySelector(".modal-backdrop")
        .addEventListener(
            "click",
            closeModal
        );

    crudForm.addEventListener(
        "submit",
        handleCrudSubmit
    );

}


// ============================================================
// AUTH
// ============================================================

async function handleLogin(event) {

    event.preventDefault();

    clearLoginMessage();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showLoginMessage(
            "Email dan password wajib diisi."
        );

        return;
    }

    setLoginLoading(true);

    const {
        error
    } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    setLoginLoading(false);

    if (error) {

        showLoginMessage(
            `Login gagal: ${error.message}`
        );

        return;
    }

}


async function handleAuthenticated(session) {

    try {

        const isAdmin = await checkAdmin(
            session.user.id
        );

        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            showLoginMessage(
                "Akun berhasil login tetapi belum terdaftar sebagai admin."
            );

            return;
        }

        currentUser.textContent =
            session.user.email || "Admin";

        showAdmin();

        await loadAllData();

    } catch (error) {

        console.error(error);

        showLoginMessage(
            `Gagal memverifikasi admin: ${error.message}`
        );

    }

}


async function checkAdmin(userId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("admins")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return Boolean(data);
}


async function handleLogout() {

    const {
        error
    } = await supabaseClient.auth.signOut();

    if (error) {

        showGlobalMessage(
            `Logout gagal: ${error.message}`
        );

        return;
    }

    showLogin();

}


// ============================================================
// VIEW
// ============================================================

function showLogin() {

    loginView.classList.remove("hidden");
    adminView.classList.add("hidden");

}


function showAdmin() {

    loginView.classList.add("hidden");
    adminView.classList.remove("hidden");

}


function setLoginLoading(loading) {

    const button =
        loginForm.querySelector("button[type='submit']");

    button.disabled = loading;
    button.textContent =
        loading ? "Memeriksa..." : "Masuk";

}


function showLoginMessage(message) {

    loginMessage.textContent = message;

}


function clearLoginMessage() {

    loginMessage.textContent = "";

}


function showGlobalMessage(message) {

    globalMessage.textContent = message;

    clearTimeout(
        showGlobalMessage.timer
    );

    showGlobalMessage.timer =
        setTimeout(() => {
            globalMessage.textContent = "";
        }, 4000);

}


// ============================================================
// LOAD DATA
// ============================================================

async function loadAllData() {

    showGlobalMessage(
        "Memuat data Supabase..."
    );

    const [
        cardsResult,
        groupsResult,
        linksResult
    ] = await Promise.all([

        supabaseClient
            .from("cards")
            .select("*")
            .order("sort_order", {
                ascending: true
            }),

        supabaseClient
            .from("link_groups")
            .select("*")
            .order("sort_order", {
                ascending: true
            }),

        supabaseClient
            .from("links")
            .select("*")
            .order("sort_order", {
                ascending: true
            })

    ]);


    if (cardsResult.error) {
        throw cardsResult.error;
    }

    if (groupsResult.error) {
        throw groupsResult.error;
    }

    if (linksResult.error) {
        throw linksResult.error;
    }


    cards = cardsResult.data || [];
    groups = groupsResult.data || [];
    links = linksResult.data || [];


    updateSummary();

    renderCards();
    renderGroups();
    renderLinks();

    showGlobalMessage(
        "Data berhasil dimuat."
    );

}


// ============================================================
// SUMMARY
// ============================================================

function updateSummary() {

    cardCount.textContent = cards.length;
    groupCount.textContent = groups.length;
    linkCount.textContent = links.length;

}


// ============================================================
// HELPERS
// ============================================================

function getNextSortOrder(items) {

    if (!items.length) {
        return 0;
    }

    return Math.max(
        ...items.map(
            item => Number(item.sort_order) || 0
        )
    ) + 1;

}


function getCardTitle(cardId) {

    const card = cards.find(
        item => item.id === cardId
    );

    return card
        ? card.title
        : "(Card tidak ditemukan)";

}


function getGroupLabel(groupId) {

    const group = groups.find(
        item => item.id === groupId
    );

    if (!group) {
        return "(Group tidak ditemukan)";
    }

    const year =
        group.year === null ||
        group.year === undefined
            ? "Tanpa tahun"
            : group.year;

    return `${getCardTitle(group.card_id)} → ${year}`;

}


function createElement(
    tag,
    text = ""
) {

    const element =
        document.createElement(tag);

    element.textContent = text;

    return element;

}


function createButton(
    text,
    className,
    handler
) {

    const button =
        document.createElement("button");

    button.type = "button";
    button.className =
        `btn btn-small ${className}`;

    button.textContent = text;

    button.addEventListener(
        "click",
        handler
    );

    return button;

}


// ============================================================
// RENDER CARDS
// ============================================================

function renderCards() {

    cardsContainer.replaceChildren();

    if (!cards.length) {

        cardsContainer.appendChild(
            createElement(
                "div",
                "Belum ada card."
            )
        );

        cardsContainer.firstChild.className =
            "empty";

        return;
    }


    cards.forEach(card => {

        const row =
            createElement("div");

        row.className = "data-row";


        const main =
            createElement("div");

        main.className = "data-main";


        const title =
            createElement("div");

        title.className = "data-title";

        title.append(
            createElement(
                "span",
                card.icon || "📁"
            ),

            createElement(
                "span",
                card.title
            )
        );


        const meta =
            createElement("div");

        meta.className = "data-meta";

        meta.append(

            createElement(
                "span",
                `ID: ${card.id}`
            ),

            createElement(
                "span",
                `Urutan: ${card.sort_order}`
            ),

            createElement(
                "span",
                card.scrollable
                    ? "Scrollable"
                    : "Tidak scrollable"
            ),

            createElement(
                "span",
                `${groups.filter(
                    group =>
                        group.card_id === card.id
                ).length} group`
            )

        );


        main.append(
            title,
            meta
        );


        const actions =
            createElement("div");

        actions.className =
            "data-actions";


        actions.append(

            createButton(
                "Edit",
                "btn-secondary",
                () => openCardModal(card)
            ),

            createButton(
                "Hapus",
                "btn-danger",
                () => deleteCard(card)
            )

        );


        row.append(
            main,
            actions
        );

        cardsContainer.appendChild(row);

    });

}


// ============================================================
// RENDER GROUPS
// ============================================================

function renderGroups() {

    groupsContainer.replaceChildren();

    if (!groups.length) {

        const empty =
            createElement(
                "div",
                "Belum ada group."
            );

        empty.className = "empty";

        groupsContainer.appendChild(empty);

        return;
    }


    groups.forEach(group => {

        const row =
            createElement("div");

        row.className = "data-row";


        const main =
            createElement("div");

        main.className = "data-main";


        const title =
            createElement(
                "div"
            );

        title.className =
            "data-title";


        title.appendChild(
            createElement(
                "span",
                group.year === null
                    ? "📁"
                    : `📅 ${group.year}`
            )
        );


        const meta =
            createElement(
                "div"
            );

        meta.className =
            "data-meta";


        meta.append(

            createElement(
                "span",
                getCardTitle(
                    group.card_id
                )
            ),

            createElement(
                "span",
                `Urutan: ${group.sort_order}`
            ),

            createElement(
                "span",
                `${links.filter(
                    link =>
                        link.group_id === group.id
                ).length} link`
            )

        );


        main.append(
            title,
            meta
        );


        const actions =
            createElement("div");

        actions.className =
            "data-actions";


        actions.append(

            createButton(
                "Edit",
                "btn-secondary",
                () => openGroupModal(group)
            ),

            createButton(
                "Hapus",
                "btn-danger",
                () => deleteGroup(group)
            )

        );


        row.append(
            main,
            actions
        );

        groupsContainer.appendChild(row);

    });

}


// ============================================================
// RENDER LINKS
// ============================================================

function renderLinks() {

    linksContainer.replaceChildren();

    if (!links.length) {

        const empty =
            createElement(
                "div",
                "Belum ada link."
            );

        empty.className = "empty";

        linksContainer.appendChild(empty);

        return;
    }


    links.forEach(link => {

        const row =
            createElement("div");

        row.className = "data-row";


        const main =
            createElement("div");

        main.className =
            "data-main";


        const title =
            createElement(
                "div"
            );

        title.className =
            "data-title";

        title.appendChild(
            createElement(
                "span",
                link.label
            )
        );


        const meta =
            createElement(
                "div"
            );

        meta.className =
            "data-meta";


        meta.append(

            createElement(
                "span",
                getGroupLabel(
                    link.group_id
                )
            ),

            createElement(
                "span",
                `Urutan: ${link.sort_order}`
            )

        );


        if (link.target_blank) {

            const badge =
                createElement(
                    "span",
                    "New Tab"
                );

            badge.className =
                "badge";

            meta.appendChild(badge);

        }


        if (link.action) {

            const badge =
                createElement(
                    "span",
                    `Action: ${link.action}`
                );

            badge.className =
                "badge";

            meta.appendChild(badge);

        }


        const url =
            createElement(
                "div",
                link.href
            );

        url.className =
            "link-url";

        meta.appendChild(url);


        main.append(
            title,
            meta
        );


        const actions =
            createElement("div");

        actions.className =
            "data-actions";


        actions.append(

            createButton(
                "Edit",
                "btn-secondary",
                () => openLinkModal(link)
            ),

            createButton(
                "Hapus",
                "btn-danger",
                () => deleteLink(link)
            )

        );


        row.append(
            main,
            actions
        );

        linksContainer.appendChild(row);

    });

}


// ============================================================
// MODAL
// ============================================================

function openModal(
    title,
    mode,
    id = null
) {

    modalTitle.textContent = title;

    modalMode = mode;
    editingId = id;

    modal.classList.remove("hidden");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeModal() {

    modal.classList.add("hidden");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    modalBody.replaceChildren();

    modalMode = null;
    editingId = null;

}


// ============================================================
// CARD FORM
// ============================================================

function openCardModal(card = null) {

    const isEdit =
        Boolean(card);

    openModal(
        isEdit
            ? "Edit Card"
            : "Tambah Card",
        isEdit
            ? "edit-card"
            : "add-card",
        card?.id || null
    );


    modalBody.innerHTML = `
        <div class="form-grid">

            <div class="form-group">
                <label for="cardId">
                    ID Card
                </label>

                <input
                    id="cardId"
                    type="text"
                    required
                    ${isEdit ? "readonly" : ""}
                    value="${escapeHtmlAttribute(
                        card?.id || ""
                    )}"
                    placeholder="contoh: operasional"
                >
            </div>


            <div class="form-group">
                <label for="cardTitle">
                    Judul
                </label>

                <input
                    id="cardTitle"
                    type="text"
                    required
                    value="${escapeHtmlAttribute(
                        card?.title || ""
                    )}"
                    placeholder="Operasional"
                >
            </div>


            <div class="form-group">
                <label for="cardIcon">
                    Icon
                </label>

                <input
                    id="cardIcon"
                    type="text"
                    value="${escapeHtmlAttribute(
                        card?.icon || ""
                    )}"
                    placeholder="📊"
                >
            </div>


            <div class="form-group">
                <label for="cardSortOrder">
                    Urutan
                </label>

                <input
                    id="cardSortOrder"
                    type="number"
                    value="${Number(
                        card?.sort_order ??
                        getNextSortOrder(cards)
                    )}"
                >
            </div>


            <div class="form-group full">

                <label class="checkbox-group">

                    <input
                        id="cardScrollable"
                        type="checkbox"
                        ${
                            card?.scrollable
                                ? "checked"
                                : ""
                        }
                    >

                    Card menggunakan scroll

                </label>

            </div>

        </div>
    `;

}


// ============================================================
// GROUP FORM
// ============================================================

function openGroupModal(group = null) {

    const isEdit =
        Boolean(group);

    openModal(
        isEdit
            ? "Edit Group"
            : "Tambah Group",
        isEdit
            ? "edit-group"
            : "add-group",
        group?.id || null
    );


    const cardOptions =
        cards.map(card => `
            <option
                value="${escapeHtmlAttribute(
                    card.id
                )}"
                ${
                    group?.card_id === card.id
                        ? "selected"
                        : ""
                }
            >
                ${escapeHtml(
                    card.icon || ""
                )}
                ${escapeHtml(
                    card.title
                )}
            </option>
        `).join("");


    modalBody.innerHTML = `
        <div class="form-grid">

            <div class="form-group full">

                <label for="groupCard">
                    Card
                </label>

                <select
                    id="groupCard"
                    required
                >
                    <option value="">
                        Pilih Card
                    </option>

                    ${cardOptions}

                </select>

            </div>


            <div class="form-group">

                <label for="groupYear">
                    Tahun
                </label>

                <input
                    id="groupYear"
                    type="number"
                    min="2000"
                    max="2100"
                    value="${
                        group?.year ??
                        ""
                    }"
                    placeholder="Kosongkan jika bukan tahun"
                >

            </div>


            <div class="form-group">

                <label for="groupSortOrder">
                    Urutan
                </label>

                <input
                    id="groupSortOrder"
                    type="number"
                    value="${Number(
                        group?.sort_order ??
                        getNextSortOrder(groups)
                    )}"
                >

            </div>

        </div>
    `;

}


// ============================================================
// LINK FORM
// ============================================================

function openLinkModal(link = null) {

    const isEdit =
        Boolean(link);

    openModal(
        isEdit
            ? "Edit Link"
            : "Tambah Link",
        isEdit
            ? "edit-link"
            : "add-link",
        link?.id || null
    );


    const groupOptions =
        groups.map(group => {

            const year =
                group.year === null
                    ? "Tanpa tahun"
                    : group.year;

            const cardTitle =
                getCardTitle(
                    group.card_id
                );

            return `
                <option
                    value="${escapeHtmlAttribute(
                        group.id
                    )}"
                    ${
                        link?.group_id === group.id
                            ? "selected"
                            : ""
                    }
                >
                    ${escapeHtml(
                        cardTitle
                    )}
                    → ${escapeHtml(
                        String(year)
                    )}
                </option>
            `;

        }).join("");


    modalBody.innerHTML = `
        <div class="form-grid">

            <div class="form-group full">

                <label for="linkGroup">
                    Group
                </label>

                <select
                    id="linkGroup"
                    required
                >

                    <option value="">
                        Pilih Group
                    </option>

                    ${groupOptions}

                </select>

            </div>


            <div class="form-group full">

                <label for="linkLabel">
                    Label
                </label>

                <input
                    id="linkLabel"
                    type="text"
                    required
                    value="${escapeHtmlAttribute(
                        link?.label || ""
                    )}"
                    placeholder="Memo Pengiriman"
                >

            </div>


            <div class="form-group full">

                <label for="linkHref">
                    URL / Href
                </label>

                <input
                    id="linkHref"
                    type="text"
                    required
                    value="${escapeHtmlAttribute(
                        link?.href || ""
                    )}"
                    placeholder="https://..."
                >

            </div>


            <div class="form-group">

                <label for="linkClassName">
                    Class CSS
                </label>

                <input
                    id="linkClassName"
                    type="text"
                    value="${escapeHtmlAttribute(
                        link?.class_name || ""
                    )}"
                    placeholder="kabur-source"
                >

            </div>


            <div class="form-group">

                <label for="linkAction">
                    Action
                </label>

                <input
                    id="linkAction"
                    type="text"
                    value="${escapeHtmlAttribute(
                        link?.action || ""
                    )}"
                    placeholder="openDrawing"
                >

            </div>


            <div class="form-group">

                <label for="linkSortOrder">
                    Urutan
                </label>

                <input
                    id="linkSortOrder"
                    type="number"
                    value="${Number(
                        link?.sort_order ??
                        getNextSortOrder(links)
                    )}"
                >

            </div>


            <div class="form-group">

                <label class="checkbox-group">

                    <input
                        id="linkTargetBlank"
                        type="checkbox"
                        ${
                            link?.target_blank
                                ? "checked"
                                : ""
                        }
                    >

                    Buka di tab baru

                </label>

            </div>

        </div>
    `;

}


// ============================================================
// CRUD SUBMIT
// ============================================================

async function handleCrudSubmit(event) {

    event.preventDefault();

    try {

        switch (modalMode) {

            case "add-card":
                await createCard();
                break;

            case "edit-card":
                await updateCard();
                break;

            case "add-group":
                await createGroup();
                break;

            case "edit-group":
                await updateGroup();
                break;

            case "add-link":
                await createLink();
                break;

            case "edit-link":
                await updateLink();
                break;

            default:
                throw new Error(
                    "Mode CRUD tidak dikenali."
                );

        }

        closeModal();

        await loadAllData();

        showGlobalMessage(
            "Data berhasil disimpan."
        );

    } catch (error) {

        console.error(error);

        alert(
            `Gagal menyimpan data:\n\n${error.message}`
        );

    }

}


// ============================================================
// CARD CRUD
// ============================================================

async function createCard() {

    const id =
        document
            .getElementById("cardId")
            .value
            .trim();

    const title =
        document
            .getElementById("cardTitle")
            .value
            .trim();

    const icon =
        document
            .getElementById("cardIcon")
            .value
            .trim();

    const sortOrder =
        Number(
            document
                .getElementById("cardSortOrder")
                .value
        );

    const scrollable =
        document
            .getElementById("cardScrollable")
            .checked;


    if (!id || !title) {

        throw new Error(
            "ID dan judul card wajib diisi."
        );

    }


    const {
        error
    } = await supabaseClient
        .from("cards")
        .insert({

            id,
            title,
            icon: icon || null,
            scrollable,
            sort_order: sortOrder

        });


    if (error) {
        throw error;
    }

}


async function updateCard() {

    const title =
        document
            .getElementById("cardTitle")
            .value
            .trim();

    const icon =
        document
            .getElementById("cardIcon")
            .value
            .trim();

    const sortOrder =
        Number(
            document
                .getElementById("cardSortOrder")
                .value
        );

    const scrollable =
        document
            .getElementById("cardScrollable")
            .checked;


    if (!title) {

        throw new Error(
            "Judul card wajib diisi."
        );

    }


    const {
        error
    } = await supabaseClient
        .from("cards")
        .update({

            title,
            icon: icon || null,
            scrollable,
            sort_order: sortOrder

        })
        .eq("id", editingId);


    if (error) {
        throw error;
    }

}


// ============================================================
// GROUP CRUD
// ============================================================

async function createGroup() {

    const cardId =
        document
            .getElementById("groupCard")
            .value;

    const yearRaw =
        document
            .getElementById("groupYear")
            .value
            .trim();

    const sortOrder =
        Number(
            document
                .getElementById("groupSortOrder")
                .value
        );


    if (!cardId) {

        throw new Error(
            "Card wajib dipilih."
        );

    }


    const year =
        yearRaw === ""
            ? null
            : Number(yearRaw);


    const {
        error
    } = await supabaseClient
        .from("link_groups")
        .insert({

            card_id: cardId,
            year,
            sort_order: sortOrder

        });


    if (error) {
        throw error;
    }

}


async function updateGroup() {

    const cardId =
        document
            .getElementById("groupCard")
            .value;

    const yearRaw =
        document
            .getElementById("groupYear")
            .value
            .trim();

    const sortOrder =
        Number(
            document
                .getElementById("groupSortOrder")
                .value
        );


    if (!cardId) {

        throw new Error(
            "Card wajib dipilih."
        );

    }


    const year =
        yearRaw === ""
            ? null
            : Number(yearRaw);


    const {
        error
    } = await supabaseClient
        .from("link_groups")
        .update({

            card_id: cardId,
            year,
            sort_order: sortOrder

        })
        .eq("id", editingId);


    if (error) {
        throw error;
    }

}


// ============================================================
// LINK CRUD
// ============================================================

async function createLink() {

    const groupId =
        document
            .getElementById("linkGroup")
            .value;

    const label =
        document
            .getElementById("linkLabel")
            .value
            .trim();

    const href =
        document
            .getElementById("linkHref")
            .value
            .trim();

    const className =
        document
            .getElementById("linkClassName")
            .value
            .trim();

    const action =
        document
            .getElementById("linkAction")
            .value
            .trim();

    const sortOrder =
        Number(
            document
                .getElementById("linkSortOrder")
                .value
        );

    const targetBlank =
        document
            .getElementById("linkTargetBlank")
            .checked;


    if (!groupId || !label || !href) {

        throw new Error(
            "Group, label, dan href wajib diisi."
        );

    }


    const {
        error
    } = await supabaseClient
        .from("links")
        .insert({

            group_id: groupId,
            label,
            href,
            target_blank: targetBlank,
            class_name:
                className || null,
            action:
                action || null,
            sort_order: sortOrder

        });


    if (error) {
        throw error;
    }

}


async function updateLink() {

    const groupId =
        document
            .getElementById("linkGroup")
            .value;

    const label =
        document
            .getElementById("linkLabel")
            .value
            .trim();

    const href =
        document
            .getElementById("linkHref")
            .value
            .trim();

    const className =
        document
            .getElementById("linkClassName")
            .value
            .trim();

    const action =
        document
            .getElementById("linkAction")
            .value
            .trim();

    const sortOrder =
        Number(
            document
                .getElementById("linkSortOrder")
                .value
        );

    const targetBlank =
        document
            .getElementById("linkTargetBlank")
            .checked;


    if (!groupId || !label || !href) {

        throw new Error(
            "Group, label, dan href wajib diisi."
        );

    }


    const {
        error
    } = await supabaseClient
        .from("links")
        .update({

            group_id: groupId,
            label,
            href,
            target_blank: targetBlank,
            class_name:
                className || null,
            action:
                action || null,
            sort_order: sortOrder

        })
        .eq("id", editingId);


    if (error) {
        throw error;
    }

}


// ============================================================
// DELETE CARD
// ============================================================

async function deleteCard(card) {

    const groupCount =
        groups.filter(
            group =>
                group.card_id === card.id
        ).length;


    const linkCount =
        groups
            .filter(
                group =>
                    group.card_id === card.id
            )
            .reduce(
                (total, group) =>
                    total +
                    links.filter(
                        link =>
                            link.group_id === group.id
                    ).length,
                0
            );


    const confirmed =
        confirm(
            `Hapus card "${card.title}"?\n\n` +
            `${groupCount} group dan ` +
            `${linkCount} link akan ikut terhapus.\n\n` +
            `Operasi ini tidak bisa dibatalkan.`
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("cards")
        .delete()
        .eq("id", card.id);


    if (error) {
        alert(
            `Gagal menghapus card:\n\n${error.message}`
        );

        return;
    }


    await loadAllData();

    showGlobalMessage(
        "Card berhasil dihapus."
    );

}


// ============================================================
// DELETE GROUP
// ============================================================

async function deleteGroup(group) {

    const childLinks =
        links.filter(
            link =>
                link.group_id === group.id
        ).length;


    const confirmed =
        confirm(
            `Hapus group "${getGroupLabel(group.id)}"?\n\n` +
            `${childLinks} link akan ikut terhapus.\n\n` +
            `Operasi ini tidak bisa dibatalkan.`
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("link_groups")
        .delete()
        .eq("id", group.id);


    if (error) {

        alert(
            `Gagal menghapus group:\n\n${error.message}`
        );

        return;
    }


    await loadAllData();

    showGlobalMessage(
        "Group berhasil dihapus."
    );

}


// ============================================================
// DELETE LINK
// ============================================================

async function deleteLink(link) {

    const confirmed =
        confirm(
            `Hapus link "${link.label}"?\n\n` +
            `Link akan dihapus dari portal.\n\n` +
            `Lanjutkan?`
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("links")
        .delete()
        .eq("id", link.id);


    if (error) {

        alert(
            `Gagal menghapus link:\n\n${error.message}`
        );

        return;
    }


    await loadAllData();

    showGlobalMessage(
        "Link berhasil dihapus."
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeHtmlAttribute(value) {

    return escapeHtml(value);

}