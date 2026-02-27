/**
 * Story Module (Linear Visuals and Text-to-Speech)
 */
const StoryModule = {
    stories: [
        {
            title: "The Little Fox",
            pages: [
                { text: "The little fox went into the forest...", image: "🦊" },
                { text: "He saw a big green tree.", image: "🌳" },
                { text: "Under the tree was a shiny red apple.", image: "🍎" },
                { text: "He ate the apple and went to sleep. The end.", image: "😴" }
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
