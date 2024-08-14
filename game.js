const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const blockSize = 30; // Размер блока
context.scale(blockSize, blockSize);

const nextCanvases = [
    document.getElementById('next1').getContext('2d'),
    document.getElementById('next2').getContext('2d'),
    document.getElementById('next3').getContext('2d')
];

nextCanvases.forEach(ctx => ctx.scale(blockSize, blockSize)); // Масштабирование для канвасов следующего блока

let score = 0;

function arenaSweep() {
    let rowCount = 1;
    let linesCleared = 0;  // Переменная для подсчета очищенных линий
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        arena.splice(y, 1);  // Удаляем заполненную линию
        arena.unshift(new Array(arena[0].length).fill(0));  // Добавляем новую пустую линию сверху
        ++linesCleared;
        ++y;  // Увеличиваем y, чтобы снова проверить ту же строку, так как после удаления строки все строки сдвигаются вниз.
    }
    
    if (linesCleared > 0) {
        score += linesCleared * 1000;  // Увеличиваем счёт
        document.getElementById('score').textContent = "Score: " + score;  // Обновляем отображение счёта
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'I') {
        return [
            [
                [1, 1, 1, 1],
            ],
            [
                [1],
                [1],
                [1],
                [1],
            ],
            [
                [1, 1, 1, 1],
            ],
            [
                [1],
                [1],
                [1],
                [1],
            ]
        ];
    } else if (type === 'L') {
        return [
            [
                [0, 0, 1],
                [1, 1, 1],
            ],
            [
                [1, 0],
                [1, 0],
                [1, 1],
            ],
            [
                [1, 1, 1],
                [1, 0, 0],
            ],
            [
                [1, 1],
                [0, 1],
                [0, 1],
            ]
        ];
    } else if (type === 'J') {
        return [
            [
                [1, 0, 0],
                [1, 1, 1],
            ],
            [
                [1, 1],
                [1, 0],
                [1, 0],
            ],
            [
                [1, 1, 1],
                [0, 0, 1],
            ],
            [
                [0, 1],
                [0, 1],
                [1, 1],
            ]
        ];
    } else if (type === 'O') {
        return [
            [
                [1, 1],
                [1, 1],
            ],
            [
                [1, 1],
                [1, 1],
            ],
            [
                [1, 1],
                [1, 1],
            ],
            [
                [1, 1],
                [1, 1],
            ]
        ];
    } else if (type === 'Z') {
        return [
            [
                [1, 1, 0],
                [0, 1, 1],
            ],
            [
                [0, 1],
                [1, 1],
                [1, 0],
            ],
            [
                [1, 1, 0],
                [0, 1, 1],
            ],
            [
                [0, 1],
                [1, 1],
                [1, 0],
            ]
        ];
    } else if (type === 'S') {
        return [
            [
                [0, 1, 1],
                [1, 1, 0],
            ],
            [
                [1, 0],
                [1, 1],
                [0, 1],
            ],
            [
                [0, 1, 1],
                [1, 1, 0],
            ],
            [
                [1, 0],
                [1, 1],
                [0, 1],
            ]
        ];
    } else if (type === 'T') {
        return [
            [
                [0, 1, 0],
                [1, 1, 1],
            ],
            [
                [1, 0],
                [1, 1],
                [1, 0],
            ],
            [
                [1, 1, 1],
                [0, 1, 0],
            ],
            [
                [0, 1],
                [1, 1],
                [0, 1],
            ]
        ];
    }
}

function drawMatrix(matrix, offset, context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = 'rgba(255, 0, 0, 0.5)';
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0}, context);
    drawMatrix(player.matrix, player.pos, context);
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

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    player.pieces = nextPieces.shift(); // Берём первую фигуру из списка
    player.rotation = 0;
    player.matrix = player.pieces[player.rotation];
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    // Добавляем новую случайную фигуру в конец списка
    nextPieces.push(createPiece(pieces[Math.floor(Math.random() * pieces.length)]));

    // Если фигура не помещается на арене, игра заканчивается
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        score = 0; // Сброс счёта
    }

    drawNextPieces(); // Обновляем отображение следующих фигур
}


function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    player.rotation = (player.rotation + 1) % 4; // Поворот на следующее состояние
    player.matrix = player.pieces[player.rotation];
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            player.rotation = (player.rotation + 3) % 4; // Возврат к предыдущему состоянию
            player.matrix = player.pieces[player.rotation];
            player.pos.x = pos;
            return;
        }
    }
}

function drawNextPieces() {
    nextCanvases.forEach((context, index) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Очистка всего канваса
        drawMatrix(nextPieces[index][0], {x: 0, y: 0}, context); // Отображение только первой (основной) ориентации следующего блока
    });
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(10, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    rotation: 0,
    pieces: []
};

const pieces = 'TJLOSZI';
const nextPieces = [
    createPiece(pieces[Math.floor(Math.random() * pieces.length)]),
    createPiece(pieces[Math.floor(Math.random() * pieces.length)]),
    createPiece(pieces[Math.floor(Math.random() * pieces.length)]),
];

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38) {
        playerRotate();
    }
});

playerReset();
update();
