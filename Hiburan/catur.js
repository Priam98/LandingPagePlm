// catur.js

const game = new Chess();

let gameSelesai = false;
let kaburTercatat = false;

let playerName = localStorage.getItem("currentPlayer") || "Ga berani kasih nama";

let stats = JSON.parse(
    localStorage.getItem("stats")) || {}

function savePlayerName() {
    playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
        playerName = "Ga berani kasih nama";
    }
localStorage.setItem("currentPlayer", playerName);
    alert("Nama disimpan: " + playerName);
}
//hatihati
loadLeaderboard();


function tambahMenang() {
    if (!stats[playerName]) {
        stats[playerName] = { menang: 0, kalah: 0 };

}
    stats[playerName].menang++;
    localStorage.setItem("stats", JSON.stringify(stats));
    updateLeaderboard();
    fetch("https://script.google.com/macros/s/AKfycbwCFMJzeWu_gSdlKvWOxiSx15GtUNTErL3PWkbRV-VdDpYrLY0zZaS3w6LFl0XaH8l2jg/exec", {
        method: "POST",
        body: JSON.stringify({
            nama: playerName,
            hasil: "Menang"
      })});
}

function tambahKalah() {
    if (!stats[playerName]) {
        stats[playerName] = { menang: 0, kalah: 0 };
    }
    stats[playerName].kalah++;
    localStorage.setItem("stats", JSON.stringify(stats));
    updateLeaderboard();
    fetch("https://script.google.com/macros/s/AKfycbwCFMJzeWu_gSdlKvWOxiSx15GtUNTErL3PWkbRV-VdDpYrLY0zZaS3w6LFl0XaH8l2jg/exec", {
        method: "POST",
        body: JSON.stringify({
            nama: playerName,
            hasil: "Kalah"
        })
    });
}

function tambahKabur() {

    if (kaburTercatat) return;

    kaburTercatat = true;

    fetch("https://script.google.com/macros/s/AKfycbwCFMJzeWu_gSdlKvWOxiSx15GtUNTErL3PWkbRV-VdDpYrLY0zZaS3w6LFl0XaH8l2jg/exec", {
        method: "POST",
        body: JSON.stringify({
            nama: playerName,
            hasil: "Kabur",
            langkah: game.history().length
        })
    });
}


const board = Chessboard('board', {
    draggable: true,
    position: 'start',
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
    onDragStart: onDragStart,
    onDrop: onDrop
});

function onDragStart(source, piece, position, orientation) {
        // Game Selesai
        if (game.game_over()) return false;
        if (game.turn() !== 'w') return false;
        if (piece.startsWith('b')) return false;
    };
// Pakai Stockfish dari CDN
const engine = new Worker(
    "stockfish.js"
);

engine.onerror = function(event) {
    console.error("Stockfish worker error", event);
    document.getElementById("status").innerText =
        "Gagal memuat engine catur. Cek koneksi atau URL CDN.";
};

engine.postMessage("uci");

engine.onmessage = function(event) {

    const msg = event.data;
    console.log(msg);

    if (msg.startsWith("bestmove")) {

        const move = msg.split(" ")[1];

        if (move === "(none)") return;

        game.move({
            from: move.substring(0,2),
            to: move.substring(2,4),
            promotion: 'q'
        });

        board.position(game.fen());

        cekStatus();
    }
};

function onDrop(source, target) {

    const move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) {
        return 'snapback';
    }

    board.position(game.fen());

    cekStatus();

    setTimeout(() => {

        engine.postMessage(
            "position fen " + game.fen()
        );
// Pakai depth 5 untuk AI yang lebih manusiawi, atau depth 20 untuk AI yang lebih kuat (tapi lebih lambat)
        engine.postMessage(
            "go depth 12"
        );

    }, 200);
}

function cekStatus() {

if (game.in_checkmate()) {

    if (game.turn() === 'w') {

        status = "Cih, CUPU😏";

        if (!gameSelesai) {
            gameSelesai = true;
            tambahKalah();
        }

    } else {

        status = "Hoki doang😏";

        if (!gameSelesai) {
            gameSelesai = true;
            tambahMenang();
        }

    }

} else if (game.in_draw()) {

    gameSelesai = true;
    status = "🤝 Remis.";

} else {

    status =
        (game.turn() === 'w')
        ? "♔ Giliran lu, main yang putih, jangan blunder."
        : "♚ AI sedang mencari kesalahan gerakanmu, sabar ya.";

}
}

function newGame() {

    if (
        !gameSelesai &&
        game.history().length >= 10
    ) {

        tambahKabur();

    }

    gameSelesai = false;
    kaburTercatat = false;

    game.reset();

    board.start();

    document.getElementById("status").innerText =
        "Game baru dimulai.";

}

window.addEventListener("beforeunload", () => {

    if (
        !gameSelesai &&
        game.history().length >= 3
    ) {

        tambahKabur();

    }

});



updateLeaderboard();
document.getElementById("playerName").value = playerName;

async function loadLeaderboard() {

    const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxwBALVndYdzeQASDOaRERHIN06A8GJBXmfkY_30yQG23Ti-cbJUSOpTM80LAD4lO-7hQ/exec"
    );

    const data = await response.json();

    document.getElementById("hallOfFame").innerHTML =
        data.fame
        .filter(x => x[0])
        .map(
            (x,i)=>
            `${i+1}. ${x[0]} - ${x[1]} kemenangan`
        )
        .join("<br>");

    document.getElementById("hallOfShame").innerHTML =
        data.shame
        .filter(x => x[0])
        .map(
            (x,i)=>
            `${i+1}. ${x[0]} - ${x[1]} kekalahan`
        )
        .join("<br>");

    document.getElementById("kabur").innerHTML =
        data.kabur
        .filter(x => x[0])
        .map(
            (x,i)=>
            `${i+1}. ${x[0]} - ${x[1]} kali kabur`
        )
        .join("<br>");

}

loadLeaderboard();
