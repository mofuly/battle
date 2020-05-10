function sound(which) {
    if (which.currentTime > 0 && !which.ended) {
        which.currentTime = 0;
    } else {
        which.play();
    }
}