document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const doodler = document.createElement('div');
    const scoreDisplay = document.querySelector('.score');
    const gameOverScreen = document.querySelector('.game-over');
    const finalScoreDisplay = document.querySelector('#final-score')
    const restartButton = document.querySelector('button');

    let doodlerLeftSpace = 50;
    let startPoint = 150;
    let doodlerBottomSpace = startPoint;
    let isGameOver = false;
    const platformCount = 5;
    let platforms = [];
    let upTimerId;
    let downTimerId;
    let isJumping = true;
    let isGoingLeft = false;
    let isGoingRight = false;
    let leftTimerId;
    let rightTimerId;
    let score = 0;
    let difficulty = 1;

    let highScore = localStorage.getItem('highScore') || 0;

    function createDoodler() {
        grid.appendChild(doodler);
        doodler.classList.add('doodler')
        doodlerLeftSpace = platforms[0].left;
        updateDoodlerPosition();
    }

    function updateDoodlerPosition(){
        doodler.style.left = doodlerLeftSpace + 'px';
        doodler.style.bottom = doodlerBottomSpace + 'px';
    }

    class Platform {
        constructor(newPlatBottom) {
            this.bottom = newPlatBottom;
            this.left = Math.random() * 315;
            this.visual = this.createVisual();
            grid.appendChild(this.visual);
        }

        createVisual(){
            const visual=document.createElement('div');
            visual.classList.add('platform');
            visual.style.left = this.left + 'px';
            visual.style.bottom = this.bottom + 'px';
            return visual;
        }
    }

    function createPlatforms() {
        for (let i = 0; i < platformCount; i++) {
            let platformGap = 600 / platformCount;
            let newPlatBottom = 100 + i * platformGap;
            let newPlatform = new Platform(newPlatBottom);
            platforms.push(newPlatform);
        }
    }

    function movePlatforms() {
        if (doodlerBottomSpace > 250) {
            platforms.forEach(platform => {
                platform.bottom -= 4*difficulty;
                let visual = platform.visual;
                visual.style.bottom = platform.bottom + 'px'

                if (platform.bottom < 10) {
                    let firstPlatform = platforms[0].visual;
                    firstPlatform.classList.remove('platform')
                    platforms.shift()
                    // removes the first item of an array
                    score++;
                    updateScore();
                    let newPlatform = new Platform(600);
                    platforms.push(newPlatform)

                }
            });
        }
    }

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
        // Increase difficulty based on score
        difficulty = 1 + Math.floor(score / 10) * 0.1;
    }

    function jump() {
        clearInterval(downTimerId)
        isJumping = true;
        upTimerId = setInterval(function () {
            doodlerBottomSpace += 15;
            updateDoodlerPosition();
            if (doodlerBottomSpace > startPoint + 200) {
                fall()
            }
        }, 30)
    }

    function fall() {
        clearInterval(upTimerId);
        isJumping = false;
        downTimerId = setInterval(function () {
            doodlerBottomSpace -= 5;
            updateDoodlerPosition();
            if (doodlerBottomSpace <= 0) {
                gameOver();
            }

            platforms.forEach(platform => {
                if (
                    (doodlerBottomSpace >= platform.bottom) &&
                    (doodlerBottomSpace <= platform.bottom + 15) &&
                    (doodlerLeftSpace + 60 >= platform.left) &&
                    (doodlerLeftSpace <= (platform.left + 85)) &&
                    (!isJumping)
                ) {
                    startPoint = doodlerBottomSpace;
                    jump();
                }
            });
        }, 30);
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(upTimerId);
        clearInterval(downTimerId);
        clearInterval(leftTimerId);
        clearInterval(rightTimerId);
        grid.innerHTML = '';

        if(score>highScore){
            localStorage.setItem('highscore',highScore);
            highScore=score;
        }

        finalScoreDisplay.textContent = `Your score: ${score} High Score: ${highScore}`;
        gameOverScreen.style.display = 'block';
    }

    function restartGame() {
        gameOverScreen.style.display = 'none';
        grid.innerHTML = '';
        score = 0;
        isGameOver = false;
        platforms = [];
        doodlerBottomSpace = startPoint;
        difficulty = 1;
        createPlatforms();
        createDoodler();
        updateScore();
        setInterval(movePlatforms, 30);
        jump();
    }

    restartButton.addEventListener('click', restartGame);

    function moveLeft() {
        if (isGoingRight) {
            clearInterval(rightTimerId);
            isGoingRight = false;
        }
        isGoingLeft = true;
        leftTimerId = setInterval(function () {
            if (doodlerLeftSpace >= 0) {
                doodlerLeftSpace -= 8;
                doodler.style.left = doodlerLeftSpace + 'px'
            }
            else {
                moveRight();
            }
        }, 20)
    }

    function moveRight() {
        if (isGoingLeft) {
            clearInterval(leftTimerId);
            isGoingLeft = false;
        }
        isGoingRight = true;
        rightTimerId = setInterval(function () {
            if (doodlerLeftSpace <= 313) {
                doodlerLeftSpace += 8;
                doodler.style.left = doodlerLeftSpace + 'px';
            }

            else {
                moveLeft();
            }
        }, 20)
    }

    function moveStraight() {
        isGoingLeft = false;
        isGoingRight = false;
        clearInterval(rightTimerId);
        clearInterval(leftTimerId);
    }

    function control(e) {
        if (e.key === 'ArrowLeft') {
            moveLeft();
        }

        else if (e.key === 'ArrowRight') {
            moveRight();
        }
        else if (e.key === 'ArrowUp') {
            moveStraight();
        }
    }

    function touchControl(e){
        const touchX=e.touches[0].clientX;
        if(touchX<window.innerWidth){
            moveLeft();
        }
        else{
            moveRight();
        }
    }

    function start() {
        if (!isGameOver) {
            createPlatforms();
            createDoodler();
            setInterval(movePlatforms, 30);
            jump()
            document.addEventListener('keyup', control);
            document.addEventListener('touchstart',touchControl)
        }
    }

    start();
    //attach to button 
})
