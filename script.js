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
    alert(`Pencarian "${keyword}" tidak ditemukan.\n\n` + 
        "Coba tanya developer, dia lebih tahu di mana letak spreadsheetnya daripada aku😅\n\n" + 
        "Powered by ChatGPT");
};

function bukaDrawing(){
    const lanjut = confirm(
        "Anda akan memasuki area Shop Drawing.\n\n" +
        "Mohon jangan berharap banyak, karena ini masih dalam tahap pengembangan. Tapi tenang aja, kalau kamu klik OK, kamu akan diarahkan ke halaman yang sedang dalam proses pembuatan. Jadi, harap bersabar ya! Terima kasih atas pengertiannya!"
    );
    if (lanjut) {
        window.location.href = "shop drawing.html";
    }

};