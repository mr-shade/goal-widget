let settings = {};
let current = 0;
let target = 100;

window.addEventListener('onWidgetLoad', function (obj) {
    const fieldData = obj.detail.fieldData || {};
    const sessionData = (obj.detail.session && obj.detail.session.data) || {};
    init(fieldData, sessionData);
});

window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail.event) return;
    const evt = obj.detail.event;
    const listener = obj.detail.listener;

    if (listener === 'message' && settings.enableCommands) {
        handleCommand(evt.data);
        return;
    }

    let add = 0;
    if (settings.eventType === 'follower' && listener === 'follower-latest') add = 1;
    else if (settings.eventType === 'subscriber' && listener === 'subscriber-latest') add = 1;
    else if (settings.eventType === 'tip' && listener === 'tip-latest') add = evt.amount || 0;
    else if (settings.eventType === 'cheer' && listener === 'cheer-latest') add = evt.amount || 0;

    if (add > 0) updateProgress(add);
});

function init(fieldData, sessionData) {
    settings = {
        shapeMode: 'semi', // Default changed to match prompt preference occasionally
        styleMode: 'neon',
        primaryColor: '#ff2d95',
        secondaryColor: '#a855f7',
        trackColor: '#444444',
        textColor: '#ffffff',
        startValueColor: '#ff2d95',
        goalValueColor: '#a855f7',
        titleText: 'GOAL',
        titlePosition: 'bottom',
        fontFamily: 'Poppins',
        goalValue: 100,
        startingValue: 0,
        currencySymbol: '',
        imageUrl: '',
        imageSize: 50,
        imageOffsetY: 0,
        eventType: 'subscriber',
        enableCommands: true,
        widgetSize: 420,
        ...fieldData
    };

    target = parseFloat(settings.goalValue) || 100;
    current = parseFloat(settings.startingValue) || 0;

    SE_API.store.get('goal_unified_current').then(val => {
        if (val !== null && !isNaN(val)) current = parseFloat(val);
        render();
    });
}

function render() {
    applyStyles();
    drawShape();
    updateProgress(0);
}

function applyStyles() {
    const r = document.documentElement;
    r.style.setProperty('--primary', settings.primaryColor);
    r.style.setProperty('--secondary', settings.secondaryColor);
    r.style.setProperty('--track', settings.trackColor);
    r.style.setProperty('--text', settings.textColor);
    r.style.setProperty('--text-start', settings.startValueColor);
    r.style.setProperty('--text-goal', settings.goalValueColor);
    r.style.setProperty('--size', settings.widgetSize + 'px');

    // Font Loading and Application
    if (settings.fontFamily) {
        document.body.style.fontFamily = `'${settings.fontFamily}', sans-serif`;
        // Load Google Font dynamically
        const fontId = 'custom-font-' + settings.fontFamily.replace(/\s+/g, '-').toLowerCase();
        if (!document.getElementById(fontId)) {
            const link = document.createElement('link');
            link.id = fontId;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${settings.fontFamily.replace(/\s+/g, '+')}:wght@400;700;900&display=swap`;
            document.head.appendChild(link);
        }
    }

    // Image Logic
    const imgEl = document.getElementById('custom-image');
    if (settings.imageUrl && settings.imageUrl.trim() !== '') {
        r.style.setProperty('--img-url', `url(${settings.imageUrl})`);
        r.style.setProperty('--img-scale', settings.imageSize + '%');
        r.style.setProperty('--img-offset-y', settings.imageOffsetY + 'px');
        imgEl.classList.remove('hidden');
        document.body.classList.add('has-image');
    } else {
        imgEl.classList.add('hidden');
        document.body.classList.remove('has-image');
    }

    document.getElementById('stop1').setAttribute('stop-color', settings.primaryColor);
    document.getElementById('stop2').setAttribute('stop-color', settings.secondaryColor);

    const titleEl = document.getElementById('title-el');
    titleEl.innerText = settings.titleText;

    document.body.className = `mode-${settings.shapeMode} style-${settings.styleMode} title-${settings.titlePosition} ${settings.imageUrl ? 'has-image' : ''}`;
    if (typeof isDev !== 'undefined' && isDev) document.body.classList.add('dev');
}

function drawShape() {
    const mode = settings.shapeMode;
    let d = '';
    // SVG Center 250,250 Redius 200
    if (mode === 'full') {
        d = describeArc(250, 250, 200, 0, 359.9);
        setTransforms('');
    } else if (mode === 'semi') {
        // Upright Arch (Top half): 270° (Left) to 90° (Right) but clockwise
        d = describeArc(250, 250, 200, 225, 495); // Wait, 270 to 450
        // Actually semi is 180 deg. 270 to 450.
        d = describeArc(250, 250, 200, 270, 450);
        setTransforms('');
    } else if (mode === 'arc75') {
        // 270 deg Arc centered at Top (360)
        // 225 (Bottom-Left) to 495 (Bottom-Right)
        d = describeArc(250, 250, 200, 225, 495);
        setTransforms('');
    } else if (mode === 'openbottom') {
        // Horseshoe (300 deg): 210 to 510
        d = describeArc(250, 250, 200, 210, 510);
        setTransforms('');
    }

    ['track-path', 'progress-path', 'glow-path'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('d', d);
            const len = el.getTotalLength();
            el.style.strokeDasharray = len;
            // Track is fully visible (offset 0), others start hidden (offset len)
            el.style.strokeDashoffset = id === 'track-path' ? 0 : len;
        }
    });
}

function updateProgress(add) {
    current += add;
    if (current > target) current = target;
    SE_API.store.set('goal_unified_current', current);

    const safeTarget = target > 0 ? target : 100;
    const pct = Math.min(current / safeTarget, 1);

    ['progress-path', 'glow-path'].forEach(id => {
        const p = document.getElementById(id);
        if (p) {
            const len = p.getTotalLength();
            // Clockwise path: start is at startAngle. 
            // strokeDashoffset reduces from the end.
            // If length is 100 and pct is 0.1, offset is 90. Progress shows 10 from start.
            p.style.strokeDashoffset = len * (1 - pct);
        }
    });

    const prefix = settings.currencySymbol || '';
    const dispCurrent = isNaN(current) ? 0 : Math.floor(current);
    const dispTarget = isNaN(target) ? 100 : target;

    // Update split values
    const currentEl = document.getElementById('current-val');
    const goalEl = document.getElementById('goal-val');

    if (currentEl) currentEl.innerText = `${prefix}${dispCurrent}`;
    if (goalEl) goalEl.innerText = `${prefix}${dispTarget}`;

    // For circle mode, we might still want the center percent or main text logic 
    // but CSS handles hiding/showing.
    if (document.getElementById('center-percent')) {
        document.getElementById('center-percent').innerText = Math.floor(pct * 100) + '%';
    }
}

function handleCommand(data) {
    if (!data) return;
    const isBroadcaster = data.nick === data.channel;
    const isMod = data.tags && data.tags.mod === '1';
    if (!isBroadcaster && !isMod) return;

    const parts = (data.text || '').trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const val = parseFloat(parts[1]);

    if (cmd === '!add' && !isNaN(val)) updateProgress(val);
    else if (cmd === '!set' && !isNaN(val)) {
        current = val;
        SE_API.store.set('goal_unified_current', current);
        updateProgress(0);
    }
    else if (cmd === '!reset') {
        current = 0;
        SE_API.store.set('goal_unified_current', 0);
        updateProgress(0);
    }
}

function setTransforms(t) {
    ['track-path', 'progress-path', 'glow-path'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('transform', t);
    });
}

function describeArc(x, y, radius, startAngle, endAngle) {
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        // 0 is Top
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    // Sweep-flag 1 for Clockwise
    return [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");
}

if (typeof SE_API === 'undefined') {
    window.isDev = true;
    document.getElementById('dev-controls').classList.remove('hidden');
    window.SE_API = { store: { get: () => Promise.resolve(null), set: () => { } } };
    setTimeout(() => init({
        shapeMode: 'semi', styleMode: 'neon',
        primaryColor: '#ff2d95', secondaryColor: '#a855f7',
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
    window.devReset = () => { current = 0; SE_API.store.set('goal_unified_current', 0); updateProgress(0); };
}
