/**
 * Widget 2 JS - Semicircle Arch
 */
let settings = {};
let currentProgress = 0;
let goalTarget = 100;

(function init() {
    if (typeof SE_API !== 'undefined') {
        window.addEventListener('onWidgetLoad', onLoad);
        window.addEventListener('onEventReceived', onEvent);
    } else {
        document.body.classList.add('dev-mode');
        document.getElementById('dev-controls').classList.remove('hidden');
        mockSE();
        setTimeout(() => onLoad({ detail: { fieldData: getDevSettings(), session: { data: {} } } }), 100);
    }
})();

function onLoad(obj) {
    settings = obj.detail.fieldData;
    goalTarget = settings.goalValue;
    currentProgress = settings.startingProgress;

    SE_API.store.get('goal_current').then(val => {
        if (val !== null) currentProgress = parseFloat(val);
        applyStyles();
        initPath();
        updateUI(false);
    });
}

function onEvent(obj) {
    if (!obj.detail.event) return;
    const evt = obj.detail.event;
    // Simplified event logic for speed
    let add = 0;
    if (obj.detail.listener === 'subscriber-latest') add = 1;
    else if (obj.detail.listener === 'tip-latest') add = evt.amount;

    if (add > 0) {
        currentProgress += add;
        if (currentProgress >= goalTarget) currentProgress = goalTarget; // Cap for now
        SE_API.store.set('goal_current', currentProgress);
        updateUI(true);
    }
}

function applyStyles() {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--secondary-color', settings.secondaryColor);
}

function initPath() {
    const path = document.getElementById('progress-path');
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    document.getElementById('glow-path').style.strokeDasharray = len;
}

function updateUI(anim) {
    const path = document.getElementById('progress-path');
    const len = path.getTotalLength();
    const pct = Math.min(currentProgress / goalTarget, 1);
    const offset = len * (1 - pct);

    path.style.transition = anim ? 'stroke-dashoffset 0.5s ease' : 'none';
    path.style.strokeDashoffset = offset;

    document.getElementById('current-val').innerText = (settings.currencyPrefix || '$') + Math.floor(currentProgress);
    document.getElementById('goal-val').innerText = (settings.currencyPrefix || '$') + Math.floor(goalTarget);
}

// Dev Mocks and Helpers
function mockSE() {
    window.SE_API = { store: { get: () => Promise.resolve(null), set: () => { } } };
}
function getDevSettings() {
    return {
        primaryColor: document.getElementById('dev-primary')?.value || '#ff6b6b',
        secondaryColor: document.getElementById('dev-secondary')?.value || '#ff8e8e',
        goalValue: 100, startingProgress: 25, currencyPrefix: '$'
    };
}
window.devAddProgress = (n) => { currentProgress += n; updateUI(true); };
window.devReset = () => { currentProgress = 0; updateUI(true); };
window.devComplete = () => { currentProgress = goalTarget; updateUI(true); };
