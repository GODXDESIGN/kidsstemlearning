/**
 * Main Application Router & Entry Point
 */
document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize global sub-modules
    window.AudioManager.init();
    if (window.LearningModule) window.LearningModule.init();
    if (window.PuzzleModule) window.PuzzleModule.init();
    if (window.DrawModule) window.DrawModule.init();
    if (window.StoryModule) window.StoryModule.init();
    if (window.RhymesModule) window.RhymesModule.init();
    if (window.VideosModule) window.VideosModule.init();

    // 2. DOM Elements
    const screens = document.querySelectorAll('.screen');
    const homeBtn = document.getElementById('home-btn');
    const activityCards = document.querySelectorAll('.activity-card');
    const parentBtn = document.getElementById('parent-gate-btn');
    const cancelGateBtns = document.querySelectorAll('.cancel-gate');

    // Parental Gate state
    let activeMathTarget = 0;

    // --- Core Navigation Router ---
    const navigateTo = (screenId) => {
        // Stop any ongoing audio immediately
        window.AudioManager.stop();

        // Deactivate all modules calling their lifecycle hooks if any
        if (window.LearningModule) window.LearningModule.deactivate();
        if (window.PuzzleModule) window.PuzzleModule.deactivate();
        if (window.DrawModule) window.DrawModule.deactivate();
        if (window.StoryModule) window.StoryModule.deactivate();
        if (window.RhymesModule) window.RhymesModule.deactivate();
        if (window.VideosModule) window.VideosModule.deactivate();

        // Switch active CSS classes
        screens.forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Home button visibility logic
        if (screenId === 'screen-home' || screenId === 'screen-gate') {
            homeBtn.classList.add('hidden');
        } else {
            homeBtn.classList.remove('hidden');
        }

        // Activate specific module
        if (screenId === 'screen-abc') window.LearningModule.activate();
        if (screenId === 'screen-puzzles') window.PuzzleModule.activate();
        if (screenId === 'screen-draw') window.DrawModule.activate();
        if (screenId === 'screen-stories') window.StoryModule.activate();
        if (screenId === 'screen-rhymes') window.RhymesModule.activate();
        if (screenId === 'screen-videos') window.VideosModule.activate();
        if (screenId === 'screen-parents') renderParentsDashboard();

        window.AudioManager.playBounce();
    };

    // --- Binding UI Events ---

    // Go Home
    homeBtn.addEventListener('click', () => {
        navigateTo('screen-home');
        window.AudioManager.speak('Home');
    });

    // Enter Activities
    activityCards.forEach(card => {
        card.addEventListener('click', () => {
            const target = card.getAttribute('data-target');
            // Pronounce destination early for feedback
            if (target === 'screen-stories') window.AudioManager.speak('Stories');
            if (target === 'screen-abc') window.AudioManager.speak('ABC');
            if (target === 'screen-puzzles') window.AudioManager.speak('Puzzles');
            if (target === 'screen-draw') window.AudioManager.speak('Draw');
            if (target === 'screen-rhymes') window.AudioManager.speak('Rhymes and Games');
            if (target === 'screen-videos') window.AudioManager.speak('Videos');

            setTimeout(() => navigateTo(target), 300); // sync with CSS animation tap
        });
    });

    // --- Parental Gate Logic ---
    parentBtn.addEventListener('click', () => {
        setupParentalGate();
        navigateTo('screen-gate');
    });

    cancelGateBtns.forEach(btn => {
        btn.addEventListener('click', () => navigateTo('screen-home'));
    });

    const setupParentalGate = () => {
        const problemEl = document.getElementById('math-problem');
        const numBtns = document.querySelectorAll('.num-btn');

        // Random simple addition
        const a = Math.floor(Math.random() * 5) + 5;
        const b = Math.floor(Math.random() * 5) + 5;
        activeMathTarget = a + b;

        problemEl.textContent = `${a} + ${b} = ?`;

        // Generate options including correct answer
        let options = [activeMathTarget];
        while (options.length < 4) {
            const wrong = activeMathTarget + (Math.floor(Math.random() * 6) - 3);
            if (!options.includes(wrong) && wrong !== activeMathTarget) options.push(wrong);
        }
        options.sort(() => 0.5 - Math.random());

        // Bind logic
        numBtns.forEach((btn, i) => {
            btn.textContent = options[i];
            btn.dataset.val = options[i];

            // Remove old listeners to avoid stacking
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                if (parseInt(e.target.dataset.val) === activeMathTarget) {
                    navigateTo('screen-parents');
                } else {
                    navigateTo('screen-home'); // Kick out on fail
                }
            });
        });
    };

    // --- Render Parents Dashboard ---
    const renderParentsDashboard = () => {
        const statsList = document.getElementById('progress-list');
        statsList.innerHTML = window.ProgressEngine.getStatsHTML();

        const goHomeBtn = document.querySelector('.go-home');
        // bind safely once
        const newGoHome = goHomeBtn.cloneNode(true);
        goHomeBtn.parentNode.replaceChild(newGoHome, goHomeBtn);
        newGoHome.addEventListener('click', () => navigateTo('screen-home'));
    };

    // Prevent default touch behaviors (like elastic scrolling on iOS) that ruin PWA experience
    document.addEventListener('touchmove', function (e) {
        // Only allow scrolling inside the dashboard if necessary
        if (!e.target.closest('#screen-parents')) {
            e.preventDefault();
        }
    }, { passive: false });
});
