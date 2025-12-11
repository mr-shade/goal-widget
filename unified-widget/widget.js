let settings = {};
let current = 0;
let target = 100;

// Initialize
window.addEventListener('onWidgetLoad', function (obj) {
    init(obj.detail.fieldData, obj.detail.session.data);
});

// Event Handler
window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail.event) return;
    const evt = obj.detail.event;
    const listener = obj.detail.listener;

    // Chat Commands
    if (listener === 'message' && settings.enableCommands) {
        handleCommand(evt.data);
        return;
    }

    // Goal Events
    let add = 0;
    if (settings.eventType === 'follower' && listener === 'follower-latest') add = 1;
    else if (settings.eventType === 'subscriber' && listener === 'subscriber-latest') add = 1;
    else if (settings.eventType === 'tip' && listener === 'tip-latest') add = evt.amount;
    else if (settings.eventType === 'cheer' && listener === 'cheer-latest') add = evt.amount;

    if (add > 0) updateProgress(add);
});

// Logic
function init(fieldData, sessionData) {
    settings = fieldData;
    target = settings.goalValue;
    current = settings.startingValue;

    // Persistence
    SE_API.store.get('goal_unified_current').then(val => {
        if (val !== null) current = parseFloat(val);
        render();
    });
}

function render() {
    applyStyles();
    drawShape();
    updateProgress(0); // Refresh visual
}

function applyStyles() {
    const r = document.documentElement;
    r.style.setProperty('--primary', settings.primaryColor);
    r.style.setProperty('--secondary', settings.secondaryColor);
    r.style.setProperty('--track', settings.trackColor);
    r.style.setProperty('--text', settings.textColor);
    r.style.setProperty('--size', settings.widgetSize + 'px');

    // Update Gradient
    document.getElementById('stop1').setAttribute('stop-color', settings.primaryColor);
    document.getElementById('stop2').setAttribute('stop-color', settings.secondaryColor);

    // Update Text
    document.getElementById('title-el').innerText = settings.titleText;
    document.getElementById('title-el').style.fontFamily = settings.fontFamily;

    // Mode Classes
    document.body.className = `mode-${settings.shapeMode} style-${settings.styleMode}`;
    if (typeof isDev !== 'undefined' && isDev) document.body.classList.add('dev');
}

function drawShape() {
    const mode = settings.shapeMode;
    let d = '';
    // 500x500 box, center 250,250, radius 200

    if (mode === 'full') {
        // Circle starting at top
        d = describeArc(250, 250, 200, 0, 359.99);
        // Rotate -90 via transform to start at top
        setTransforms('rotate(-90 250 250)');
    } else if (mode === 'semi') {
        // Top-left (270) to Top-right (90) ? No, Arch usually 9 oclock to 3 oclock (180 deg span)
        // Let's do Standard Arch: Left(180) -> Top(270) -> Right(0/360)?
        // Start Angle: -90 (Top), -180 (Left? No).
        // Standard Math: 0=3oclock. 180=9oclock.
        // Arch: 180 -> 360 (Clockwise).
        d = describeArc(250, 250, 200, 180, 360);
        setTransforms('');
    } else if (mode === 'arc75') {
        // 270 degrees. Start Bottom-Left (135) -> Top -> Bottom-Right (45).
        d = describeArc(250, 250, 200, 135, 405);
        setTransforms('');
    } else if (mode === 'openbottom') {
        // Almost full, gap at bottom. Start 90+gap -> 90-gap?
        // Start 110 -> 430.
        d = describeArc(250, 250, 200, 110, 430);
        setTransforms('');
    }

    ['track-path', 'progress-path', 'glow-path'].forEach(id => {
        const el = document.getElementById(id);
        el.setAttribute('d', d);
        const len = el.getTotalLength();
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
    });
}

function updateProgress(add) {
    current += add;
    if (current > target) current = target; // Cap
    SE_API.store.set('goal_unified_current', current);

    const pct = Math.min(current / target, 1);
    const paths = ['progress-path', 'glow-path'].map(id => document.getElementById(id));

    paths.forEach(p => {
        const len = p.getTotalLength();
        p.style.strokeDashoffset = len * (1 - pct);
    });

    // Text Updates
    const prefix = settings.currencySymbol || '';
    document.getElementById('value-el').innerText = `${prefix}${current} / ${prefix}${target}`;
    document.getElementById('center-percent').innerText = Math.floor(pct * 100) + '%';
}

function setTransforms(t) {
    ['track-path', 'progress-path', 'glow-path'].forEach(id => {
        document.getElementById(id).setAttribute('transform', t);
    });
}

// Helpers
function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

// Dev Mode
if (typeof SE_API === 'undefined') {
    window.isDev = true;
    document.getElementById('dev-controls').classList.remove('hidden');
    window.SE_API = { store: { get: () => Promise.resolve(null), set: () => { } } };

    // Default Dev Init
    setTimeout(() => init({
        shapeMode: 'full', styleMode: 'neon',
        primaryColor: '#ff2d95', secondaryColor: '#00ffd5',
        trackColor: '#444', textColor: '#fff',
        titleText: 'GOAL', fontFamily: 'Poppins',
        goalValue: 100, startingValue: 0, widgetSize: 400
    }), 100);

    window.devUpdate = () => {
        settings.shapeMode = document.getElementById('d-shape').value;
        settings.styleMode = document.getElementById('d-style').value;
        render();
    };
    window.devAdd = (n) => updateProgress(n);
    window.devReset = () => { current = 0; updateProgress(0); };
}
