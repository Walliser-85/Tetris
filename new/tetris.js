const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const startBtnl = document.getElementById('startBtnl');
const startBtnm = document.getElementById('startBtnm');
const startBtns = document.getElementById('startBtns');
const rangliste = document.getElementById('rangliste');
const zurBtn = document.getElementById('zurück');
const stopBtn = document.getElementById('stop');
const weiterBtn = document.getElementById('weiter');
const rangTitel=document.getElementById('rangTitel');
const rang1=document.getElementById('rang1');
const rang2=document.getElementById('rang2');
const rang3=document.getElementById('rang3');
const rang1z=document.getElementById('rang1z');
const rang2z=document.getElementById('rang2z');
const rang3z=document.getElementById('rang3z');
const nameInput=document.getElementById('nameInput');
const nameInputDiv=document.getElementById('nameI');
const nameAnzeige=document.getElementById('nameAnzeige');
const audioL=document.getElementById('audiofileLine');
const audioGO=document.getElementById('audiofileGameOver');
context.scale(20, 20);

let dropCounter = 0;
let dropInterval = 1000;
let levelGame = 'l';
let points = 10;
let pause = false;
let firstRang = 'no one';
let secondRang = 'no one';
let thirdRang = 'no one';
let firstPoints = 0;
let secondPoints  = 0;
let thirdPoints  = 0;
let namePlayer = '';
let countLines = 0;

//bild für Rakete laden
function loadMedia() {
    raketenBild = new Image();
    raketenBild.src = 'raketen.png';
}

//RaketenFunktion
function rakete() {
    context.drawImage(raketenBild,arena[0].length/2, arena.length, 30,30 );
}

//Schaut, ob eine Linie voll ist
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        linieMusic();

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        countLines++;
        player.score += rowCount * points;
        rowCount *= 2;
    }
    if (countLines >= 10) {
        dropInterval=dropInterval-20;
    }
}
//ob man zuoberst ankommt
function collide(arena, player) {
    const m = player.matrix;
    const o =player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
//Matrix mit 0en
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
//Figuren erstellen
function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}
//Figur zeichnen
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                //Füllung von der Zelle
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                    y + offset.y,
                    1, 1);
            }
        });
    });
}
//das Hauptviereck Zeichnen, das Canvas
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
//Figur drehen
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}
//Wenn eine Figur runter kommt automatisch oder wenn Taste gedrückt
function playerDrop() {
    if (pause){
        return;
    }
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}
//Figur wird bewegt wenn tasten gerückt werden
function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}
//neue Figur kommt runter
function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    //wenn zuoberst angekommen---------------------game over----------------------------------
    if (collide(arena, player)) {
        gameOverMusic();
        ranglisteAktuellisieren();
        rakete();
        ranglisteAnzeigen();
        pause=true;
        pauseMusic();
    }
}
//Figur drehen, ohne das sie Rand/Figuren überschreitet
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}



let lastTime = 0;
function update(time = 0) {

    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    if (pause){
        return;
    }
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 32) {
        playerRotate(1);
    }
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};
function startGameAgain() {
    // Bildschirm leeren
    arena.forEach(row => row.fill(0));
    player.score = 0;
    namePlayer='default';
    updateScore();
}
// wenn start button gedrückt wird
function startGame(level){
    startGameAgain();
    playMusic();
    startBtnl.style.display = 'none';
    startBtnm.style.display = 'none';
    startBtns.style.display = 'none';
    rangliste.style.display = 'none';
    nameInputDiv.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    if(level == 'm'){
        dropInterval=500;
        points=12;
    }
    if(level == 's'){
        dropInterval=200;
        points=14;
    }
    namePlayer=nameInput.value;
    nameAnzeige.innerText=namePlayer;
    levelGame=level;
    loadMedia();
    playerReset();
    update();
    pause=false;
}

function stopGame() {
    pauseMusic();
    weiterBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    pause=true;
}

function weiterGame() {
    playMusic();
    weiterBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    pause=false;
}

function ranglisteAnzeigen() {
    startBtnl.style.display = 'none';
    startBtnm.style.display = 'none';
    startBtns.style.display = 'none';
    rangliste.style.display = 'none';
    nameInputDiv.style.display = 'none';
    zurBtn.style.display = 'inline-block';
    rangTitel.style.display = 'inline-block';
    //User im Rang
    rang1.innerText=firstRang;
    rang1.style.display = 'inline-block';
    rang2.innerText=secondRang;
    rang2.style.display = 'inline-block';
    rang3.innerText=thirdRang;
    rang3.style.display = 'inline-block';
    //Zahlen im Rang
    rang1z.innerText=firstPoints;
    rang1z.style.display = 'inline-block';
    rang2z.innerText=secondPoints;
    rang2z.style.display = 'inline-block';
    rang3z.innerText=thirdPoints;
    rang3z.style.display = 'inline-block';

}
function ranglisteAktuellisieren() {
    let temp='default';
    let tempS=0;
    if (player.score>thirdPoints) {
        if (player.score>secondPoints){
            if (player.score>firstPoints){
                //neuer 1. Platz
                temp=firstRang;
                tempS=firstPoints;
                firstRang=namePlayer;
                firstPoints=player.score;
                thirdRang=secondRang;
                thirdPoints=secondPoints;
                secondRang=temp;
                secondPoints=tempS;
            } else {
                //neuer 2. Platz
                thirdRang=secondRang;
                thirdPoints=secondPoints;
                secondRang=namePlayer;
                secondPoints=player.score;
            }
        } else{
            //neuer 3. Platz
            thirdRang=namePlayer;
            thirdPoints=player.score;
        }
    }

}
function zurück() {
    startBtnl.style.display = 'inline-block';
    startBtnm.style.display = 'inline-block';
    startBtns.style.display = 'inline-block';
    rangliste.style.display = 'inline-block';
    nameInputDiv.style.display = 'inline-block';
    zurBtn.style.display = 'none';
    rangTitel.style.display = 'none';
    //ausblenden
    //User im Rang
    rang1.style.display = 'none';
    rang2.style.display = 'none';
    rang3.style.display = 'none';
    //Zahlen im Rang
    rang1z.style.display = 'none';
    rang2z.style.display = 'none';
    rang3z.style.display = 'none';
}

function playMusic(){
    audiofile.play();
    audiofile.addEventListener("ended", function(){
        audiofile.play();
    });
}

function pauseMusic(){
    audiofile.pause();
}

function linieMusic(){
    audioL.play();
}

function gameOverMusic(){
    audioGO.play();
}

updateScore();
