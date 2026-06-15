// catur.js

const game = new Chess();

const board = Chessboard('board', {
    draggable: true,
    position: 'start',
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
    onDrop: onDrop
});

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
            "go depth 20"
        );

    }, 200);
}

function cekStatus() {

    let status = "";

    if (game.in_checkmate()) {

        status = "💀 Checkmate.";

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