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
    "https://cdn.jsdelivr.net/gh/niklasf/stockfish.js@master/stockfish.js"
);

engine.onerror = function(event) {
    console.error("Stockfish worker error", event);
    document.getElementById("status").innerText =
        "Gagal memuat engine catur. Cek koneksi atau URL CDN.";
};

engine.postMessage("uci");

engine.onmessage = function(event) {

    const msg = event.data;

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

        engine.postMessage(
            "go depth 10"
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
            ? "♔ Putih jalan."
            : "♚ Hitam berpikir...";
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