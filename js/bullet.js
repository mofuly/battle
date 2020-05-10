function Bullet(owner) {
    switch (owner.dir) {
        case 0: // left
            this.x = Math.max(0, owner.x - 6);
            this.y = owner.y + 12;
            break;
        case 1: // up
            this.x = owner.x + 12;
            this.y = Math.max(0, owner.y - 6);
            break;
        case 2: // right
            this.x = Math.min(416, owner.x + owner.size + 6);
            this.y = owner.y + 12;
            break;
        case 3: // down
            this.x = owner.x + 12;
            this.y = Math.min(416, owner.y + owner.size + 6);
    }
    this.size = 8;
    this.owner = owner;
    this.dir = owner.dir;
    this.grade = 1;
    if (owner.type === 'player') {
        this.grade = owner.grade;
    }
    this.isBlasting = false;
    this.isPaused = false;
    this.tick = 0;
    this.isDestroyed = false;

    this.ctx = canvasBullet.getContext('2d');
    this.ctxMap = canvasMap.getContext('2d');
    this.fly();
}
Bullet.prototype = {
    constructor: Bullet,
    show: function () {
        var id = 'imgBullet' + this.dir,
            imgBullet = document.getElementById(id);
        // this.clear();
        this.ctx.drawImage(imgBullet, this.x + 32, this.y + 32, this.size, this.size);
    },

    touchBorder: function () {
        switch (this.dir) {
            case 0: // left
                return this.x <= 0;
            case 1: // up
                return this.y <= 0;
            case 2: // right
                return this.x >= 408 + 8;
            case 3: // down
                return this.y >= 408 + 8;
        }
        return false;
    },
    clear: function () {
        this.ctx.clearRect(this.x + 32, this.y + 32, this.size, this.size);
    },
    pause: function () {
        this.isPaused = !this.isPaused;
    },

    destroy: function (blast = true) {
        this.isDestroyed = true;
        this.isBlasting = true;
        this.clear();
        if (blast) {
            new Explosion(this);
        }
        config.bullet = config.bullet.filter(v => v !== this);
    },

    fly: function () {
        if (this.isDestroyed) return;
        var speed = 3;
        if (this.owner.type === 'player' && this.owner.grade >= 2) speed = Math.ceil(speed / 3);
        if (this.owner.type === 'enemy' && this.owner.grade === 2) speed = Math.ceil(speed * 0.66);

        if (this.isBlasting) return;

        if (this.isPaused) {
            requestAnimationFrame(this.fly.bind(this));
            return;
        }

        if (this.tick % speed !== 0) {
            this.tick++;
            requestAnimationFrame(this.fly.bind(this));
            return;
        }

        this.tick++;

        this.show();
        // console.log(this.x, this.y, this.row, this.col)
        if (this.touchBorder()) {
            this.destroy();
            return;
        }

        // hits other bullets or not
        for (var i = config.bullet.length - 1; i >= 0; i--) {
            var bullet = config.bullet[i];

            if (bullet === this) continue;
            if (bullet.owner === this.owner) continue;
            if (bullet.dir === this.dir) continue;
            if (collide(this.x, this.y, this.size, this.size, bullet.x, bullet.y, bullet.size, bullet.size)) {
                bullet.destroy(false);
                for (var j = 0; j < config.bullet.length; j++) {
                    if (config.bullet[j] === this) {
                        this.destroy(false);
                        break;
                    }
                }
                return;
            }
        }

        // hits something such as bricks or steels or not
        if (this.hitSomething()) {
            this.destroy();
            return;
        }

        // hits camp or not
        if (collide(this.x, this.y, this.size, this.size, 12 * 16, 24 * 16, 16, 16)) {
            showCamp(false);
            this.destroy();
            battle.gameOver();
            return;
        }

        // hits Tank or not
        if (this.owner.type === 'player') { // player's bullet
            var hit = config.enemy.filter(v => !v.isDestroyed).some(v => {
                if (collide(this.x, this.y, this.size, this.size, v.x, v.y, v.size, v.size)) {
                    v.hit();
                    return true;
                }
            });
            if (hit) {
                this.destroy(false);
                return;
            }
        } else { // bullet of enemies
            if (collide(this.x, this.y, this.size, this.size, config.player.x, config.player.y, config.player.size, config.player.size)) {
                var isEffective = config.player.hit();
                this.destroy(isEffective);
                return;
            }
        }
        this.clear();
        switch (this.dir) {
            case 0: // left
                this.x -= 8;
                break;
            case 1: // up
                this.y -= 8;
                break;
            case 2: // right
                this.x += 8;
                break;
            case 3: // down
                this.y += 8;
                break;
        }
        this.show();
        requestAnimationFrame(this.fly.bind(this));
    },

    hitSomething: function () {
        var row, col, block1, block2, row1, row2, col1, col2;

        row = Math.floor(this.y / 16);
        col = Math.floor(this.x / 16);
        switch (this.dir) {
            case 0: // left
                row1 = row, col1 = col;
                row2 = row + 1, col2 = col;
                break;
            case 1: //up
                row1 = row, col1 = col;
                row2 = row, col2 = col + 1;
                break;
            case 2: // right
                row1 = row, col1 = col;
                row2 = row + 1, col2 = col;
                break;
            case 3: // down
                row1 = row, col1 = col;
                row2 = row, col2 = col + 1;
                break;
        }
        block1 = config.map[row1][col1];
        block2 = config.map[row2][col2];

        // super bullet
        var shot = false;
        if (this.grade > 3) {
            if (this.isShootable(block1)) {
                config.map[row1][col1] = '0';
                this.ctxMap.clearRect(col1 * 16 + 32, row1 * 16 + 32, 16, 16);
                shot = true;
            }
            if (this.isShootable(block2)) {
                config.map[row2][col2] = '0';
                this.ctxMap.clearRect(col2 * 16 + 32, row2 * 16 + 32, 16, 16);
                shot = true;
            }
            return shot;
        }

        // normal bullet
        var shot1 = false;
        if (block1 === '5' && block2 === '5') {
            return true;
        }
        if (block1 === '5' || block2 === '5') {
            return true;
        } else {
            if (block1 === '3') {
                shot = this.pieceCollide(row1, col1);
            }
            if (block2 === '3') {
                shot1 = this.pieceCollide(row2, col2);
            }
            return shot || shot1;
        }
    },

    pieceCollide: function (row, col) {
        var index = 'b' + row * 10 + col;
        var isHit = false,
            x, y;
        if (!config.piece[index]) config.piece[index] = [1, 1, 1, 1];
        switch (this.dir) {
            case 0: // left
            case 2: // right
                if (this.x % 16 <= 8) { //子弹在左半边
                    if (config.piece[index][0] === 1) {
                        x = col * 16, y = row * 16;
                        isHit = collide(this.x, this.y, 8, 8, x, y, 8, 8);
                    }
                    if (!isHit) {
                        if (config.piece[index][2] === 1) {
                            x = col * 16, y = row * 16 + 8;
                            isHit = collide(this.x, this.y, 8, 8, x, y, 8, 8);
                        }
                    }
                    if (isHit) {
                        this.ctxMap.clearRect(col * 16 + 32, row * 16 + 32, 8, 16);
                        config.piece[index][0] = 0;
                        config.piece[index][2] = 0;
                    }
                } else { // 子弹在右半边
                    if (config.piece[index][1] === 1) {
                        x = col * 16 + 8, y = row * 16;
                        isHit = collide(this.x, this.y, 8, 8, x, y, 8, 8);
                    }
                    if (!isHit) {
                        if (config.piece[index][3] === 1) {
                            x = col * 16 + 8, y = row * 16 + 8;
                            isHit = collide(this.x, this.y, 8, 8, x, y, 8, 8);
                        }
                    }
                    if (isHit) {
                        this.ctxMap.clearRect(col * 16 + 8 + 32, row * 16 + 32, 8, 16);
                        config.piece[index][1] = 0;
                        config.piece[index][3] = 0;
                    }
                }
                break;
            case 1: // up
            case 3: // down
                if (this.y % 16 <= 8) { //子弹在上半部
                    if (config.piece[index][0] === 1) {
                        x = col * 16, y = row * 16;
                        isHit = collide(this.x, this.y, 8, 8, x, y, 8, 8);
                    }
                    if (!isHit) {
                        if (config.piece[index][1] === 1) {
                            x = col * 16 + 8, y = row * 16;
                            isHit = collide(this.x, this.y, 8, 8, x, y, 8, 8);
                        }
                    }
                    if (isHit) {
                        this.ctxMap.clearRect(col * 16 + 32, row * 16 + 32, 16, 8);
                        config.piece[index][0] = 0;
                        config.piece[index][1] = 0;
                    }
                } else { // 子弹在下半部
                    if (config.piece[index][2] === 1) {
                        x = col * 16, y = row * 16 + 8;
                        isHit = collide(this.x, this.y, this.size, this.size, x, y, 8, 8);
                    }
                    if (!isHit) {
                        if (config.piece[index][3] === 1) {
                            x = col * 16 + 8, y = row * 16 + 8;
                            isHit = collide(this.x, this.y, 8, 8, x, y, 8, 8);
                        }
                    }
                    if (isHit) {
                        this.ctxMap.clearRect(col * 16 + 32, row * 16 + 8 + 32, 16, 8);
                        config.piece[index][2] = 0;
                        config.piece[index][3] = 0;
                    }
                }
                break;
        }

        var sum = config.piece[index].reduce((p, v) => p + v);
        if (sum === 0) {
            delete config.piece[index];
            config.map[row][col] = '0';
        }
        return isHit;
    },

    isShootable: function (block) {
        return '35c'.indexOf(block) >= 0;
    }

};