/**
 * Audio Manager
 * Handles UI sounds, positive reinforcement chimes, and Web Speech API Synthesis
 */
const AudioManager = {
    synth: window.speechSynthesis,
    voicesReady: false,
    sfxSuccess: null,
    sfxBounce: null,
    sfxPop: null,

    init() {
        this.sfxSuccess = document.getElementById('sfx-success');
        this.sfxBounce = document.getElementById('sfx-bounce');
        this.sfxPop = document.getElementById('sfx-pop');

        // Ensure voices load (Async in Chrome)
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.voicesReady = true;
            };
        } else {
            // Safari/Firefox might load synchronously
            if (this.synth.getVoices().length > 0) {
                this.voicesReady = true;
            }
        }
    },

    playBounce() {
        if (!this.sfxBounce) return;
        this.sfxBounce.currentTime = 0;
        this.sfxBounce.volume = 0.4;
        this.sfxBounce.play().catch(e => console.log('Audio overlap ignored'));
    },

    playSuccess() {
        if (!this.sfxSuccess) return;
        this.sfxSuccess.currentTime = 0;
        this.sfxSuccess.volume = 0.5;
        this.sfxSuccess.play().catch(e => console.log('Audio overlap ignored'));
    },

    playPop() {
        if (!this.sfxPop) return;
        this.sfxPop.currentTime = 0;
        this.sfxPop.volume = 0.6;
        this.sfxPop.play().catch(e => console.log('Audio overlap ignored'));
    },

    // Speaks the word or sentence, attempting to find a friendly native voice
    speak(text, options = {}) {
        // Cancel any currently speaking audio so toddlers can fast-tap
        this.synth.cancel();

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate || 0.85; // slightly slower for toddlers
            utterance.pitch = options.pitch || 1.1; // slightly higher pitch sounds friendlier

            // Try assigning a good English voice
            const voices = this.synth.getVoices();
            if (voices.length > 0) {
                // Look for a recognizable, expressive voice (e.g. Google US English, or similar)
                let selectedVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
                if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith("en-"));
                if (selectedVoice) utterance.voice = selectedVoice;
            }

            if (options.onEnd) {
                utterance.onend = options.onEnd;
            }

            this.synth.speak(utterance);
        }, 50); // Small delay prevents API glitch on rapid calls
    },

    stop() {
        this.synth.cancel();
    }
};

window.AudioManager = AudioManager;
