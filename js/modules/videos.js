/**
 * Educational Videos Module (YouTube Launchpad)
 * Displays curated thumbnails, auto-plays on YouTube in a new tab.
 */
const VideosModule = {
    // Top curated toddler channels
    videos: [
        {
            title: "Cocomelon - ABC Song",
            thumbnailPreview: "🍉 ABC",
            color: "#ef4444",
            url: "https://www.youtube.com/watch?v=71hqRT9U0wg" // Cocomelon example
        },
        {
            title: "Super Simple - Baby Shark",
            thumbnailPreview: "🦈🎵",
            color: "#3b82f6",
            url: "https://www.youtube.com/watch?v=XqZsoesa55w" // Super simple
        },
        {
            title: "Blippi - Colors",
            thumbnailPreview: "👓🎨",
            color: "#f59e0b",
            url: "https://www.youtube.com/watch?v=E_H50g7e5mU" // Blippi
        },
        {
            title: "Peppa Pig - Muddy Puddles",
            thumbnailPreview: "🐷💧",
            color: "#ec4899",
            url: "https://www.youtube.com/watch?v=zJgQYmQ_jQk" // Peppa
        }
    ],

    init() {
        this.grid = document.getElementById('video-grid');
    },

    render() {
        this.grid.innerHTML = '';

        this.videos.forEach(video => {
            const card = document.createElement('a');
            card.className = 'video-card';
            // Important: ?autoplay=1 appended for Youtube autoplay mechanism
            card.href = `${video.url}?autoplay=1`;
            card.target = '_blank'; // Open in new tab (or Youtube App)
            card.rel = 'noopener noreferrer';

            // For a production app, we would use image thumbnails (e.g. video.thumbnailUrl).
            // For safety and immediate demo layout, we use emoji representations.
            card.innerHTML = `
                <div class="video-thumb" style="background-color: ${video.color}20;">
                    ${video.thumbnailPreview}
                </div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <div class="play-indicator">
                        ▶️ Play
                    </div>
                </div>
            `;

            // Audio prompt on click before navigating
            card.addEventListener('click', () => {
                window.AudioManager.playBounce();
            });

            this.grid.appendChild(card);
        });
    },

    activate() {
        this.render();
        window.AudioManager.speak('Watch and Learn!');
    },

    deactivate() {
        this.grid.innerHTML = '';
    }
};

window.VideosModule = VideosModule;
