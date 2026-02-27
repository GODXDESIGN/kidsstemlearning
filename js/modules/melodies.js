/**
 * Melodies Module
 * A collection of curated kids songs with colorful visualizations.
 */
const MelodiesModule = {
    songs: [
        {
            title: "Twinkle Twinkle",
            emoji: "⭐🎶",
            color: "#f59e0b", // Yellow
            url: "https://www.youtube.com/watch?v=yCjJyiqpAuU"
        },
        {
            title: "Old MacDonald",
            emoji: "👨‍🌾🐄",
            color: "#10b981", // Green
            url: "https://www.youtube.com/watch?v=_6HzoUcx3eo"
        },
        {
            title: "Wheels on the Bus",
            emoji: "🚌💨",
            color: "#3b82f6", // Blue
            url: "https://www.youtube.com/watch?v=e_04ZrNroTo"
        },
        {
            title: "Baby Shark",
            emoji: "🦈🌊",
            color: "#00d4ff", // Cyan
            url: "https://www.youtube.com/watch?v=XqZsoesa55w"
        },
        {
            title: "Itsy Bitsy Spider",
            emoji: "🕷️🌧️",
            color: "#8b5cf6", // Purple
            url: "https://www.youtube.com/watch?v=w_lCi8U49mY"
        },
        {
            title: "Baa Baa Black Sheep",
            emoji: "🐑🧶",
            color: "#334155", // Slate (Dark Grayish)
            url: "https://www.youtube.com/watch?v=1gUbdNbu6ak"
        },
        {
            title: "Row Your Boat",
            emoji: "🚣‍♂️🛶",
            color: "#0ea5e9", // Light Blue
            url: "https://www.youtube.com/watch?v=7otAJa3jZvg"
        },
        {
            title: "Five Little Monkeys",
            emoji: "🐒🛏️",
            color: "#d97706", // Brownish/Orange
            url: "https://www.youtube.com/watch?v=b0NHrFNZWh0"
        },
        {
            title: "If You're Happy",
            emoji: "👏😊",
            color: "#ff3b3b", // Bright Red
            url: "https://www.youtube.com/watch?v=l4WNrvVjiTw"
        },
        {
            title: "Head, Shoulders, Knees",
            emoji: "👶🤸",
            color: "#14b8a6", // Teal
            url: "https://www.youtube.com/watch?v=WX8HmogNyCY"
        }
    ],

    init() {
        this.grid = document.getElementById('melodies-grid');
    },

    render() {
        this.grid.innerHTML = '';

        this.songs.forEach(song => {
            const card = document.createElement('a');
            card.className = 'video-card';
            // Auto play link for easy access
            card.href = `${song.url}?autoplay=1`;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';

            card.innerHTML = `
                <div class="video-thumb" style="background-color: ${song.color}20;">
                    ${song.emoji}
                </div>
                <div class="video-info">
                    <h3>${song.title}</h3>
                    <div class="play-indicator" style="background-color: ${song.color};">
                        🎵 Sing
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                window.AudioManager.playBounce();
            });

            this.grid.appendChild(card);
        });
    },

    activate() {
        this.render();
        window.AudioManager.speak('Sing a song!');
    },

    deactivate() {
        this.grid.innerHTML = '';
    }
};

window.MelodiesModule = MelodiesModule;
