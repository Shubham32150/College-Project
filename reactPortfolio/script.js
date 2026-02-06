// ========================================
// State Management
// ========================================
let members = [];
let activeUser = '';
let currentDirectory = '/home/prayatna';
let terminalLines = [];
let selectedProfile = '';
let terminalBusy = false;
let filesystem = {};

// ========================================
// LocalStorage Helper
// ========================================
function useLocalStorage(key, defaultValue) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore
    }
}

// ========================================
// Weather Functions
// ========================================
function formatTempC(t) {
    const v = Math.round(t);
    return `${v}°C`;
}

async function getWeather(city) {
    const q = city.trim();
    if (!q) throw new Error('City required');

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
    const geo = await fetch(geoUrl);
    if (!geo.ok) throw new Error('Geocoding failed');
    const geoJson = await geo.json();
    const hit = geoJson.results?.[0];
    if (!hit) throw new Error('City not found');

    const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
    const w = await fetch(wUrl);
    if (!w.ok) throw new Error('Weather fetch failed');
    const wJson = await w.json();

    const current = wJson.current;
    if (!current) throw new Error('Weather unavailable');

    const desc = weatherCodeToText(current.weather_code);
    return {
        place: `${hit.name}${hit.admin1 ? `, ${hit.admin1}` : ''}, ${hit.country}`,
        tempC: current.temperature_2m,
        windKmh: current.wind_speed_10m,
        desc,
    };
}

function weatherCodeToText(code) {
    if (code === 0) return 'Clear';
    if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
    if (code === 45 || code === 48) return 'Fog';
    if (code === 51 || code === 53 || code === 55) return 'Drizzle';
    if (code === 56 || code === 57) return 'Freezing drizzle';
    if (code === 61 || code === 63 || code === 65) return 'Rain';
    if (code === 66 || code === 67) return 'Freezing rain';
    if (code === 71 || code === 73 || code === 75) return 'Snow';
    if (code === 77) return 'Snow grains';
    if (code === 80 || code === 81 || code === 82) return 'Rain showers';
    if (code === 85 || code === 86) return 'Snow showers';
    if (code === 95) return 'Thunderstorm';
    if (code === 96 || code === 99) return 'Thunderstorm (hail)';
    return 'Conditions';
}

function asciiWeather(desc) {
    const d = desc.toLowerCase();
    if (d.includes('clear')) {
        return [
            '     \\   /     ',
            '      .-.      ',
            '   ― (   ) ―   ',
            '      `-\'      ',
            '     /   \\     ',
        ].join('\n');
    }
    if (d.includes('cloud')) {
        return [
            '             ',
            '     .--.    ',
            '  .-(    ).  ',
            ' (___.__)__) ',
            '             ',
        ].join('\n');
    }
    if (d.includes('fog')) {
        return [
            ' _ - _ - _ - ',
            '  _ - _ - _  ',
            ' _ - _ - _ - ',
            '  _ - _ - _  ',
            ' _ - _ - _ - ',
        ].join('\n');
    }
    if (d.includes('snow')) {
        return [
            '     .--.    ',
            '  .-(    ).  ',
            ' (___.__)__) ',
            '   *  *  *   ',
            '  *  *  *    ',
        ].join('\n');
    }
    if (d.includes('thunder')) {
        return [
            '     .--.    ',
            '  .-(    ).  ',
            ' (___.__)__) ',
            '    ⚡⚡⚡     ',
            '    \' \' \'    ',
        ].join('\n');
    }
    // rain default
    return [
        '     .--.    ',
        '  .-(    ).  ',
        ' (___.__)__) ',
        '   \' \' \' \'   ',
        '  \' \' \' \'    ',
    ].join('\n');
}

// ========================================
// Virtual Filesystem
// ========================================
function createFilesystem(members) {
    const memberById = {};
    members.forEach(m => {
        memberById[m.id] = m;
    });

    const fs = {
        '/': {
            type: 'dir',
            children: ['home', 'team', 'projects', 'README.txt', '.vault'],
        },
        '/README.txt': {
            type: 'file',
            content:
                'ARCHOA — a studio-minded student team.\n\nTip: try `help`, `whoami`, `ls`, `cd`, `cat`, `neofetch`, `weather kathmandu`, `open team`.\n',
        },
        '/home': { type: 'dir', children: members.map(m => m.id) },
        '/team': { type: 'dir', children: ['manifesto.txt', 'members.txt'] },
        '/team/manifesto.txt': {
            type: 'file',
            content:
                'We build quiet, confident interfaces.\nCraft over noise. Details over drama.\n\nARCHOA ships:\n- clear IA\n- fast interactions\n- durable aesthetics\n',
        },
        '/team/members.txt': {
            type: 'file',
            content: members.map(m => `- ${m.name} — ${m.role}`).join('\n') + '\n',
        },
        '/projects': {
            type: 'dir',
            children: ['terminal-portfolio.md', 'ui-systems.md', 'quality-notes.md'],
        },
        '/projects/terminal-portfolio.md': {
            type: 'file',
            content:
                '# Terminal Portfolio\nA browser terminal that teaches you the team.\n\nHighlights:\n- command parser\n- virtual FS\n- weather lookup\n- neat typography\n',
        },
        '/projects/ui-systems.md': {
            type: 'file',
            content:
                '# UI Systems\nAn elegant design language: restrained palette, serif headlines, crisp spacing.\n',
        },
        '/projects/quality-notes.md': {
            type: 'file',
            content:
                '# Quality Notes\nWe test flows, edge-cases, and performance.\nWe remove friction.\n',
        },
        '/.vault': { type: 'dir', children: ['prize.txt'] },
        '/.vault/prize.txt': {
            type: 'file',
            content: 'First prize is a side-effect of taste + execution.\n',
        },
        __memberById: memberById,
    };

    // Add member home directories
    members.forEach(m => {
        const base = `/home/${m.id}`;
        fs[base] = { type: 'dir', children: ['about.txt', 'skills.txt', 'links.txt'] };
        fs[`${base}/about.txt`] = {
            type: 'file',
            content: `${m.name}\n${m.role}\n\n${m.vibe}\n`,
        };
        fs[`${base}/skills.txt`] = {
            type: 'file',
            content: m.skills.map(s => `• ${s}`).join('\n') + '\n',
        };
        fs[`${base}/links.txt`] = {
            type: 'file',
            content: m.links.map(l => `${l.label}: ${l.href}`).join('\n') + '\n',
        };
    });

    return fs;
}

// ========================================
// Path Utilities
// ========================================
function resolvePath(path) {
    const p = path.trim();
    if (!p) return currentDirectory;
    if (p.startsWith('/')) return normalizePath(p);
    return normalizePath(`${currentDirectory}/${p}`);
}

function normalizePath(path) {
    const parts = path.split('/').filter(Boolean);
    const out = [];
    for (const part of parts) {
        if (part === '.') continue;
        if (part === '..') out.pop();
        else out.push(part);
    }
    return '/' + out.join('/');
}

// ========================================
// Terminal Commands
// ========================================
function ls(pathArg) {
    const target = resolvePath(pathArg || '');
    const node = filesystem[target];
    if (!node) return { ok: false, out: `ls: cannot access '${target}': No such file or directory` };
    if (node.type !== 'dir') return { ok: true, out: target.split('/').pop() || target };
    const list = node.children.slice().sort((a, b) => a.localeCompare(b));
    return { ok: true, out: list.join('  ') };
}

function cat(pathArg) {
    const target = resolvePath(pathArg || '');
    const node = filesystem[target];
    if (!node) return { ok: false, out: `cat: ${target}: No such file or directory` };
    if (node.type !== 'dir') return { ok: true, out: node.content };
    return { ok: false, out: `cat: ${target}: Is a directory` };
}

function cd(pathArg) {
    const target = resolvePath(pathArg || '/');
    const node = filesystem[target];
    if (!node) return { ok: false, out: `cd: ${target}: No such file or directory` };
    if (node.type !== 'dir') return { ok: false, out: `cd: ${target}: Not a directory` };
    currentDirectory = target;
    return { ok: true, out: '' };
}

function whoami() {
    const m = filesystem.__memberById?.[activeUser];
    if (!m) return { ok: true, out: activeUser };
    return { ok: true, out: `${m.name} — ${m.role}` };
}

function help() {
    return {
        ok: true,
        out: [
            'help                Show this help',
            'clear               Clear screen',
            'whoami              Current profile',
            'users               List user profiles',
            'su <user>           Switch profile',
            'pwd                 Print working directory',
            'ls [path]           List directory',
            'cd <path>           Change directory',
            'cat <file>          Read file',
            'open team|projects  Quick open',
            'weather <city>      Live weather (Open‑Meteo)',
            'neofetch            System card',
            'hint                A tasteful secret',
        ].join('\n'),
    };
}

// ========================================
// Terminal Execution
// ========================================
async function runCommand(cmdRaw) {
    const cmd = cmdRaw.trim();
    if (!cmd) return;

    addTerminalLine('in', `${activeUser}@archoa:${currentDirectory}$ ${cmd}`);

    const [head, ...rest] = cmd.split(/\s+/);
    const args = rest;

    if (head === 'clear') {
        terminalLines = [];
        renderTerminalOutput();
        return;
    }

    if (head === 'help') {
        addTerminalLine('out', help().out);
        return;
    }

    if (head === 'pwd') {
        addTerminalLine('out', currentDirectory);
        return;
    }

    if (head === 'whoami') {
        addTerminalLine('out', whoami().out);
        return;
    }

    if (head === 'users') {
        addTerminalLine('out', members.map(m => m.id).join('  '));
        return;
    }

    if (head === 'su') {
        const target = (args[0] || '').trim();
        const ok = members.some(m => m.id === target);
        if (!ok) {
            addTerminalLine('out', `su: unknown user: ${target || '(empty)'}`);
            return;
        }
        setActiveUser(target);
        addTerminalLine('sys', `Switched to ${target}.`);
        return;
    }

    if (head === 'ls') {
        const res = ls(args[0]);
        addTerminalLine('out', res.out);
        return;
    }

    if (head === 'cd') {
        const res = cd(args[0]);
        if (res.out) addTerminalLine('out', res.out);
        updatePrompt();
        return;
    }

    if (head === 'cat') {
        const res = cat(args[0]);
        addTerminalLine('out', res.out);
        return;
    }

    if (head === 'open') {
        const what = (args[0] || '').toLowerCase();
        if (what === 'team') {
            cd('/team');
            addTerminalLine('out', ls('/team').out);
            updatePrompt();
            return;
        }
        if (what === 'projects') {
            cd('/projects');
            addTerminalLine('out', ls('/projects').out);
            updatePrompt();
            return;
        }
        addTerminalLine('out', 'open: use `open team` or `open projects`');
        return;
    }

    if (head === 'neofetch') {
        const m = members.find(x => x.id === activeUser);
        const card = [
            '      _    ____   ____ _   _  ___   _   ',
            '     / \\  |  _ \\ / ___| | | |/ _ \\ / \\  ',
            '    / _ \\ | |_) | |   | |_| | | | / _ \\ ',
            '   / ___ \\|  _ <| |___|  _  | |_| / ___ \\',
            '  /_/   \\_\\_| \\_\\____|_| |_|\\___/_/   \\_\\',
            '',
            `  user:     ${activeUser}`,
            `  cwd:      ${currentDirectory}`,
            `  profile:  ${m ? m.name : '—'}`,
            '  theme:    Old money / warm neutrals',
            '  build:    HTML + CSS + JavaScript',
        ].join('\n');
        addTerminalLine('out', card);
        return;
    }

    if (head === 'hint') {
        const txt = 'Try `ls /.vault` — but only if you like quiet confidence.';
        addTerminalLine('out', txt);
        return;
    }

    if (head === 'weather') {
        const city = args.join(' ').trim();
        if (!city) {
            addTerminalLine('out', 'usage: weather <city>');
            return;
        }
        terminalBusy = true;
        updateInputPlaceholder();
        try {
            const w = await getWeather(city);
            const block = [
                `${w.place}`,
                `${w.desc} · ${formatTempC(w.tempC)} · wind ${Math.round(w.windKmh)} km/h`,
                '',
                asciiWeather(w.desc),
            ].join('\n');
            addTerminalLine('out', block);
        } catch (e) {
            addTerminalLine(
                'out',
                `weather: ${e.message}. (Tip: try a bigger city name)`
            );
        } finally {
            terminalBusy = false;
            updateInputPlaceholder();
        }
        return;
    }

    addTerminalLine('out', `${head}: command not found (try \`help\`)`);
}

// ========================================
// Terminal UI Functions
// ========================================
function addTerminalLine(kind, text) {
    terminalLines.push({ kind, text });
    renderTerminalOutput();
    scrollTerminalToBottom();
}

function renderTerminalOutput() {
    const output = document.getElementById('terminal-output');
    if (terminalLines.length === 0) {
        output.innerHTML = '<div class="terminal-cleared">(cleared)</div>';
        return;
    }

    output.innerHTML = terminalLines
        .map(ln => {
            const className = ln.kind === 'in' ? 'input' : ln.kind === 'sys' ? 'system' : 'output';
            return `<pre class="terminal-line ${className}">${escapeHtml(ln.text)}</pre>`;
        })
        .join('');
}

function scrollTerminalToBottom() {
    const output = document.getElementById('terminal-output');
    setTimeout(() => {
        output.scrollTop = output.scrollHeight;
    }, 0);
}

function updatePrompt() {
    document.getElementById('prompt-user').textContent = `${activeUser}@archoa`;
    document.getElementById('prompt-path').textContent = currentDirectory;
}

function updateInputPlaceholder() {
    const input = document.getElementById('terminal-input');
    input.placeholder = terminalBusy ? 'Fetching…' : 'Type a command (help)';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Modal Functions
// ========================================
function openTerminal() {
    const modal = document.getElementById('terminal-modal');
    modal.style.display = 'block';

    // Initialize terminal if first open
    if (terminalLines.length === 0) {
        terminalLines = [
            { kind: 'sys', text: 'ARCHOA Terminal — type `help`' },
            { kind: 'out', text: 'Connected.' },
        ];
        renderTerminalOutput();
    }

    // Focus input
    setTimeout(() => {
        document.getElementById('terminal-input').focus();
    }, 100);
}

function closeTerminal() {
    const modal = document.getElementById('terminal-modal');
    modal.style.display = 'none';
}

// ========================================
// User Management
// ========================================
function setActiveUser(userId) {
    activeUser = userId;
    currentDirectory = `/home/${userId}`;
    setLocalStorage('archoa.activeUser', userId);

    // Update user select
    const select = document.getElementById('user-select');
    select.value = userId;

    updatePrompt();
}

function setSelectedProfile(userId) {
    selectedProfile = userId;
    setLocalStorage('archoa.selectedProfile', userId);

    // Update profile buttons
    document.querySelectorAll('.profile-btn').forEach(btn => {
        if (btn.dataset.userId === userId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ========================================
// Rendering Functions
// ========================================
function renderTeamGrid() {
    const grid = document.getElementById('team-grid');
    grid.innerHTML = members.map(m => `
    <article class="member-card">
      <div class="member-header">
        <img src="${m.photoUrl}" alt="${m.name} portrait" class="member-photo" loading="lazy" />
        <div class="member-info">
          <h3 class="member-name">${m.name}</h3>
          <p class="member-role">${m.role}</p>
          <div class="member-skills">
            ${m.skills.slice(0, 4).map(s => `<span class="pill">${s}</span>`).join('')}
          </div>
        </div>
      </div>
      <p class="member-vibe">${m.vibe}</p>
      <div class="member-actions">
        <button class="btn-member-terminal" data-member-terminal="${m.id}">
          Open terminal as ${m.id}
        </button>
        ${m.links.map(l => `
          <a href="${l.href}" 
             class="member-link" 
             ${l.href.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>
            ${l.label}
          </a>
        `).join('')}
      </div>
    </article>
  `).join('');

    // Add event listeners for member terminal buttons
    document.querySelectorAll('[data-member-terminal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.dataset.memberTerminal;
            setSelectedProfile(userId);
            setActiveUser(userId);
            openTerminal();
        });
    });
}

function renderProfileSelector() {
    const selector = document.getElementById('profile-selector');
    selector.innerHTML = members.map(m => `
    <button class="profile-btn ${selectedProfile === m.id ? 'active' : ''}" data-user-id="${m.id}">
      <div class="profile-label">PROFILE</div>
      <div class="profile-id">${m.id}</div>
      <div class="profile-role">${m.role}</div>
    </button>
  `).join('');

    // Add event listeners
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.dataset.userId;
            setSelectedProfile(userId);
            setActiveUser(userId);
            openTerminal();
        });
    });
}

function renderUserSelect() {
    const select = document.getElementById('user-select');
    select.innerHTML = members.map(m => `
    <option value="${m.id}">${m.id}</option>
  `).join('');
    select.value = activeUser;
}

// ========================================
// Event Listeners
// ========================================
function initializeEventListeners() {
    // Terminal open buttons
    document.querySelectorAll('[data-open-terminal]').forEach(btn => {
        btn.addEventListener('click', openTerminal);
    });

    // Terminal close buttons
    document.querySelectorAll('[data-close-terminal]').forEach(btn => {
        btn.addEventListener('click', closeTerminal);
    });

    // Terminal form submit
    document.getElementById('terminal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (terminalBusy) return;

        const input = document.getElementById('terminal-input');
        const value = input.value;
        input.value = '';

        runCommand(value);
    });

    // User select change
    document.getElementById('user-select').addEventListener('change', (e) => {
        setActiveUser(e.target.value);
    });

    // Quick command buttons
    document.querySelectorAll('[data-command]').forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.dataset.command;
            const input = document.getElementById('terminal-input');
            input.value = cmd;
            input.focus();
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K to open terminal
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openTerminal();
        }

        // Esc to close terminal
        if (e.key === 'Escape') {
            const modal = document.getElementById('terminal-modal');
            if (modal.style.display === 'block') {
                closeTerminal();
            }
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#home' || href.startsWith('#')) {
                e.preventDefault();
                const target = href === '#home' ? document.body : document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// ========================================
// Initialization
// ========================================
function init() {
    // Load member data from JSON script tag
    const memberDataEl = document.getElementById('member-data');
    members = JSON.parse(memberDataEl.textContent);

    // Initialize filesystem
    filesystem = createFilesystem(members);

    // Load state from localStorage
    activeUser = useLocalStorage('archoa.activeUser', members[0]?.id || '');
    selectedProfile = useLocalStorage('archoa.selectedProfile', members[0]?.id || '');
    currentDirectory = `/home/${activeUser}`;

    // Render dynamic content
    renderTeamGrid();
    renderProfileSelector();
    renderUserSelect();

    // Initialize event listeners
    initializeEventListeners();

    // Update UI
    updatePrompt();

    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
