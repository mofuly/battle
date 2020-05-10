/**
 * 坦克
 * @param {type} 坦克类别:'player','enemy'
 * @param {grade} player: 1-4, enemy: 1-7
 */
function Tank(type, grade) {
    this.type = type.toLowerCase();
    if (type === 'player') {
        this.x = Tank.playerX;
        this.y = Tank.playerY;
        this.dir = 1;
        this.isBorning = false;
    } else { // enemy
        this.x = Tank.enemyX[(config.enemyQueue.length + 1) % 3];
        this.y = 0;
        this.dir = 3;
        this.isBorning = true;
    }
    this.size = 32;
    this.isPaused = false;
    this.tick = 0;
    this.isMoving = false;
    this.isDestroyed = false;
    this.isFrozen = false;
    this.idPrefix = this.type + '-';
    this.grade = grade;
    this.typeNo = grade - 1;
    if (grade > 4) this.typeNo = 3;
    this.property = -1;
    this.times = 1;

    this.speed = 3;
    this.ctx = canvasPlayer.getContext('2d');
    if (type === 'enemy' && grade === 2) { // enemy rapid
        this.speed = 2;
        this.ctx = canvasEnemy.getContext('2d');
    }
    this.isWearingShield = false;
    this.isInRed = false;
    this.isHitting = false;
    this.isEatting = false;
    this.lastFireTime = null;
}
Tank.playerX = 8 * 16;
Tank.playerY = 24 * 16;
Tank.enemyX = [0, 24 * 16, 12 * 16];

Tank.prototype = {
    constructor: Tank,

    get id() {
        var grade = this.grade;
        if (grade > 6) grade = 6;
        return this.idPrefix + this.grade + '-' + (this.dir + 1) + '-' + this.showTimes;
    },
    get showTimes() {
        if (this.times === 1) {
            this.times = 2;
            return 1;
        } else {
            this.times = 1;
            return 2;
        }
    },
    get head() {
        var row = Math.floor(this.y / 16),
            col = Math.floor(this.x / 16);
        switch (this.dir) {
            case 0: // left
                return [{
                    row: row,
                    col: col
                }, {
                    row: row + 1,
                    col: col
                }];
            case 1: // up
                return [{
                    row: row,
                    col: col
                }, {
                    row: row,
                    col: col + 1
                }];
            case 2: // right
                return [{
                    row: row,
                    col: col + 1
                }, {
                    row: row + 1,
                    col: col + 1
                }];
            case 3: // down
                return [{
                    row: row + 1,
                    col: col
                }, {
                    row: row + 1,
                    col: col + 1
                }];
        }
    },
    get ahead() {
        var row = Math.floor(this.y / 16),
            col = Math.floor(this.x / 16);
        switch (this.dir) {
            case 0: // left
                return [{
                    row: row,
                    col: col - 1
                }, {
                    row: row + 1,
                    col: col - 1
                }];
            case 1: // up
                return [{
                    row: row - 1,
                    col: col
                }, {
                    row: row - 1,
                    col: col + 1
                }];
            case 2: // right
                return [{
                    row: row,
                    col: col + 2
                }, {
                    row: row + 1,
                    col: col + 2
                }];
            case 3: // down
                return [{
                    row: row + 2,
                    col: col
                }, {
                    row: row + 2,
                    col: col + 1
                }];
        }
    },

    //  如果按照当前方向移动成功后的左上角坐标
    // 未判断是否越界 和 前方是否有障碍物
    get aheadPoint() {
        if (this.dir === 0) return {
            x: this.x - 16,
            y: this.y
        };
        if (this.dir === 1) return {
            x: this.x,
            y: this.y - 16
        };
        if (this.dir === 2) return {
            x: this.x + 16,
            y: this.y
        };
        if (this.dir === 3) return {
            x: this.x,
            y: this.y + 16
        };
    },
    get location() {
        let row = Math.floor(this.y / 16),
            col = Math.floor(this.x / 16);

        return [{
                row: row,
                col: col
            },
            {
                row: row,
                col: col + 1
            },
            {
                row: row + 1,
                col: col
            },
            {
                row: row + 1,
                col: col + 1
            }
        ];
    },

    // 清除图片
    clear: function () {
        this.ctx.clearRect(this.x + 32, this.y + 32, this.size, this.size);
    },

    // 显示坦克
    show: function () {
        if (this.isBorning || this.isDestroyed) return;
        var el = document.getElementById(this.id);
        if (el) {
            this.clear();
            this.ctx.drawImage(el, this.x + 32, this.y + 32, this.size, this.size);
        }
    },
    setProperty: function (prop) {
        if (this.type === 'player') return false;
        this.property = prop;
    },
    // 调头
    setDir: function (dir) {
        if (dir === this.dir) return false;
        this.dir = dir;
        this.show();
    },

    // 越界检测
    get isOverBorder() {
        return this.aheadPoint.x < 0 ||
            this.aheadPoint.x + this.size > 416 ||
            this.aheadPoint.y < 0 ||
            this.aheadPoint.y + this.size > 416;
    },
    // 前方是否有障碍
    get hasObstacleAhead() {
        // 3砖块 4河流 5钢铁
        if ('345c'.indexOf(config.map[this.ahead[0].row][this.ahead[0].col]) >= 0) return true;
        if ('345c'.indexOf(config.map[this.ahead[1].row][this.ahead[1].col]) >= 0) return true;
    },
    get hasTankAhead() {
        var ahead = this.ahead,
            self = this;
        var otherTanks = config.enemy.filter(function (v) {
            return !(v.isDestroyed || v === self);
        });
        if (this.type === 'enemy' && config.player != null) otherTanks.push(config.player);
        return otherTanks.some(function (v) {
            return (v != null && !v.isDestroyed) ? v.location.some(function (l) {
                return (l.row === ahead[0].row && l.col === ahead[0].col) ||
                    (l.row === ahead[1].row && l.col === ahead[1].col);
            }) : false;
        });
    },
    get canMove() {
        if (this.isOverBorder) return false;
        if (this.hasObstacleAhead) return false;
        return !this.hasTankAhead;
    },
    up: function () {
        if (this.dir === 1) {
            if (this.canMove) this.move(0, -1);
        } else {
            this.setDir(1);
        }
    },
    down: function () {
        if (this.dir === 3) {
            if (this.canMove) this.move(0, 1);
        } else {
            this.setDir(3);
        }
    },
    left: function () {
        if (this.dir === 0) {
            if (this.canMove) this.move(-1, 0);
        } else {
            this.setDir(0);
        }
    },
    right: function () {
        if (this.dir === 2) {
            if (this.canMove) this.move(1, 0);
        } else {
            this.setDir(2);
        }
    },
    // 动画显示移动 每次移动4像素 移动4次 共16像素
    move: function (factorX, factorY) {
        var self = this,
            times = 4,
            loop = 0,
            mod;

        mod = this.tick % this.speed;

        if (this.isMoving) return;

        this.isMoving = true;
        step();

        function step() {
            if (self.isPaused) {
                requestAnimationFrame(step);
                return;
            }
            if (loop === times) {
                self.isMoving = false;
                if (self.type === 'player') self.eat();
                return;
            }
            if (self.tick % self.speed === mod) {
                loop++;
                self.clear();
                self.x += (16 / times) * factorX;
                self.y += (16 / times) * factorY;
                self.show();
            }
            self.tick++;
            requestAnimationFrame(step);
        }
    },
    pause: function () {
        this.isPaused = !this.isPaused;
    },
    upgrade: function () {
        if (this.grade < 4) {
            this.grade++;
            this.show();
        }
    },
    degrade: function () {
        this.grade--;
        if (this.grade <= 2) {
            this.destroy();
        } else {
            this.show();
        }
    },
    putOnRed: function (property) {
        if (this.type === 'player') return;
        if (property < 1) return;
        this.property = property;
        this.idPrefix = 'red-enemy-';
        this.isInRed = true;
        this.show();
    },
    takeOffRed: function () {
        if (this.type === 'player') return;
        this.idPrefix = 'enemy-';
        this.isInRed = false;
        // this.property = -1;
        this.show();
    },
    putOnShield: function () {
        if (this.type === 'enemy') return;
        if (this.isWearingShield) return;

        this.isWearingShield = true;
        self = this;
        wearShield();

        function wearShield() {

            if (self.isDestroyed) return;
            var tick = 0,
                period = 4,
                duration = 15 * 60,
                isToggle = true,
                x = self.x,
                y = self.y,
                size = 32;

            animation();

            function animation() {
                if (self.isPaused) {
                    requestAnimationFrame(animation);
                    return;
                }
                if (tick > duration) {
                    canvasShield.getContext('2d').clearRect(x + 32, y + 32, size, size);
                    self.isWearingShield = false;
                    return;
                }
                if (tick % period === 0) {
                    canvasShield.getContext('2d').clearRect(x + 32, y + 32, size, size);
                    x = self.x, y = self.y;
                    if (isToggle) {
                        canvasShield.getContext('2d').drawImage(imgShield0, self.x + 32, self.y + 32, self.size, self.size);
                    } else {
                        canvasShield.getContext('2d').drawImage(imgShield1, self.x + 32, self.y + 32, self.size, self.size);
                    }
                    isToggle = !isToggle;
                }
                tick++;
                requestAnimationFrame(animation);
            }
        }
    },
    shoot: function () {
        if (this.lastFireTime !== null) {
            var thisTime = new Date();
            if (thisTime - this.lastFireTime < config.fireSpeed) return;
            this.lastFireTime = thisTime;
        } else {
            this.lastFireTime = new Date();
        }
        var self = this;
        if (config.bullet.some(function (v) {
                return v.owner === self;
            })) return;

        config.bullet.push(new Bullet(this));
        if (this.type === 'player' && this.grade >= 3) {
            var tick = 0;
            var self = this;
            fireSecondBullet();

            function fireSecondBullet() {
                tick++;
                if (tick === 6) {
                    config.bullet.push(new Bullet(self));
                    return;
                }
                requestAnimationFrame(fireSecondBullet);
            }
        }
    },
    hit: function (isByMine) {
        var isEffective = false;
        if (this.isHitting) return false;
        this.isHitting = true;
        if (this.type === 'player') {
            if (!this.isWearingShield) {
                this.grade--;
                if (this.grade < 2) this.destroy();
                isEffective = true;
            }
        } else { // enemy
            if (this.isInRed) {
                config.property.push(new Property(this.property));
                this.takeOffRed();
                isEffective = true;
            }
            if (isByMine) {
                this.destroy();
                isEffective = true;
            } else {
                this.grade--;
                if (this.grade === 6) {
                    sound(avHitHeavy);
                }
                if (this.grade === 5 || this.grade === 4) {
                    sound(avHitHeavy1);
                }
                this.show();
                if (this.grade < 4) this.destroy();
                isEffective = true;
            }
        }
        this.isHitting = false;
        return isEffective;
    },
    froze: function () {
        var isToggle = true,
            self = this,
            tick = 0;
        if (this.isDestroyed || this.isFrozen || this.isPaused) return;
        this.isFrozen = true;
        this.pause();
        twinkle();

        function twinkle() {
            var period = 30,
                duration = period * 40;

            if (tick >= duration) {
                self.isFrozen = false;
                self.isPaused = false;
                return;
            }
            if (tick % period === 0) {
                if (isToggle) {
                    self.clear();
                } else {
                    self.show();
                }
                isToggle = !isToggle;
            }
            tick++;
            requestAnimationFrame(twinkle);
        }
    },
    destroy: function () {
        this.isDestroyed = true;
        if (this.type === 'enemy') {
            config.enemyKilled[this.typeNo]++;
            config.enemy.forEach(function (v) {
                v.clear();
                if (!v.isDestroyed) v.show();
            });
            var old = config.playerScore;
            if (this.grade + 1 > 3) {
                config.playerScore += 400;
            } else {
                config.playerScore += (this.grade + 1) * 100;
            }
            if (old < 20000 && config.playerScore >= 20000) {
                sound(avAddLife);
                config.lives++;
                showPlayerCount(config.lives);
            }
        } else {
            this.clear();
            this.isDestroyed = true;
            config.player = null;
        }
        new Explosion(this);
    },
    eat: function () {
        if (this.type === 'enemy') return;
        if (this.isEatting) return;
        this.isEatting = true;
        var self = this;
        config.property.filter(function (v) {
            return !v.isEatten;
        }).forEach(function (v) {
            if (stepOnProperty(v)) {
                v.eatten();
            }
        });

        function stepOnProperty(prop) {
            return self.location.some(function (v) {
                return prop.location.some(function (pv) {
                    return v.row === pv.row && v.col === pv.col;
                });
            });
        }
        this.isEatting = false;
    },
    changeDir: function () {
        var dir = genRandom(0, 3);
        this.setDir(dir);
    },
    go: function () {
        if (config.isGameOver ||
            this.type === 'player' ||
            this.isBorning ||
            this.isDestroyed)
            return;

        var tick = 0,
            period = 3;
        var self = this;
        autoDrive();

        function autoDrive() {
            if (config.isGameOver || self.isDestroyed) return;
            if (self.isPaused) {
                requestAnimationFrame(autoDrive);
                return;
            }
            if (tick % period === 0) {
                if (self.isOverBorder || !self.canMove) {
                    self.changeDir();
                } else {
                    if (self.dir === 0) self.left();
                    if (self.dir === 1) self.up();
                    if (self.dir === 2) self.right();
                    if (self.dir === 3) self.down();
                }
                if (genRandom(0, 99) > 85) self.shoot();
            }
            tick++;
            requestAnimationFrame(autoDrive);
        }
    }
};