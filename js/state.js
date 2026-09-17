const GameState = {
    scores: {
        pandal: 0,
        rangoli: 0,
        puja: 0,
        rhythm: 0,
        eco: 0,
        mushak: 0,
        timeBonus: 0
    },
    soundEnabled: true,
    currentStage: 'start', // start, pandal, rangoli, puja, rhythm, eco, mushak, result
    
    // Config
    maxScores: {
        pandal: 100,
        rangoli: 100,
        puja: 100,
        rhythm: 100,
        eco: 100,
        mushak: 100,
        timeBonus: 100
    },

    init() {
        const savedSound = localStorage.getItem('ganpati_sound');
        if (savedSound !== null) {
            this.soundEnabled = savedSound === 'true';
        }
    },

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('ganpati_sound', this.soundEnabled);
        return this.soundEnabled;
    },

    resetScores() {
        this.scores = {
            pandal: 0,
            rangoli: 0,
            puja: 0,
            rhythm: 0,
            eco: 0,
            mushak: 0,
            timeBonus: 0
        };
        this.currentStage = 'start';
    },

    getTotalScore() {
        return Object.values(this.scores).reduce((a, b) => a + b, 0);
    },

    getMaxTotalScore() {
        return Object.values(this.maxScores).reduce((a, b) => a + b, 0);
    },

    getRank() {
        const total = this.getTotalScore();
        const max = this.getMaxTotalScore();
        const percentage = (total / max) * 100;

        if (percentage >= 90) return "FESTIVAL MASTER";
        if (percentage >= 75) return "UTSAV CHAMPION";
        if (percentage >= 50) return "FESTIVAL STAR";
        return "UTSAV EXPLORER";
    }
};

GameState.init();
