//  * CodeCraft Trio - Team Portfolio JavaScript
//     * Modular, clean, and well - organized
//         */

import { teamMembers, asciiArt, defaultProjects } from './data.js';
import { db, collection, addDoc, getDocs, onSnapshot, deleteDoc, doc, query, orderBy, updateDoc, where, getDoc, storage, ref, uploadBytes, getDownloadURL } from './firebase.js';

// ============================================
// APP STATE
// ============================================
const AppState = {
    currentTab: 'feed',
    currentUser: 'prayatna',
    currentDir: '/home/prayatna',
    commandHistory: [],
    historyIndex: -1,
    commandCount: 0,
    gameMode: null,
    startTime: Date.now()
};

// ============================================
// DOM ELEMENTS CACHE
// ============================================
const DOM = {};

function cacheDOMElements() {
    DOM.navItems = document.querySelectorAll('.nav-item');
    DOM.sections = {
        feed: document.getElementById('feed-section'),
        about: document.getElementById('about-section'),
        content: document.getElementById('content-section'),
        guestbook: document.getElementById('guestbook-section')
    };
    DOM.themeToggle = document.getElementById('theme-toggle');
    DOM.body = document.body;

    // Terminal elements
    DOM.terminalOutput = document.getElementById('terminal-output');
    DOM.terminalInput = document.getElementById('terminal-input');
    DOM.terminalPrompt = document.getElementById('terminal-prompt');
    DOM.terminalTitle = document.getElementById('terminal-title');
    DOM.terminalBody = document.getElementById('terminal-body');
    DOM.userSelectBtns = document.querySelectorAll('.user-select-btn');
    DOM.quickCmds = document.querySelectorAll('.quick-cmd');
    DOM.statusUser = document.getElementById('status-user');
    DOM.statusDir = document.getElementById('status-dir');
    DOM.statusCmds = document.getElementById('status-cmds');

    // Guestbook
    DOM.guestbookForm = document.getElementById('guestbook-form');
    DOM.guestbookEntries = document.getElementById('guestbook-entries-container');

    // Newsletter
    DOM.newsletterForm = document.getElementById('newsletter-form');
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();
    initTabNavigation();
    initThemeToggle();
    initTerminal();
    initGuestbook();
    initNewsletter();
    initTeamAvatars();

    // Dynamic Content & CRUD
    initDynamicContent();
    setupDynamicEventListeners();

    console.log('🚀 Archora Portfolio Loaded!');
    console.log('💻 Type "help" in the terminal to get started');
});


// ============================================
// TAB NAVIGATION
// ============================================
function initTabNavigation() {
    DOM.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    DOM.navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelector(`.nav-item[data-tab="${tabName}"]`).classList.add('active');

    Object.keys(DOM.sections).forEach(key => {
        const section = DOM.sections[key];
        if (key === tabName) {
            section.classList.remove('hidden');
            section.classList.add('fade-in');
        } else {
            section.classList.add('hidden');
            section.classList.remove('fade-in');
        }
    });

    AppState.currentTab = tabName;

    if (tabName === 'about' && DOM.terminalInput) {
        setTimeout(() => DOM.terminalInput.focus({ preventScroll: true }), 100);
    }
}

// ============================================
// THEME TOGGLE
// ============================================
function initThemeToggle() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        DOM.body.classList.add(savedTheme);
    } else {
        DOM.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    }

    DOM.themeToggle.addEventListener('click', () => {
        DOM.body.classList.toggle('dark-theme');
        const theme = DOM.body.classList.contains('dark-theme') ? 'dark-theme' : 'light';
        localStorage.setItem('theme', theme);
    });
}

// ============================================
// TERMINAL FUNCTIONALITY
// ============================================
function initTerminal() {
    // User selector & Quick commands
    DOM.userSelectBtns.forEach(btn => btn.addEventListener('click', () => switchUser(btn.dataset.user)));

    document.querySelectorAll('.fs-user-btn').forEach(btn =>
        btn.addEventListener('click', () => switchUser(btn.dataset.user))
    );

    DOM.quickCmds.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.dataset.cmd;
            DOM.terminalInput.value = cmd;
            executeCommand(cmd);
            DOM.terminalInput.value = '';
        });
    });

    DOM.terminalInput.addEventListener('keydown', handleTerminalInput);
    switchUser('prayatna');

    // Window Controls
    const terminalWindow = document.querySelector('.terminal-window');
    const reopenBtn = document.getElementById('reopen-terminal');

    document.querySelector('.control.close')?.addEventListener('click', () => {
        terminalWindow.classList.add('hidden');
        reopenBtn?.classList.remove('hidden');
        AppState.commandHistory = [];
        AppState.historyIndex = -1;
        AppState.commandCount = 0;
        switchUser('prayatna');
    });

    document.querySelector('.control.minimize')?.addEventListener('click', () => {
        terminalWindow.classList.toggle('fullscreen');
        terminalWindow.classList.remove('minimized');
    });

    document.querySelector('.control.maximize')?.addEventListener('click', () => {
        terminalWindow.classList.toggle('minimized');
        if (terminalWindow.classList.contains('minimized')) terminalWindow.classList.remove('fullscreen');
    });

    reopenBtn?.addEventListener('click', () => {
        terminalWindow.classList.remove('hidden', 'minimized', 'fullscreen');
        reopenBtn.classList.add('hidden');
    });
}

function switchUser(user) {
    if (!teamMembers[user]) return;

    AppState.currentUser = user;
    AppState.currentDir = `/home/${user}`;

    DOM.userSelectBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.user === user));
    document.querySelectorAll('.fs-user-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.user === user));

    DOM.terminalOutput.innerHTML = '';
    updateTerminalPrompt();
    printToTerminal(asciiArt.logo, false);
    printToTerminal(`\nWelcome to Archora Terminal!`, false);
    printToTerminal(`Current user: <span style="color:${teamMembers[user].color}">${teamMembers[user].name}</span>`, false);
    printToTerminal(`Type <span class="term-yellow">help</span> to see available commands.\n`, false);

    DOM.terminalInput.focus();
}

function updateTerminalPrompt() {
    const user = teamMembers[AppState.currentUser];
    const promptText = `<span style="color:${user.color}">${AppState.currentUser}</span>@archora:<span class="term-blue">${AppState.currentDir}</span>$`;
    DOM.terminalPrompt.innerHTML = promptText;
    DOM.terminalTitle.textContent = `${AppState.currentUser}@archora:~`;

    if (DOM.statusUser) DOM.statusUser.textContent = `user: ${AppState.currentUser}`;
    if (DOM.statusDir) DOM.statusDir.textContent = `dir: ${AppState.currentDir}`;
    if (DOM.statusCmds) DOM.statusCmds.textContent = `cmds: ${AppState.commandCount}`;
}

function handleTerminalInput(e) {
    if (e.key === 'Enter') {
        const cmd = DOM.terminalInput.value.trim();
        if (cmd) {
            executeCommand(cmd);
            AppState.commandHistory.push(cmd);
            AppState.historyIndex = AppState.commandHistory.length;
            AppState.commandCount++;
            updateTerminalPrompt();
        }
        DOM.terminalInput.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (AppState.historyIndex > 0) {
            AppState.historyIndex--;
            DOM.terminalInput.value = AppState.commandHistory[AppState.historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (AppState.historyIndex < AppState.commandHistory.length - 1) {
            AppState.historyIndex++;
            DOM.terminalInput.value = AppState.commandHistory[AppState.historyIndex];
        } else {
            AppState.historyIndex = AppState.commandHistory.length;
            DOM.terminalInput.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        autocompleteCommand();
    }
}

function autocompleteCommand() {
    const cmds = Object.keys(terminalCommands);
    const val = DOM.terminalInput.value.toLowerCase();
    const matches = cmds.filter(c => c.startsWith(val));

    if (matches.length === 1) {
        DOM.terminalInput.value = matches[0];
    } else if (matches.length > 1) {
        printToTerminal(`<span class="term-dim">${matches.join('  ')}</span>`, false);
    }
}

function executeCommand(cmdStr) {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const user = teamMembers[AppState.currentUser];
    const cmdLine = document.createElement('div');
    cmdLine.className = 'cmd-line';
    cmdLine.innerHTML = `<span class="terminal-prompt"><span style="color:${user.color}">${AppState.currentUser}</span>@archora:<span class="term-blue">${AppState.currentDir}</span>$</span> ${escapeHtml(trimmed)}`;
    DOM.terminalOutput.appendChild(cmdLine);

    if (AppState.gameMode) {
        handleGameMode(trimmed);
        return;
    }

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (terminalCommands[cmd]) {
        const result = terminalCommands[cmd](args);
        if (result instanceof Promise) {
            result.then(output => { if (output !== null) printToTerminal(output, false); });
        } else if (result !== null) {
            printToTerminal(result, false);
        }
    } else {
        printToTerminal(`<span class="term-red">bash: ${escapeHtml(cmd)}: command not found</span>`, false);
        printToTerminal(`<span class="term-dim">Type "help" for available commands</span>`, false);
    }

    scrollTerminal();
}

function handleGameMode(input) {
    const mode = AppState.gameMode;
    if (mode.type === 'guess') {
        const guess = parseInt(input);
        if (isNaN(guess)) return printToTerminal('<span class="term-red">Please enter a number!</span>', false);

        mode.attempts++;
        if (guess === mode.target) {
            printToTerminal(`<span class="term-green">🎉 Correct! The number was ${mode.target}</span>`, false);
            printToTerminal(`<span class="term-dim">Attempts: ${mode.attempts}</span>`, false);
            AppState.gameMode = null;
        } else {
            printToTerminal(guess < mode.target ? '<span class="term-yellow">📈 Too low! Try higher.</span>' : '<span class="term-yellow">📉 Too high! Try lower.</span>', false);
        }
    } else if (mode.type === 'rps') {
        const choices = ['rock', 'paper', 'scissors'];
        const userChoice = input.toLowerCase();
        if (!choices.includes(userChoice)) return printToTerminal('<span class="term-red">Type rock, paper, or scissors!</span>', false);

        const compChoice = choices[Math.floor(Math.random() * 3)];
        let result = (userChoice === compChoice) ? "It's a tie!" :
            ((userChoice === 'rock' && compChoice === 'scissors') || (userChoice === 'paper' && compChoice === 'rock') || (userChoice === 'scissors' && compChoice === 'paper')) ?
                '<span class="term-green">You win! 🎉</span>' : '<span class="term-red">Computer wins! 💻</span>';

        printToTerminal(`You: ${userChoice} | Computer: ${compChoice}`, false);
        printToTerminal(result, false);
        AppState.gameMode = null;
    }
    scrollTerminal();
}

function printToTerminal(html, animate = false) {
    const line = document.createElement('div');
    line.className = 'output-line';
    line.innerHTML = html;
    DOM.terminalOutput.appendChild(line);
    scrollTerminal();
}

function scrollTerminal() {
    DOM.terminalBody.scrollTop = DOM.terminalBody.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// TERMINAL COMMANDS
// ============================================
const terminalCommands = {
    help: () => `<div class="term-box">
        <div class="term-box-title">📚 Available Commands</div>
        <div class="term-grid">
          <div><span class="term-yellow">about</span> <span class="term-dim">- Profile info</span></div>
          <div><span class="term-yellow">skills</span> <span class="term-dim">- Tech skills</span></div>
          <div><span class="term-yellow">projects</span> <span class="term-dim">- Show projects</span></div>
          <div><span class="term-yellow">contact</span> <span class="term-dim">- Contact info</span></div>

          <div><span class="term-yellow">time</span> <span class="term-dim">- Current time</span></div>
          <div><span class="term-yellow">ls</span> <span class="term-dim">- List files</span></div>
          <div><span class="term-yellow">cd</span> <span class="term-dim">- Change directory</span></div>
          <div><span class="term-yellow">cat</span> <span class="term-dim">- View file</span></div>
          <div><span class="term-yellow">pwd</span> <span class="term-dim">- Current path</span></div>
          <div><span class="term-yellow">game</span> <span class="term-dim">- Play games</span></div>
          <div><span class="term-yellow">ascii</span> <span class="term-dim">- ASCII art</span></div>
          <div><span class="term-yellow">joke</span> <span class="term-dim">- Random joke</span></div>
          <div><span class="term-yellow">neofetch</span> <span class="term-dim">- System info</span></div>
          <div><span class="term-yellow">clear</span> <span class="term-dim">- Clear screen</span></div>
        </div>
        </div>
        <span class="term-dim">💡 Tip: Use Tab to autocomplete, Up/Down for history</span>`,

    about: () => {
        const u = teamMembers[AppState.currentUser];
        return `<div class="term-box" style="border-left-color: ${u.color}">
        <div class="term-box-title" style="color:${u.color}">👤 ${u.name}</div>
        <div><span class="term-dim">Role:</span> <span class="term-blue">${u.role}</span></div>
        <div><span class="term-dim">Location:</span> ${u.city}, ${u.country}</div>
        <div><span class="term-dim">Fun Fact:</span> <span class="term-yellow">${u.fun}</span></div>
        </div>`;
    },

    skills: () => {
        const u = teamMembers[AppState.currentUser];
        let html = `<div class="term-box-title" style="color:${u.color}">🛠️ Technical Skills</div>`;
        u.skills.forEach(s => {
            html += `<div style="margin:8px 0;display:flex;gap:12px;align-items:center;">
            <span style="min-width:100px;color:var(--term-orange)">${s.name}</span>
            <div style="flex:1;height:10px;background:var(--term-bg-lighter);border-radius:5px;overflow:hidden;">
            <div style="height:100%;width:${s.level}%;background:linear-gradient(90deg,${u.color},var(--term-cyan));border-radius:5px;"></div>
            </div>
            <span class="term-dim">${s.level}%</span>
            </div>`;
        });
        return `<div class="term-box">${html}</div>`;
    },

    projects: () => {
        const u = teamMembers[AppState.currentUser];
        if (!u.projects.length) return '<span class="term-dim">No projects yet.</span>';
        let html = `<div class="term-box-title" style="color:${u.color}">📁 Projects</div>`;
        u.projects.forEach(p => {
            html += `<div class="term-box" style="margin:10px 0;border-left:3px solid var(--term-blue);">
            <div style="color:var(--term-yellow);font-weight:600;margin-bottom:6px;">${p.name} <span class="term-dim">⭐ ${p.stars}</span></div>
            <div class="term-dim" style="margin-bottom:8px;">${p.desc}</div>
            <div>${p.tech.map(t => `<span style="background:var(--term-bg-lighter);color:var(--term-cyan);padding:2px 8px;border-radius:4px;font-size:0.8em;margin-right:5px;">${t}</span>`).join('')}</div>
            </div>`;
        });
        return html;
    },

    contact: () => {
        const u = teamMembers[AppState.currentUser];
        return `<div class="term-box">
        <div class="term-box-title">📧 Contact Information</div>
        <div><span class="term-dim">Email:</span> <span class="term-blue">${u.email}</span></div>
        <div><span class="term-dim">GitHub:</span> <span class="term-blue">${u.github}</span></div>
        <div><span class="term-dim">Location:</span> ${u.city}, ${u.country}</div>
        </div>`;
    },

    time: () => {
        const now = new Date();
        return `<div class="term-box">
        <div><span class="term-dim">Local:</span> ${now.toLocaleString()}</div>
        <div><span class="term-dim">UTC:</span> ${now.toUTCString()}</div>
        </div>`;
    },

    pwd: () => `<span class="term-cyan">${AppState.currentDir}</span>`,

    ls: (args) => {
        const path = args[0] || AppState.currentDir;
        const parts = path.split('/').filter(Boolean);
        let curr = fileSystem;
        for (const part of parts) {
            if (curr && curr[part]) curr = curr[part];
            else return `<span class="term-red">ls: cannot access '${path}': No such file or directory</span>`;
        }
        if (typeof curr === 'string') return `<span class="term-red">ls: '${path}': Not a directory</span>`;

        const items = Object.entries(curr).map(([name, val]) => {
            const isDir = typeof val === 'object';
            return `<span class="${isDir ? 'term-blue' : ''}">${isDir ? '📁' : '📄'} ${name}</span>`;
        });
        return `<div style="display:flex;flex-wrap:wrap;gap:15px;">${items.join('')}</div>`;
    },

    cd: (args) => {
        const path = args[0];
        if (!path || path === '~') {
            AppState.currentDir = `/home/${AppState.currentUser}`;
            updateTerminalPrompt();
            return null;
        }
        if (path === '..') {
            const parts = AppState.currentDir.split('/').filter(Boolean);
            if (parts.length > 1) {
                parts.pop();
                AppState.currentDir = '/' + parts.join('/');
            }
            updateTerminalPrompt();
            return null;
        }

        const newPath = path.startsWith('/') ? path : `${AppState.currentDir}/${path}`;
        const parts = newPath.split('/').filter(Boolean);
        let curr = fileSystem;

        for (const part of parts) {
            if (curr && curr[part]) curr = curr[part];
            else return `<span class="term-red">cd: '${path}': No such file or directory</span>`;
        }
        if (typeof curr === 'string') return `<span class="term-red">cd: '${path}': Not a directory</span>`;

        AppState.currentDir = newPath;
        updateTerminalPrompt();
        return null;
    },

    cat: (args) => {
        const filename = args[0];
        if (!filename) return `<span class="term-red">cat: missing file operand</span>`;

        const path = filename.startsWith('/') ? filename : `${AppState.currentDir}/${filename}`;
        const parts = path.split('/').filter(Boolean);
        const fname = parts.pop();
        let curr = fileSystem;

        for (const part of parts) {
            if (curr && curr[part]) curr = curr[part];
            else return `<span class="term-red">cat: '${filename}': No such file or directory</span>`;
        }
        if (!curr || typeof curr !== 'object' || !curr[fname]) return `<span class="term-red">cat: '${filename}': No such file or directory</span>`;

        const content = curr[fname];
        if (typeof content === 'object') return `<span class="term-red">cat: '${filename}': Is a directory</span>`;

        return `<div style="background:var(--term-bg-light);padding:12px;border-radius:6px;margin:8px 0;"><pre style="white-space:pre-wrap;color:var(--term-fg-dim);margin:0;">${escapeHtml(content)}</pre></div>`;
    },

    game: (args) => {
        const game = args[0];
        if (game === 'guess') {
            AppState.gameMode = { type: 'guess', target: Math.floor(Math.random() * 100) + 1, attempts: 0 };
            return `<div class="term-box"><div class="term-box-title">🎯 Guess the Number</div><div>I'm thinking of a number between 1 and 100.</div></div>`;
        }
        if (game === 'rps') {
            AppState.gameMode = { type: 'rps' };
            return `<div class="term-box"><div class="term-box-title">✊ Rock Paper Scissors</div><div>Type rock, paper, or scissors!</div></div>`;
        }
        return `<div class="term-box"><div class="term-box-title">🎮 Available Games</div><div><span class="term-yellow">guess</span>, <span class="term-yellow">rps</span></div></div>`;
    },

    ascii: (args) => {
        const art = args[0] || 'logo';
        if (asciiArt[art]) return `<pre style="color:var(--term-cyan);font-size:10px;line-height:1.2;overflow-x:auto;">${asciiArt[art]}</pre>`;
        return `<span class="term-red">Unknown art: ${art}</span>`;
    },

    joke: () => {
        const jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
            "Why did the developer go broke? Because he used up all his cache! 💸",
            "What's a programmer's favorite hangout place? Foo Bar! 🍺",
        ];
        return `<div class="term-box"><div class="term-box-title">😂 Random Joke</div><div>${jokes[Math.floor(Math.random() * jokes.length)]}</div></div>`;
    },

    neofetch: () => {
        const u = teamMembers[AppState.currentUser];
        const uptime = Math.floor((Date.now() - AppState.startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        const secs = uptime % 60;

        return `<div style="display:flex;gap:15px;align-items:start;padding:0;margin-top:5px;margin-bottom:5px;">
        <pre style="color:var(--term-cyan);font-weight:bold;font-size:12px;line-height:1;margin:0;">${asciiArt.tux.trim()}</pre>
        <div style="font-family:'JetBrains Mono', monospace;font-size:13px;line-height:1.2;">
        <div style="margin-bottom:2px;"><span class="term-green" style="font-weight:bold">${u.name}</span><span style="color:var(--term-fg)">@</span><span class="term-green" style="font-weight:bold">archora</span></div>
        <div class="term-dim" style="margin-bottom:6px;">------------------------</div>
        <div><span class="term-yellow" style="font-weight:bold">OS</span>: <span style="color:var(--term-fg)">ArchoraOS (Web)</span></div>
        <div><span class="term-yellow" style="font-weight:bold">Host</span>: <span style="color:var(--term-fg)">${navigator.platform}</span></div>
        <div><span class="term-yellow" style="font-weight:bold">Uptime</span>: <span style="color:var(--term-fg)">${hours}h ${mins}m ${secs}s</span></div>
        <div><span class="term-yellow" style="font-weight:bold">Shell</span>: <span style="color:var(--term-fg)">ZSH</span></div>
        <div><span class="term-yellow" style="font-weight:bold">Res</span>: <span style="color:var(--term-fg)">${window.innerWidth}x${window.innerHeight}</span></div>
        
        <div style="margin-top:8px;display:flex;gap:5px;">
            <span style="background:#282a36;width:12px;height:12px;border-radius:2px;"></span>
            <span style="background:#ff5555;width:12px;height:12px;border-radius:2px;"></span>
            <span style="background:#50fa7b;width:12px;height:12px;border-radius:2px;"></span>
            <span style="background:#f1fa8c;width:12px;height:12px;border-radius:2px;"></span>
            <span style="background:#bd93f9;width:12px;height:12px;border-radius:2px;"></span>
            <span style="background:#ff79c6;width:12px;height:12px;border-radius:2px;"></span>
            <span style="background:#8be9fd;width:12px;height:12px;border-radius:2px;"></span>
            <span style="background:#f8f8f2;width:12px;height:12px;border-radius:2px;"></span>
        </div>
        </div></div>`;
    },

    clear: () => {
        DOM.terminalOutput.innerHTML = '';
        return null;
    }
};

// ============================================
// OTHER UTILS
// ============================================
function initGuestbook() {
    // Load Messages Realtime
    const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        DOM.guestbookEntries.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recently';

            const div = document.createElement('div');
            div.className = 'guestbook-entry';
            div.innerHTML = `
                <div class="entry-header">
                    <div class="user-avatar">👤</div>
                    <div class="entry-info">
                        <h3 class="entry-author">${escapeHtml(data.name)}</h3>
                        <div class="entry-date">${date}</div>
                    </div>
                    <button class="post-menu-btn" onclick="toggleMenu('guestbook-${doc.id}')" aria-label="Menu">⋮</button>
                    <div class="post-menu-dropdown" id="menu-guestbook-${doc.id}">
                        <div class="menu-item" onclick="editGuestbookEntry('${doc.id}')">✏️ Edit</div>
                        <div class="menu-item delete" onclick="deleteGuestbookEntry('${doc.id}')">🗑️ Delete</div>
                    </div>
                </div>
                <div class="entry-content"><p>${escapeHtml(data.message)}</p></div>
            `;
            DOM.guestbookEntries.appendChild(div);
        });
    });

    // Save Message
    DOM.guestbookForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = DOM.guestbookForm.querySelector('textarea').value.trim();
        const name = DOM.guestbookForm.querySelector('input').value.trim();
        const submitBtn = DOM.guestbookForm.querySelector('button');

        if (msg && name) {
            submitBtn.textContent = 'Signing...';
            submitBtn.disabled = true;

            try {
                await addDoc(collection(db, "guestbook"), {
                    name: name,
                    message: msg,
                    createdAt: Date.now()
                });
                DOM.guestbookForm.reset();
            } catch (error) {
                console.error("Error adding document: ", error);
                alert("Failed to sign guestbook. Try again.");
            } finally {
                submitBtn.textContent = 'Sign the Guestbook';
                submitBtn.disabled = false;
            }
        }
    });
}

function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    const msg = document.getElementById('newsletter-msg');

    if (!form || !msg) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent page reload

        const email = document.getElementById('newsletter-email').value.trim();
        if (!email) {
            msg.style.color = 'red';
            msg.textContent = 'Please enter a valid email!';
            return;
        }

        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        emailjs.send('service_4qxglhg', 'template_sxmvih2', {
            user_email: email
        })
            .then(() => {
                msg.style.color = 'green';
                msg.textContent = "✅ Thanks for subscribing! You'll get notified when we post new projects.";
                form.reset();
            })
            .catch((err) => {
                msg.style.color = 'red';
                msg.textContent = "❌ Something went wrong. Please try again!";
                console.error('EmailJS error:', err);
            })
            .finally(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            });
    });
}

function initTeamAvatars() {
    // Add hover effects or other avatar logic here if needed
}

// ============================================
// DYNAMIC CONTENT (CRUD)
// ============================================
let posts = [];
let projects = JSON.parse(localStorage.getItem('projects')) || defaultProjects;

function initDynamicContent() {
    fetchPosts();
    fetchProjects();
}

function fetchPosts() {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderFeed();
    });
}

function fetchProjects() {
    const q = query(collection(db, "projects"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProjects();
    });
}

function renderFeed() {
    const container = document.getElementById('feed-container');
    if (!container) return;

    container.innerHTML = posts.map(post => {
        const authorData = getAuthorData(post.author);
        const timestamp = post.timestamp || Date.now();
        return `
        <div class="post">
            <div class="post-header">
                <div class="post-avatar ${post.author}">${authorData.avatar}</div>
                <div>
                    <div class="post-author">${authorData.name} <span class="post-time">• ${timeAgo(timestamp)}</span></div>
                    <div class="post-tag">📝 Post</div>
                </div>
                <button class="post-menu-btn" onclick="toggleMenu('${post.id}')">⋮</button>
                <div class="post-menu-dropdown" id="menu-${post.id}">
                    <div class="menu-item" onclick="editPost('${post.id}')">✏️ Edit</div>
                    <div class="menu-item delete" onclick="deletePost('${post.id}')">🗑️ Delete</div>
                </div>
            </div>
            <h2 class="post-title">${post.title}</h2>
            <div class="post-content">
                <p>${post.content}</p>
                ${post.code ? `<div class="code-snippet"><pre><code>${post.code}</code></pre></div>` : ''}
                ${post.tags ? `<p class="post-tags">${post.tags.join(' ')}</p>` : ''}
            </div>
        </div>`;
    }).join('');
}

function renderProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    container.innerHTML = projects.map(proj => `
        <div class="project-card">
            <div class="project-image">
                <img src="${proj.image}" alt="${proj.title}">
                <div style="position: absolute; top: 10px; right: 10px;">
                    <button class="post-menu-btn" style="background:rgba(0,0,0,0.5);color:white;" onclick="toggleMenu('${proj.id}')">⋮</button>
                    <div class="post-menu-dropdown" id="menu-${proj.id}">
                        <div class="menu-item" onclick="editProject('${proj.id}')">✏️ Edit</div>
                        <div class="menu-item delete" onclick="deleteProject('${proj.id}')">🗑️ Delete</div>
                    </div>
                </div>
            </div>
            <div class="project-details">
                <h3>${proj.title}</h3>
                <div class="project-tags">${proj.tags.map(t => `<span>${t}</span>`).join('')}</div>
                <p>${proj.description}</p>
                <div class="project-links">
                    <a href="${proj.links.demo}" class="project-link">Demo</a>
                    <a href="${proj.links.github}" class="project-link">GitHub</a>
                </div>
            </div>
        </div>
    `).join('');
}

function getAuthorData(key) {
    if (key === 'team') return { name: "CodeCraft Trio", avatar: '<span class="team-icon">👨‍💻</span>' };
    const member = teamMembers[key.toLowerCase()];
    return member ?
        { name: member.name.split(' ')[0], avatar: `<span><img src="assets/photos/${key}.jpg" alt="${key}"></span>` } :
        { name: "Unknown", avatar: '<span>?</span>' };
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = { y: 31536000, mo: 2592000, d: 86400, h: 3600, m: 60 };
    for (const [key, value] of Object.entries(intervals)) {
        const count = Math.floor(seconds / value);
        if (count >= 1) return `${count}${key} ago`;
    }
    return "just now";
}

function toggleMenu(id) {
    event.stopPropagation();

    // Close other menus
    document.querySelectorAll('.post-menu-dropdown.active').forEach(el => {
        el.classList.remove('active');
        const parent = el.closest('.post') || el.closest('.guestbook-entry');
        if (parent) parent.classList.remove('active-menu');
    });

    const menu = document.getElementById(`menu-${id}`);
    if (menu) {
        const isOpening = !menu.classList.contains('active');
        menu.classList.toggle('active');

        const parent = menu.closest('.post') || menu.closest('.guestbook-entry');
        if (parent) {
            parent.classList.toggle('active-menu', isOpening);
        }
    }
}

document.addEventListener('click', () => {
    document.querySelectorAll('.post-menu-dropdown').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.post.active-menu, .guestbook-entry.active-menu').forEach(el => el.classList.remove('active-menu'));
});

// CRUD EVENTS
function setupDynamicEventListeners() {
    // Post Modal
    document.getElementById('create-post-btn')?.addEventListener('click', () => openPostModal());
    document.getElementById('cancel-post-btn')?.addEventListener('click', () => closeModal('post-modal'));
    document.querySelector('#post-modal .modal-overlay')?.addEventListener('click', () => closeModal('post-modal'));
    document.getElementById('post-form')?.addEventListener('submit', (e) => { e.preventDefault(); savePost(); });

    document.querySelectorAll('.user-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.user-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            document.getElementById('post-author').value = opt.dataset.value;
        });
    });

    // Project Modal
    document.getElementById('create-project-btn')?.addEventListener('click', () => openProjectModal());
    document.getElementById('cancel-project-btn')?.addEventListener('click', () => closeModal('project-modal'));
    document.querySelector('#project-modal .modal-overlay')?.addEventListener('click', () => closeModal('project-modal'));
    document.getElementById('project-form')?.addEventListener('submit', (e) => { e.preventDefault(); saveProject(); });

    // Guestbook Modal
    document.getElementById('cancel-guestbook-btn')?.addEventListener('click', () => closeModal('guestbook-modal'));
    document.querySelector('#guestbook-modal .modal-overlay')?.addEventListener('click', () => closeModal('guestbook-modal'));
    document.getElementById('guestbook-edit-form')?.addEventListener('submit', (e) => { e.preventDefault(); saveGuestbookEntry(); });
}

function openPostModal(post = null) {
    const modal = document.getElementById('post-modal');
    modal.classList.add('active');
    document.getElementById('post-modal-title').textContent = post ? 'Edit Post' : 'Create Post';

    if (post) {
        document.getElementById('post-id').value = post.id || '';
        document.getElementById('post-title').value = post.title || '';
        document.getElementById('post-content').value = post.content || '';
        document.getElementById('post-code').value = post.code || '';
        document.getElementById('post-tags').value = (post.tags || []).join(', ');
        document.getElementById('post-author').value = post.author || 'prayatna';

        document.querySelectorAll('.user-option').forEach(o => o.classList.toggle('selected', o.dataset.value === (post.author || 'prayatna')));
    } else {
        document.getElementById('post-form').reset();
        document.getElementById('post-id').value = '';
        document.querySelectorAll('.user-option').forEach(o => o.classList.remove('selected'));
        document.querySelector('.user-option[data-value="prayatna"]').classList.add('selected');
        document.getElementById('post-author').value = 'prayatna';
    }
}

async function savePost() {
    const id = document.getElementById('post-id').value;
    const author = document.getElementById('post-author').value;
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const code = document.getElementById('post-code').value;
    const tags = document.getElementById('post-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    const saveBtn = document.querySelector('.btn-save');

    if (!title || !content) return;

    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
        const postData = {
            author, title, content, code, tags,
            timestamp: Date.now()
        };

        if (id) {
            // Update
            const postRef = doc(db, "posts", id);
            await updateDoc(postRef, {
                author, title, content, code, tags,
                updatedAt: Date.now()
            });
        } else {
            // Create
            await addDoc(collection(db, "posts"), postData);
        }
        closeModal('post-modal');
    } catch (error) {
        console.error("Error saving post: ", error);
        alert("Failed to save post.");
    } finally {
        saveBtn.textContent = 'Save Post';
        saveBtn.disabled = false;
    }
}

async function deletePost(id) {
    if (confirm('Delete this post?')) {
        try {
            await deleteDoc(doc(db, "posts", id));
        } catch (error) {
            console.error("Error deleting post: ", error);
            alert("Failed to delete post.");
        }
    }
}

function editPost(id) {
    // Find post from the current posts array
    const post = posts.find(p => p.id === id);
    if (post) {
        openPostModal(post);
    } else {
        console.error('Post not found:', id);
        // Fallback: fetch the specific post from Firebase
        const postRef = doc(db, "posts", id);
        getDoc(postRef).then((docSnap) => {
            if (docSnap.exists()) {
                openPostModal({ id: docSnap.id, ...docSnap.data() });
            }
        }).catch(error => {
            console.error("Error fetching post:", error);
            alert("Could not load post for editing. Please try again.");
        });
    }
}

function openProjectModal(proj = null) {
    const modal = document.getElementById('project-modal');
    modal.classList.add('active');
    document.getElementById('project-modal-title').textContent = proj ? 'Edit Project' : 'Create Project';

    if (proj) {
        document.getElementById('project-id').value = proj.id;
        document.getElementById('project-title').value = proj.title;
        document.getElementById('project-desc').value = proj.description;
        document.getElementById('project-tech').value = (proj.tags || []).join(', ');
        document.getElementById('project-img').value = proj.image;
        document.getElementById('project-demo').value = proj.links.demo;
        document.getElementById('project-github').value = proj.links.github;
    } else {
        document.getElementById('project-form').reset();
        document.getElementById('project-id').value = '';
    }
}

async function saveProject() {
    const id = document.getElementById('project-id').value;
    const title = document.getElementById('project-title').value;
    const description = document.getElementById('project-desc').value;
    const tags = document.getElementById('project-tech').value.split(',').map(t => t.trim()).filter(Boolean);
    const image = document.getElementById('project-img').value || 'https://via.placeholder.com/400x200';
    const demo = document.getElementById('project-demo').value;
    const github = document.getElementById('project-github').value;

    const saveBtn = document.querySelector('#project-form .btn-save');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
        const projectData = {
            title, description, tags, image,
            links: { demo, github },
            timestamp: Date.now()
        };

        if (id) {
            const projectRef = doc(db, "projects", id);
            await updateDoc(projectRef, { title, description, tags, image, links: { demo, github } });
        } else {
            await addDoc(collection(db, "projects"), projectData);
        }
        closeModal('project-modal');
    } catch (error) {
        console.error("Error saving project: ", error);
        alert("Failed to save project.");
    } finally {
        saveBtn.textContent = 'Save Project';
        saveBtn.disabled = false;
    }
}

async function deleteProject(id) {
    if (confirm('Delete this project?')) {
        try {
            await deleteDoc(doc(db, "projects", id));
        } catch (error) {
            console.error("Error deleting project: ", error);
            alert("Failed to delete project.");
        }
    }
}

function editProject(id) {
    const proj = projects.find(p => p.id === id);
    if (proj) openProjectModal(proj);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ============================================
// GUESTBOOK CRUD FUNCTIONS
// ============================================
let guestbookEntries = []; // Store guestbook entries for editing

function initGuestbookData() {
    const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        guestbookEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
}

function openGuestbookModal(entry = null) {
    const modal = document.getElementById('guestbook-modal');
    modal.classList.add('active');

    if (entry) {
        document.getElementById('guestbook-id').value = entry.id;
        document.getElementById('guestbook-name').value = entry.name;
        document.getElementById('guestbook-message').value = entry.message;
    } else {
        document.getElementById('guestbook-edit-form').reset();
        document.getElementById('guestbook-id').value = '';
    }
}

async function saveGuestbookEntry() {
    const id = document.getElementById('guestbook-id').value;
    const name = document.getElementById('guestbook-name').value.trim();
    const message = document.getElementById('guestbook-message').value.trim();
    const saveBtn = document.querySelector('#guestbook-edit-form .btn-save');

    if (!name || !message) return;

    saveBtn.textContent = 'Updating...';
    saveBtn.disabled = true;

    try {
        if (id) {
            // Update existing entry
            const entryRef = doc(db, "guestbook", id);
            await updateDoc(entryRef, { name, message });
        }
        closeModal('guestbook-modal');
    } catch (error) {
        console.error("Error updating guestbook entry: ", error);
        alert("Failed to update message.");
    } finally {
        saveBtn.textContent = 'Update Message';
        saveBtn.disabled = false;
    }
}

async function deleteGuestbookEntry(id) {
    if (confirm('Delete this message?')) {
        try {
            await deleteDoc(doc(db, "guestbook", id));
        } catch (error) {
            console.error("Error deleting guestbook entry: ", error);
            alert("Failed to delete message.");
        }
    }
}

function editGuestbookEntry(id) {
    const entry = guestbookEntries.find(e => e.id === id);
    if (entry) openGuestbookModal(entry);
}

// Initialize guestbook data tracking
initGuestbookData();

// ============================================
// EXPOSE FUNCTIONS GLOBALLY FOR ONCLICK HANDLERS
// ============================================
window.toggleMenu = toggleMenu;
window.editPost = editPost;
window.deletePost = deletePost;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.closeModal = closeModal;
window.editGuestbookEntry = editGuestbookEntry;
window.deleteGuestbookEntry = deleteGuestbookEntry;
