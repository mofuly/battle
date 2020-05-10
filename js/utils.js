function collide(x1, y1, w1, h1, x2, y2, w2, h2) {
    return pointInSquare(x1, y1, x2, y2, w2, h2) ||
        pointInSquare(x1 + w1, y1, x2, y2, w2, h2) ||
        pointInSquare(x1, y1 + h1, x2, y2, w2, h2) ||
        pointInSquare(x1 + w1, y1 + h1, x2, y2, w2, h2) ||
        pointInSquare(x2, y2, x1, y1, w1, h1) ||
        pointInSquare(x2 + w2, y2, x1, y1, w1, h1) ||
        pointInSquare(x2, y2 + h2, x1, y1, w1, h1) ||
        pointInSquare(x2 + w2, y2 + h2, x1, y1, w1, h1);

    function pointInSquare(px, py, sx, sy, sw, sh) {
        return (px >= sx && px <= sx + sw) &&
            (py >= sy && py <= sy + sh);
    }
}

function genRandom(min = 0, max = 3) {
    return Math.round(Math.random() * (max - min) + min);
}