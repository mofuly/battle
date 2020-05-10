/**
 * 爆炸类
 */
function Explosion(which) { // which: bullet,enemy or player
    this.isBig = true;
    if (which instanceof Bullet) {
        this.isBig = false;
        sound(avBoom);
    } else {
        if (which.type === 'player') {
            sound(avPlayerBoom);
        } else { // enemy
            sound(avEnemyBoom);
        }
    }
    if (this.isBig) {
        this.x = which.x + 24;
        this.y = which.y + 24;
        this.size = 32;
    } else {
        this.x = which.x + 28;
        this.y = which.y + 32;
        this.size = 16;
    }
    this.ctx = canvasExplosion.getContext('2d');
    this.tick = 0;
    this.boom(which);
}

Explosion.prototype = {
    constructor: Explosion,
    boom: function (which) {
        var duration = 6,
            nodes = null,
            nodesLen, index;
        if (this.isBig) {
            nodes = document.querySelectorAll('.imgBigBoom');
        } else {
            nodes = document.querySelectorAll('.imgBoom');
        }
        nodesLen = nodes.length;
        index = Math.floor(this.tick / duration);
        if (index >= nodesLen) {
            this.ctx.clearRect(this.x, this.y, this.size, this.size);
            if (which.explosionCallback) which.explosionCallback();
            return;
        }
        if (this.tick % duration === 0) {
            this.ctx.clearRect(this.x, this.y, this.size, this.size);
            this.ctx.drawImage(nodes[index], this.x, this.y, this.size, this.size);
        }
        this.tick++;
        requestAnimationFrame(this.boom.bind(this));
    }
};