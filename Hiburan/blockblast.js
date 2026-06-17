const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyBCbCI6hxv6AFp_H_wzSPOYQA51pAMOgMnwCTvob0Qde81454kjOS0c9ivwIkcqjEe9g/exec"

let score = 0;
let isGameOver = false;

let gameBoard = Array(8).fill().map(() =>
    Array(8).fill(0)
);

const pieces = [
    [[1]], //1 kotak kecil
    [[1,1]], //2 kotak tidur
    [[1,1,1]], //3 kotak tidur
    [[1],[1]], //2 kotak ngaceng
    [[1],[1],[1]], //3 kotak ngaceng
    [[1,1],[1,1]], //4 kotak
    [[1,1,1,1]], //4 kotak tidur
    [[1],[1],[1],[1]], //4 kotak ngaceng
    [[1,1,1],[1,1,1]], //3x2
    [[1,1,1],[1,0,1]], //u
    [[1,0,1],[1,1,1]], //n
    [[0,1,0],[1,1,1]], //T
    [[1,1,1],[0,1,0]], //T kebalik
    [[1,1,1],[1,1,1],[1,1,1]], //9 kotak
    [[1,1,1],[1,0,1],[1,1,1]], //9 kotak bolong
    [[0,1,0],[1,1,1],[0,1,0]], // +
    [[0,1,],[1,1],[0,1,]], // T kiri
    [[1,0,],[1,1],[1,0,]], // T kanan
    [[1,1,],[1,0,],[1,1,]], //c
    [[1,1,],[0,1,],[1,1,]], //c kebalik
    [[1,1,],[1,1,],[1,1,]] // 2x3



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
// fitur baru
           //ell.dataset.row = row;
           //ell.dataset.col = col;
// batas fitur baru
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

function animasiClear(cells){

    cells.forEach(pos => {

        const target =
            document.querySelector(
                `[data-row="${pos.row}"][data-col="${pos.col}"]`
            );

        if(target){
            target.classList.add("clearing");
        }
    });
    // fitur baru
    navigator.vibrate?.(80);
    // batas fitur


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

    let clearCells = [];

    for(let row=0; row<8; row++){

        if(gameBoard[row].every(cell => cell)){

            for(let col=0; col<8; col++){

                clearCells.push({
                    row:row,
                    col:col
                });
            }

            gameBoard[row].fill(0);

            score += 100;
        }
    }

    for(let col=0; col<8; col++){

        let penuh = true;

        for(let row=0; row<8; row++){

            if(gameBoard[row][col]===0){

                penuh = false;

                break;
            }
        }

        if(penuh){

            for(let row=0; row<8; row++){

                clearCells.push({
                    row:row,
                    col:col
                });

                gameBoard[row][col]=0;
            }

            score += 100;
        }
    }

    animasiClear(clearCells);
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
      ).value || "Takut HRD";

fetch(WEBAPP_URL,{
    method:"POST",
    body:JSON.stringify({
        nama:nama,
        score:score
    })
})
.then(() => {

    setTimeout(() => {

        loadLeaderboard();

    },1000);

})
.catch(err =>
    console.log(err)
);
}

async function loadLeaderboard(){

    try{

        const res = await fetch(
            "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnTevQfnnmolwoa5N02B-yczf_lG1-CHtohN5UQw1UnMqumZDtbzsDbSvjdTEApm3APo_OtLMKyaU6FrGOlL3elBb9PiwnU0AvItiTQWVPJiIAgkxF9EXzQFVMH4SFHU41CNbMZ2XQf9Prpaq3xMkokks9sRo2frC2z-YeZya6ESHYDpSpamB8lmX6gwVGnE3miMAaOLage-RWTAyxFFu_1NZVdj4QfpNm7A35q-Ka18LKD4a2U2NC-X_3MbubyHorkD7t34oa-9aNKnn_RjnWljYZRbsA&lib=MkvDQCDpHH6igHxnD9y4T78wcaYvkCzHp"
        );

        const data = await res.json();

        // Hall of Fame
        let fameHtml = "";

        data
            .sort((a,b)=>b.score-a.score)
            .slice(0,10)
            .forEach((p,i)=>{

                fameHtml +=
                    `${i+1}. ${p.nama} - ${p.score}<br>`;

            });

        document
            .getElementById("fame")
            .innerHTML = fameHtml;

        // Hall of Shame
        let shameHtml = "";

        [...data]
            .sort((a,b)=>a.score-b.score)
            .slice(0,10)
            .forEach((p,i)=>{

                shameHtml +=
                    `${i+1}. ${p.nama} - ${p.score}<br>`;

            });

        document
            .getElementById("shame")
            .innerHTML = shameHtml;

    }catch(err){

        console.error(
            "Leaderboard error:",
            err
        );

    }
}

loadLeaderboard();

