/**
 * 主程序
 */
// welcome,stage,battleground,score,gameover,pause,message
function Battle() {
    this.PanelWelcome = 0;
    this.PanelStage = 1;
    this.PanelBattleground = 2;
    this.PanelScore = 3;
    this.PanelGameover = 4;
    this.PanelPause = 5;
    this.PanelMessage = 6;

    this.menuSelected = 1;
    this.init();
    this.showWelcome();
}
Battle.prototype = {
    constructor: Battle,
    battle: function () {
        if (config.isSaving || config.isLoading) {
            requestAnimationFrame(this.battle.bind(this));
            return;
        }

        if (config.isPaused) {
            if (config.key.Pause) config.isPaused = !config.isPaused;
            requestAnimationFrame(this.battle.bind(this));
            return;
        }

        if (config.currentPanel === this.PanelBattleground) {
            // 检测战斗中的敌人数，并生成新敌人
            if (!config.isEnemyBorning) {
                if (!this.getNextEnemy() && config.enemy.every(function (v) {
                        return v.isDestroyed;
                    })) {
                    // 敌人已被全部消灭 延时3秒 显示记分榜
                    if (!config.isDelayForScore) {
                        setTimeout(this.showScore.bind(this), 3000);
                        config.isDelayForScore = true;
                    }
                }
            }
            // 检测玩家是否挂掉，如挂掉生成新玩家，全部挂掉则game over
            if (config.player == null) {
                if (!this.newPlayer()) {
                    this.showGameover();
                }
            }
        }

        if (config.tick % 5 === 0) {
            this.processKeyPress();
        }

        config.tick++;
        requestAnimationFrame(this.battle.bind(this));
    },
    getNextEnemy: function () {
        if (config.isEnemyBorning) return true;
        if (config.enemy.filter(function (v) {
                return !v.isDestroyed;
            }).length === config.mostOfEnemy) return true;
        if (config.enemyQueue.length === 0) {
            if (config.enemy.every(function (v) {
                    return v.isDestroyed;
                })) {
                return false;
            }
        }
        return newEnemy();

        function newEnemy() {
            if (config.enemyQueue.length < 1) return false;
            config.isEnemyBorning = true;
            var x = Tank.enemyX[config.enemyQueue.length % 3];
            var nextEnemy = config.enemyQueue.shift();
            clearEnemyIcon(config.enemyQueue.length);
            var times = 5,
                timesOfBorn = 2,
                isBorned = false,
                period = 8;
            var mod = config.tick % period,
                currentIndex = 0;
            var ctx = canvasShield.getContext('2d');
            var imgs = document.querySelectorAll('.imgStar');
            var baby = null;

            twinkle();
            return true;

            function twinkle() {
                if (baby) {
                    if (baby.isDestroyed) {
                        ctx.clearRect(x + 32, 32, 32, 32);
                        config.isEnemyBorning = false;
                        return;
                    }
                }
                if (times === -1) {
                    ctx.clearRect(x + 32, 32, 32, 32);
                    if (!baby.isDestroyed) baby.show();
                    config.isEnemyBorning = false;
                    baby.isBorning = false;
                    baby.show();
                    baby.go();
                    // console.log('times === -1', config.isEnemyBorning)
                    return;
                }
                if (config.tick % period === mod) {
                    ctx.clearRect(x + 32, 32, 32, 32);
                    ctx.drawImage(imgs[currentIndex], x + 32, 32, 32, 32);
                    currentIndex++;
                    if (currentIndex === imgs.length) {
                        currentIndex = 0;
                        times--;
                    }
                    if (!isBorned && times == timesOfBorn) {
                        baby = new Tank('enemy', nextEnemy.type);
                        baby.putOnRed(nextEnemy.prop);
                        config.enemy.push(baby);
                        isBorned = true;
                    }
                }
                // console.log('xxx', config.isEnemyBorning)
                config.tick++;
                requestAnimationFrame(twinkle);
            }
        }
    },
    gameOver: function () {
        this.showGameover();
    },

    newPlayer: function () {
        if (config.player != null) {
            config.player.clear();
            config.player.x = Tank.playerX;
            config.player.y = Tank.playerY;
            config.player.show();
            config.player.putOnShield();
            return true;
        } else {
            if (config.lives > 0) {
                config.player = new Tank('player', 1);
                config.player.show();
                config.player.putOnShield();
                config.lives--;
                showPlayerCount(config.lives);
                return true;
            }
        }
        return false;
    },

    startNewStage: function () {

        // config.stage++;

        panel.panelCommon.innerHTML = '';

        config.piece = {};
        config.property = [];
        config.bullet = [];
        config.enemyQueue = [];
        config.enemy = [];
        config.enemyKilled = [0, 0, 0, 0];
        config.key = {};

        config.tick = 0;
        config.isEnemyBorning = false;
        config.isScoring = false;
        config.isPaused = false;
        config.isScoring = false;
        config.isLoading = false;
        config.isDelayForScore = false;
        config.isGameOver = false;

        canvasMap.getContext('2d').clearRect(0, 0, 511, 479);
        canvasGrass.getContext('2d').clearRect(0, 0, 511, 479);
        canvasEnemy.getContext('2d').clearRect(0, 0, 511, 479);
        canvasPlayer.getContext('2d').clearRect(0, 0, 511, 479);
        canvasProperty.getContext('2d').clearRect(0, 0, 511, 479);
        canvasExplosion.getContext('2d').clearRect(0, 0, 511, 479);
        canvasBullet.getContext('2d').clearRect(0, 0, 511, 479);
        canvasShield.getContext('2d').clearRect(0, 0, 511, 479);

        showMap();

        // generate enemy queue
        var queueIndex = Math.min(config.stage - 1, ENEMY_QUEUE.length - 1);
        for (var i = 0; i < ENEMY_QUEUE[queueIndex].type.length; i++) {
            config.enemyQueue.push({
                type: parseInt(ENEMY_QUEUE[queueIndex].type.substr(i, 1)),
                prop: parseInt(ENEMY_QUEUE[queueIndex].prop.substr(i, 1))
            });
        }
        this.newPlayer();
        drawAllEnemyIcon();

    },

    pauseAll: function () {
        keyboard.pause();
        config.player.pause();
        config.property.forEach(function (v) {
            v.pause()
        });
        config.enemy.forEach(function (v) {
            v.pause()
        });
        config.bullet.forEach(function (v) {
            v.pause()
        });
    },

    processKeyPress: function () {
        if (config.currentPanel === this.PanelScore) {
            if (config.isScoring) {
                config.key = {};
                return;
            }
            if (config.key.Control || config.key.Space) {
                config.stage++;
                this.showStage();
            }
        }

        if (config.currentPanel === this.PanelWelcome) {
            var x = 140,
                y = 244,
                el = document.getElementById("menuSelected");

            if (config.key.ArrowUp) {
                this.menuSelected--;
                if (this.menuSelected <= 0) this.menuSelected = 3;
            }
            if (config.key.ArrowDown) {
                this.menuSelected++;
                if (this.menuSelected > 3) this.menuSelected = 1;
            }
            switch (this.menuSelected) {
                case 1:
                    y = 244;
                    break;
                case 2:
                    y = 276;
                    break;
                case 3:
                    y = 308;
                    break;
            }
            var style = "top:" + y + "px;left:" + x + "px;";
            if (el) el.style = style;

            if (config.key.Control || config.key.Space) {
                if (config.isDebugging) {
                    config.mostOfEnemy = 1;
                } else {
                    config.mostOfEnemy = this.menuSelected * 2 + 2;
                }
                this.showStage();
                return;
            }
        }
        if (config.currentPanel === this.PanelStage) {
            if (config.key.Control || config.key.Space) {
                this.startNewStage();
                this.showBattleground(true);
            }
            return;
        }

        if (config.currentPanel === this.PanelGameover) {
            if (config.key.Control || config.key.Space) {
                this.showWelcome();
            }
            return;
        }

        if (config.currentPanel === this.PanelPause) {
            if (config.key.Pause) {
                this.pauseAll();
                config.isPaused = false;
                this.showBattleground(false);
            }
            return;
        }

        if (config.currentPanel === this.PanelBattleground) {
            if (config.key.Pause) {
                this.pauseAll();
                config.isPaused = !config.isPaused;
                if (config.isPaused) this.showPause();
                return;
            }
            if (config.isPaused) return;
            //            console.log(config.key);
            if (config.key.ArrowUp && config.player != null) config.player.up();
            if (config.key.ArrowDown && config.player != null) config.player.down();
            if (config.key.ArrowLeft && config.player != null) config.player.left();
            if (config.key.ArrowRight && config.player != null) config.player.right();
            if (config.key.Control && config.player != null) config.player.shoot(false);
            if (config.key.Space && config.player != null) config.player.shoot(true);

            if (config.key.S) { // save game

            }
            if (config.key.L) { // load game

            }


        }
    },

    showWelcome: function () {
        config.currentPanel = this.PanelWelcome;
        config.key = {};
        var style, y = 480,
            id = 'wel-01';
        var html = `<div id="${id}" class="welcome"></div>`;
        var panelCommon = document.getElementById('panelCommon');
        panelCommon.innerHTML = html;
        panelCommon.className = 'panel-common black-ground';
        var el = document.getElementById(id);

        animation();

        function animation() {
            if (y === 0) {
                var elPoint = document.getElementById('wel-01');
                if (elPoint) elPoint.innerHTML = '<div id="menuSelected" class="menu-tank"></div>';
                if (elPoint) elPoint.innerHTML += '<div id="menuDescription">3个选项分别表示战场中坦克的数量为4，6，8</div>';
                return;
            }
            y -= 4;
            style = 'top:' + y + 'px;';
            el.style = style;
            requestAnimationFrame(animation);
        }
    },

    showStage: function () {
        this.hideScore();
        config.isGameOver = false;
        config.currentPanel = this.PanelStage;
        sound(avStart);
        this.showMessage('STAGE ' + config.stage);
    },

    showPause: function () {
        config.currentPanel = this.PanelPause;
        sound(avPause);
        this.showMessage('Paused!!!', true);
    },

    showBattleground: function () {
        config.currentPanel = this.PanelBattleground;
        config.enemyBorning = false;
        config.key = {};
        panel.panelCommon.innerHTML = '';
        panel.panelCommon.className = 'panel-common';
    },

    showGameover: function () {
        config.stage = 1;
        config.isGameOver = true;
        config.currentPanel = this.PanelGameover;
        sound(avGameOver);
        config.key = {};
        var html = '<img id="gameover-img" class="gameover" src="./res/big-gameover.gif">';
        panel.panelCommon.innerHTML = html;
        panel.panelCommon.className = 'panel-common half-transparent';
        var y = 400,
            el = document.getElementById("gameover-img");

        animation();

        function animation() {
            y -= 3;
            if (y <= 184) return;

            var style = "left:180px;top:" + y + "px;";
            el.style = style;

            requestAnimationFrame(animation);
        }
    },

    showMessage: function (message, transparent = false) {
        // config.currentPanel = this.PanelMessage;
        config.key = {};
        document.getElementById('panelCommon').innerHTML = '';
        if (transparent) {
            document.getElementById('panelCommon').className = 'panel-common transparent-message';
        } else {
            document.getElementById('panelCommon').className = 'panel-common message';
        }
        document.getElementById('panelCommon').innerText = message;
    },

    showScore: function () {
        if (config.isGameOver) return;
        if (config.isScoring) return;
        config.isScoring = true;
        while (config.property.length > 0) {
            var p = config.property.pop();
            p.isEatten = true;
        }
        var html = '<div class="player1"></div>' +
            '<div class = "player2"></div>' +
            '<div class = "point1"></div>' +
            '<div class = "point2"></div>' +
            '<div class = "bonus"></div>' +
            '<div class = "hi-score"></div>' +
            '<div class = "stage"></div>' +
            '<div class = "normal-p1"></div>' +
            '<div class = "rapid-p1"></div>' +
            '<div class = "medium-p1"></div>' +
            '<div class = "heavy-p1"></div>' +
            '<div class = "total-p1"></div>' +
            '<div class = "normal-count"></div>' +
            '<div class = "rapid-count"></div>' +
            '<div class = "medium-count"></div>' +
            '<div class = "heavy-count"></div>' +
            '<div class = "total-count"></div>';
        config.currentPanel = this.PanelScore;
        document.getElementById('panelScore').innerHTML = html;
        var elBonus = document.querySelector('.panel-score .bonus');
        elBonus.style.display = 'none';
        document.getElementById('panelScore').style.zIndex = 8;
        var elHiScore = document.querySelector('.panel-score .hi-score');
        var el = [],
            elc = [];
        el[0] = document.querySelector('.panel-score .normal-p1');
        el[1] = document.querySelector('.panel-score .rapid-p1');
        el[2] = document.querySelector('.panel-score .medium-p1');
        el[3] = document.querySelector('.panel-score .heavy-p1');

        elc[0] = document.querySelector('.panel-score .normal-count');
        elc[1] = document.querySelector('.panel-score .rapid-count');
        elc[2] = document.querySelector('.panel-score .medium-count');
        elc[3] = document.querySelector('.panel-score .heavy-count');

        var elTotal = document.querySelector('.panel-score .total-p1');
        var elcTotal = document.querySelector('.panel-score .total-count');
        var total = 0,
            totalc = 0,
            delay = 18,
            tick = 0,
            index = 0,
            displayedScore = 0;
        document.querySelector('.panel-score .stage').innerText = config.stage;

        config.isScoring = true;

        animation();

        function animation() {
            if (tick % delay === 0) {
                if (displayedScore === config.enemyKilled[index]) {
                    total += config.enemyKilled[index] * (index + 1) * 100;
                    totalc += config.enemyKilled[index];
                    displayedScore = 0;
                    index++;
                } else {
                    sound(avDi);
                    displayedScore++;
                    el[index].innerText = displayedScore * (index + 1) * 100;
                    elc[index].innerText = displayedScore;
                }
            }
            if (index === 4) {
                elTotal.innerText = total;
                elcTotal.innerText = totalc;
                config.highestScore = Math.max(config.highestScore, config.playerScore, 20000);
                elHiScore.innerText = config.highestScore;
                sound(avBonus1000);
                config.playerScore += 1000;
                elBonus.style.display = 'inline-block';
                config.isScoring = false;
                return;
            }
            tick++;
            requestAnimationFrame(animation);
        }
    },
    hideScore: function () {
        config.isDelayForScore = false;
        document.getElementById('panelScore').style.zIndex = -1;
    },

    init: function () {
        var w = 512,
            h = 480;

        canvasMap.width = w;
        canvasMap.height = h;

        canvasPlayer.width = w;
        canvasPlayer.height = h;

        canvasEnemy.width = w;
        canvasEnemy.height = h;

        canvasBullet.width = w;
        canvasBullet.height = h;

        canvasGrass.width = w;
        canvasGrass.height = h;

        canvasProperty.width = w;
        canvasProperty.height = h;

        canvasExplosion.width = w;
        canvasExplosion.height = h;

        canvasShield.width = w;
        canvasShield.height = h;

        config.currentId = 1;
        config.stage = 1;
        config.lives = 3;

        var el = document.querySelector('.panel-resource .images .player');
        var html = [];
        if (el) {
            for (var i = 1; i < 5; i++) {
                for (var j = 1; j < 5; j++) {
                    for (var k = 1; k < 3; k++) {
                        var format = i + '-' + j + '-' + k
                        var src = './res/0Player/m' + format + '.gif';
                        var id = 'player-' + format;
                        html.push('<img id="' + id + '" src="' + src + '">');
                    }
                }
            }
            el.innerHTML += html.join('');
            html = [];
        }

        el = document.querySelector('.panel-resource .images .enemy');
        if (el) {
            for (var i = 1; i < 8; i++) {
                for (var j = 1; j < 5; j++) {
                    for (var k = 1; k < 3; k++) {
                        var ii = i;
                        if (i == 7) ii = 6;
                        var format = i + '-' + j + '-' + k;
                        var srcFormat = ii + '-' + j + '-' + k;
                        var src = './res/enemy/' + srcFormat + '.gif';
                        var id = 'enemy-' + format;
                        html.push('<img id="' + id + '" src="' + src + '">');
                    }
                }
            }
            el.innerHTML += html.join('');
            html = [];
        }

        el = document.querySelector('.panel-resource .images .red-enemy');
        if (el) {
            for (var i = 1; i < 8; i++) {
                for (var j = 1; j < 5; j++) {
                    for (var k = 1; k < 3; k++) {
                        var ii = i;
                        if (i > 4) ii = 4;
                        var format = i + '-' + j + '-' + k;
                        var srcFormat = ii + '-' + j + '-' + k;
                        var src = './res/red-enemy/' + srcFormat + '.gif';
                        var id = 'red-enemy-' + format;
                        html.push('<img id="' + id + '" src="' + src + '">');
                    }
                }
            }
            el.innerHTML += html.join('');
            html = [];
        }
    }
};

function sound(which) {
    which.muted = false;
    if (which.currentTime > 0 && !which.ended) {
        which.currentTime = 0;
    } else {
        which.play();
    }
}
var battle = new Battle();
battle.battle();