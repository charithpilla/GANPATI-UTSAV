// Web Audio API Sound Synthesizer Engine for Ganpati Utsav
const SoundEngine = {
    ctx: null,
    bgmInterval: null,
    isBgmPlaying: false,

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play(name) {
        if (!GameState.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;

        switch (name) {
            case 'click': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(150, t + 0.06);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.06);
                break;
            }
            case 'dhol': {
                // Low punch bass drum
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(180, t);
                osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);
                gain.gain.setValueAtTime(0.8, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.22);
                break;
            }
            case 'tasha': {
                // High brassy snap rimshot
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(250, t + 0.1);
                gain.gain.setValueAtTime(0.6, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.1);
                break;
            }
            case 'clap': {
                // White noise clap burst
                const bufferSize = this.ctx.sampleRate * 0.08;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.5, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                noise.connect(gain);
                gain.connect(this.ctx.destination);
                noise.start(t);
                break;
            }
            case 'success': {
                // Ascending festive chord C5-E5-G5-C6
                const freqs = [523.25, 659.25, 783.99, 1046.50];
                freqs.forEach((f, i) => {
                    const noteT = t + i * 0.08;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, noteT);
                    gain.gain.setValueAtTime(0.3, noteT);
                    gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.3);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(noteT);
                    osc.stop(noteT + 0.3);
                });
                break;
            }
            case 'error': {
                // Low buzz drop
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, t);
                osc.frequency.linearRampToValueAtTime(90, t + 0.2);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.2);
                break;
            }
            case 'modak': {
                // Sweet chime
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(987.77, t);
                osc.frequency.exponentialRampToValueAtTime(1318.51, t + 0.12);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.15);
                break;
            }
        }
    },

    startBGM() {
        if (!GameState.soundEnabled || this.isBgmPlaying) return;
        this.init();
        if (!this.ctx) return;
        this.isBgmPlaying = true;

        // Simple ambient Indian Tanpura drone loop synthesizer
        let step = 0;
        const notes = [130.81, 196.00, 261.63, 196.00]; // C3, G3, C4, G3 tanpura notes
        this.bgmInterval = setInterval(() => {
            if (!this.isBgmPlaying || !GameState.soundEnabled) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[step % notes.length], t);
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.2);
            step++;
        }, 1200);
    },

    stopBGM() {
        this.isBgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
};
