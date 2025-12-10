/** Widget 3 JS */
let current = 0; let target = 100;
(function () {
    if (typeof SE_API !== 'undefined') {
        window.addEventListener('onWidgetLoad', l => init(l.detail.fieldData));
        window.addEventListener('onEventReceived', e => onEvt(e.detail));
    } else {
        document.body.classList.add('dev-mode');
        document.getElementById('dev-controls').classList.remove('hidden');
        window.SE_API = { store: { get: () => Promise.resolve(null), set: () => { } } };
        setTimeout(() => init({ goalValue: 100, startingProgress: 0 }), 100);
    }
})();

function init(s) {
    target = s.goalValue; current = s.startingProgress || 0;
    setupPath(); update();
}

function onEvt(d) {
    if (!d.event) return;
    const amt = d.listener.includes('tip') ? d.event.amount : 1;
    current += amt; update();
}

function setupPath() {
    const p = document.getElementById('progress-path');
    const len = p.getTotalLength();
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len; // Empty
    document.getElementById('glow-path').style.strokeDasharray = len;
}

function update() {
    const p = document.getElementById('progress-path');
    const len = p.getTotalLength();
    const pct = Math.min(current / target, 1);
    const off = len * (1 - pct);
    p.style.strokeDashoffset = off;
    document.getElementById('label-current').innerText = '$' + Math.floor(current);
    document.getElementById('label-goal').innerText = '$' + Math.floor(target);
}

window.devAdd = (n) => { current += n; update(); };
window.devReset = () => { current = 0; update(); };
