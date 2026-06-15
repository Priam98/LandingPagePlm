// catur.js

const game = new Chess();

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


function updateLeaderboard() {
    const fame = Object.entries(stats)
        .sort((a, b) => b[1].menang - a[1].menang);
    const shame = Object.entries(stats)
        .sort((a, b) => b[1].kalah - a[1].kalah);

    document.getElementById("hallOfFame").innerHTML =
        fame.slice(0, 5)
        .map(
            (x,i) => `${i+1}. ${x[0]} - ${x[1].menang} kemenangan`).join("<br>");
    document.getElementById("hallOfShame").innerHTML =
        shame.slice(0, 5)
        .map(
            (x,i) => `${i+1}. ${x[0]} - ${x[1].kalah} kekalahan`).join("<br>");
}

function tambahMenang() {
    if (!stats[playerName]) {
        stats[playerName] = { menang: 0, kalah: 0 };

}
    stats[playerName].menang++;
    localStorage.setItem("stats", JSON.stringify(stats));
    updateLeaderboard();
}

function tambahKalah() {
    if (!stats[playerName]) {
        stats[playerName] = { menang: 0, kalah: 0 };
    }
    stats[playerName].kalah++;
    localStorage.setItem("stats", JSON.stringify(stats));
    updateLeaderboard();
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

    let status = "";

    let gameSelesai = false;

    if (game.in_checkmate()) {

        if (game.turn() === 'w') {
            status = "Cih, CUPU😏";
            if (!gameSelesai) {gameSelesai = true;
            tambahKalah();
        } else {
            status = "Hoki doang😏";
            if (!gameSelesai) {gameSelesai=true;
            tambahMenang();}
        }}

    } else if (game.in_draw()) {

        status = "🤝 Remis.";

    } else {

        status =
            (game.turn() === 'w')
            ? "♔ Giliran lu, main yang putih, jangan blunder."
            : "♚ AI sedang mencari kesalahan gerakanmu, sabar ya.";
    }

    document.getElementById("status").innerText =
        status;
}

function newGame() {

    game.reset();

    board.start();

    document.getElementById("status").innerText =
        "Game baru dimulai.";

}

updateLeaderboard();
document.getElementById("playerName").value = playerName;