config = {
    tick: 0,
    currentId: 1,
    currentPanel: '',
    stage: 1,
    lives: 3,
    mostOfEnemy: 1,
    fireSpeed: 800,
    player: null,
    map: [],
    piece: {},
    bullet: [],
    property: [],
    key: {},
    playerScore: 0,
    highestScore: 0,
    enemyQueue: [],
    enemy: [],
    enemyKilled: [0, 0, 0, 0],
    isEnemyBorning: false,
    isScoring: false,
    isPaused: false,
    isSaving: false,
    isLoading: false,
    isDelayForScore: false,
    isGameOver: false,
    isDebugging: false
};
panel = {
    panelCommon: document.getElementById('panelCommon')
};