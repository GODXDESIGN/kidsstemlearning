/**
 * Story Module (Linear Visuals and Text-to-Speech)
 */
const StoryModule = {
    stories: [
        {
            title: "Super Bear's Friendship",
            pages: [
                { text: "Once upon a time, deep in the forest...", image: "🌲" },
                { text: "Lived Super Bear, a hero with a big heart.", image: "🐻" },
                { text: "One day, he heard a tiny cry for help.", image: "👂" },
                { text: "It was a little bunny stuck in a bush.", image: "🐰" },
                { text: "Super Bear gently lifted the bunny out.", image: "❤️" },
                { text: "They became best friends and learned that being kind makes you a true hero. Good night!", image: "😴" }
            ]
        },
        {
            title: "The Brave Lion and the Clever Mouse",
            pages: [
                { text: "The sun was setting on the warm savanna.", image: "🌅" },
                { text: "A brave lion was resting under a tree.", image: "🦁" },
                { text: "A tiny mouse accidentally woke him up.", image: "🐭" },
                { text: "The lion let the mouse go, and the mouse promised to help him one day.", image: "🤝" },
                { text: "Later, the mouse freed the lion from a hunter's net. They learned we all need each other. Good night!", image: "😴" }
            ]
        }
    ],
    currentStoryIndex: 0,
    currentPageIndex: 0,

    init() {
        this.storyImage = document.getElementById('story-image');
        this.storyText = document.getElementById('story-text');
        this.btnPrev = document.getElementById('story-prev');
        this.btnNext = document.getElementById('story-next');
        this.btnRead = document.getElementById('story-read');

        this.btnPrev.addEventListener('click', () => this.prevPage());
        this.btnNext.addEventListener('click', () => this.nextPage());
        this.btnRead.addEventListener('click', () => this.readCurrentPage());
    },

    loadStory(storyIndex) {
        this.currentStoryIndex = storyIndex;
        this.currentPageIndex = 0;
        this.renderPage();
    },

    renderPage() {
        const page = this.stories[this.currentStoryIndex].pages[this.currentPageIndex];
        this.storyText.textContent = page.text;

        // Simple pop animation for images
        this.storyImage.style.animation = 'none';
        void this.storyImage.offsetWidth; // trigger reflow
        this.storyImage.style.animation = 'popIn 0.5s';
        this.storyImage.textContent = page.image;

        // Button states
        this.btnPrev.disabled = this.currentPageIndex === 0;
        this.btnPrev.style.opacity = this.btnPrev.disabled ? '0.3' : '1';

        this.btnNext.disabled = this.currentPageIndex === this.stories[this.currentStoryIndex].pages.length - 1;
        this.btnNext.style.opacity = this.btnNext.disabled ? '0.3' : '1';

        // Auto-read on page turn
        this.readCurrentPage();
    },

    nextPage() {
        if (this.currentPageIndex < this.stories[this.currentStoryIndex].pages.length - 1) {
            window.AudioManager.playBounce();
            this.currentPageIndex++;
            this.renderPage();
        }
    },

    prevPage() {
        if (this.currentPageIndex > 0) {
            window.AudioManager.playBounce();
            this.currentPageIndex--;
            this.renderPage();
        }
    },

    readCurrentPage() {
        const text = this.stories[this.currentStoryIndex].pages[this.currentPageIndex].text;

        // Disable read button temporarily to prevent spamming
        this.btnRead.disabled = true;
        this.btnRead.style.opacity = '0.5';

        window.AudioManager.speak(text, {
            rate: 0.8, // nice and slow for bedtime
            pitch: 0.8, // slightly deeper, calmer voice for bedtime
            onEnd: () => {
                this.btnRead.disabled = false;
                this.btnRead.style.opacity = '1';
            }
        });
    },

    activate() {
        this.loadStory(0);
    },
    deactivate() {
        window.AudioManager.stop();
    }
};

window.StoryModule = StoryModule;
