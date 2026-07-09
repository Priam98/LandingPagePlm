const years = document.querySelectorAll('.year-btn');

years.forEach(button => {

    button.addEventListener('click', () => {

        const content =
            button.nextElementSibling;

        content.classList.toggle('active');

        if(content.classList.contains('active')){
            button.innerHTML =
            button.innerHTML.replace('▶','▼');
        }else{
            button.innerHTML =
            button.innerHTML.replace('▼','▶');
        }

    });

});

/*
const tombolKabur = 
document.querySelector('.kabur');
document.addEventListener('mousemove', (e) =>{
    const rect = tombolKabur.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const jarak = Math.sqrt(dx*dx + dy*dy);
    const pesan = ["Hayoo ngapain", "Kepooo yaaa", "Ga boleh ngintip lho", "Nah loh...."];
    if (jarak < 150) {tombolKabur.style.transform = `translate(${-dx*3}px, ${-dy*3}px)`;
                      tombolKabur.textContent =
                          pesan[Math.floor(Math.random() * pesan.length)]
                     }
});
*/
                          
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
        window.location.href = "laporan keuangan.html";
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
    footer: "Powered by ChatGPT 🤖",
    confirmButtonText: "Oke"
});
};

function bukaDrawing(){
Swal.fire({
    title: "Masuk Shop Drawing?",
    html: `
        Anda akan memasuki area <b>Shop Drawing</b>.<br><br>
        ☕ Siapkan kopi jika ingin memahami gambar kerja.
    `,
    icon: "warning",
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

async function loadStatusAlat() {

    const res = await fetch(API + "?t=" + Date.now());
    const data = await res.json();

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

}

loadStatusAlat();

setInterval(loadStatusAlat, 60000);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        loadStatusAlat();
    }
});
