const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyBCbCI6hxv6AFp_H_wzSPOYQA51pAMOgMnwCTvob0Qde81454kjOS0c9ivwIkcqjEe9g/exec"

let score = 0;
let isGameOver = false;

let gameBoard = Array(8).fill().map(() =>
    Array(8).fill(0)
);

const pieces = [
    [[1]],
    [[1,1]],
    [[1,1,1]],
    [[1],[1]],
    [[1],[1],[1]],
    [[1,1],[1,1]]
];

let currentPiece = randomPiece();

function randomPiece(){
    return pieces[
        Math.floor(
            Math.random()*pieces.length
        )
    ];
}

function drawBoard(){

    board.innerHTML = "";

    for(let row=0; row<8; row++){

        for(let col=0; col<8; col++){

            const cell =
                document.createElement("div");

            cell.className = "cell";

            if(gameBoard[row][col]){
                cell.classList.add("filled");
            }

            cell.onclick =
                () => placePiece(row,col);

            board.appendChild(cell);
        }
    }

    scoreEl.innerText = score;
}

function drawPreview(){

    const preview =
        document.getElementById(
            "piecePreview"
        );

    preview.innerHTML = "";

    preview.style.display = "grid";

    preview.style.gridTemplateColumns =
        `repeat(${currentPiece[0].length},25px)`;

    for(let r=0;r<currentPiece.length;r++){

        for(let c=0;c<currentPiece[r].length;c++){

            const cell =
                document.createElement("div");

            cell.className =
                "preview-cell";

            if(currentPiece[r][c]){
                cell.classList.add(
                    "preview-filled"
                );
            }

            preview.appendChild(cell);
        }
    }
}

function canPlace(piece,row,col){

    for(let r=0;r<piece.length;r++){

        for(let c=0;c<piece[r].length;c++){

            if(piece[r][c]){

                let rr = row+r;
                let cc = col+c;

                if(rr>=8 || cc>=8){
                    return false;
                }

                if(gameBoard[rr][cc]){
                    return false;
                }
            }
        }
    }

    return true;
}

function placePiece(row,col){

    if(isGameOver){
        return;
    }

    if(!canPlace(
        currentPiece,
        row,
        col
    )){
        return;
    }

    for(let r=0;r<currentPiece.length;r++){

        for(let c=0;c<currentPiece[r].length;c++){

            if(currentPiece[r][c]){

                gameBoard[row+r][col+c] = 1;

                score++;
            }
        }
    }

    cekClear();

    currentPiece = randomPiece();

    drawBoard();
    drawPreview();

    if(gameOver()){

        kirimScore();

        isGameOver = true;

        alert(
            "💀 Game Over\nScore: " +
            score
        );
    }
}

function cekClear(){

    for(let row=0;row<8;row++){

        if(
            gameBoard[row].every(
                cell => cell
            )
        ){

            gameBoard[row].fill(0);

            score += 100;
        }
    }

    for(let col=0;col<8;col++){

        let penuh = true;

        for(let row=0;row<8;row++){

            if(
                gameBoard[row][col]===0
            ){

                penuh = false;

                break;
            }
        }

        if(penuh){

            for(let row=0;row<8;row++){

                gameBoard[row][col]=0;
            }

            score += 100;
        }
    }
}

function gameOver(){

    for(let row=0;row<8;row++){

        for(let col=0;col<8;col++){

            if(
                canPlace(
                    currentPiece,
                    row,
                    col
                )
            ){
                return false;
            }
        }
    }

    return true;
}

function newGame(){

    isGameOver = false;

    score = 0;

    gameBoard = Array(8)
        .fill()
        .map(() =>
            Array(8).fill(0)
        );

    currentPiece = randomPiece();

    drawBoard();
    drawPreview();
}

drawBoard();
drawPreview();

function kirimScore(){

    const nama =
      document.getElementById(
        "playerName"
      ).value || "Anonim";

    fetch(WEBAPP_URL,{
        method:"POST",
        body:JSON.stringify({
            nama:nama,
            score:score
        })
    })
    .catch(err =>
        console.log(err)
    );
}

