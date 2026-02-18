// sidepanel.js

document.addEventListener('DOMContentLoaded', () => {
    // UI References
    const scriptSelect = document.getElementById('script-select');
    const scriptNameInput = document.getElementById('script-name');
    const urlPatternInput = document.getElementById('url-pattern');
    const paramsContainer = document.getElementById('params-container');
    const codeEditor = document.getElementById('code-editor');
    const btnAddParam = document.getElementById('btn-add-param');
    const btnSave = document.getElementById('btn-save');
    const btnDelete = document.getElementById('btn-delete');
    const btnRun = document.getElementById('btn-run');
    const btnClearConsole = document.getElementById('btn-clear-console');
    const consoleLogs = document.getElementById('console-logs');

    // State
    let scripts = {};
    let currentScriptId = null;

    // --- Initialization ---
    loadScripts();

    // --- Event Listeners ---
    btnAddParam.addEventListener('click', () => addParamRow());

    btnSave.addEventListener('click', saveScript);

    btnDelete.addEventListener('click', deleteScript);

    btnRun.addEventListener('click', runScript);

    btnClearConsole.addEventListener('click', () => {
        consoleLogs.innerHTML = '';
    });

    scriptSelect.addEventListener('change', (e) => {
        loadScriptIntoUI(e.target.value);
    });

    // --- Core Functions ---

    function generateId() {
        return 'script_' + Date.now();
    }

    async function loadScripts() {
        const result = await chrome.storage.local.get('scripts');
        scripts = result.scripts || {};
        updateScriptSelect();
    }

    function updateScriptSelect() {
        scriptSelect.innerHTML = '<option value="">-- New Script --</option>';
        for (const [id, script] of Object.entries(scripts)) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = script.name;
            scriptSelect.appendChild(option);
        }
        if (currentScriptId && scripts[currentScriptId]) {
            scriptSelect.value = currentScriptId;
        }
    }

    function loadScriptIntoUI(id) {
        currentScriptId = id;
        paramsContainer.innerHTML = ''; // Clear params

        if (!id) {
            // New script
            scriptNameInput.value = '';
            urlPatternInput.value = '';
            codeEditor.value = '';
            return;
        }

        const script = scripts[id];
        scriptNameInput.value = script.name || '';
        urlPatternInput.value = script.urlPattern || '';
        codeEditor.value = script.code || '';

        // Load params
        if (script.params) {
            script.params.forEach(p => addParamRow(p.key, p.value));
        }
    }

    function addParamRow(key = '', value = '') {
        const row = document.createElement('div');
        row.className = 'param-row';

        row.innerHTML = `
            <input type="text" class="param-key" placeholder="Key" value="${key}">
            <input type="text" class="param-value" placeholder="Value" value="${value}">
            <button class="danger small btn-remove-param">x</button>
        `;

        row.querySelector('.btn-remove-param').addEventListener('click', () => {
            row.remove();
        });

        paramsContainer.appendChild(row);
    }

    async function saveScript() {
        const name = scriptNameInput.value.trim();
        if (!name) {
            logToConsole('Error: Script name is required', 'error');
            return;
        }

        const id = currentScriptId || generateId();
        const code = codeEditor.value;
        const urlPattern = urlPatternInput.value.trim();

        // Collect params
        const params = [];
        document.querySelectorAll('.param-row').forEach(row => {
            const k = row.querySelector('.param-key').value.trim();
            const v = row.querySelector('.param-value').value.trim();
            if (k) params.push({ key: k, value: v });
        });

        const newScript = {
            id,
            name,
            code,
            urlPattern,
            params,
            updatedAt: Date.now()
        };

        scripts[id] = newScript;
        await chrome.storage.local.set({ scripts });
        currentScriptId = id;

        updateScriptSelect();
        logToConsole(`Script "${name}" saved!`, 'success');
    }

    async function deleteScript() {
        if (!currentScriptId) return;

        if (confirm(`Delete script "${scripts[currentScriptId].name}"?`)) {
            delete scripts[currentScriptId];
            await chrome.storage.local.set({ scripts });
            currentScriptId = null;
            updateScriptSelect();
            loadScriptIntoUI(null);
            logToConsole('Script deleted.', 'info');
        }
    }

    async function runScript() {
        const code = codeEditor.value;
        if (!code) {
            logToConsole('Error: No code to run', 'error');
            return;
        }

        // Collect params to inject as an object
        const paramsObj = {};
        document.querySelectorAll('.param-row').forEach(row => {
            const k = row.querySelector('.param-key').value.trim();
            const v = row.querySelector('.param-value').value.trim();
            if (k) {
                // Try to parse as JSON or Number, else String
                try {
                    paramsObj[k] = JSON.parse(v);
                } catch (e) {
                    // Check if it looks like a number but failed JSON (e.g. leading zeros)
                    if (!isNaN(v) && v !== '') {
                        paramsObj[k] = Number(v);
                    } else {
                        paramsObj[k] = v;
                    }
                }
            }
        });

        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            logToConsole('Error: No active tab found', 'error');
            return;
        }

        // Check URL pattern if exists
        const urlPattern = urlPatternInput.value.trim();
        if (urlPattern) {
            // Simple wildcard matching: * -> .*
            const regex = new RegExp('^' + urlPattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
            if (!regex.test(tab.url)) {
                logToConsole(`Warning: Current URL does not match pattern "${urlPattern}"`, 'warn');
                // We allow running anyway, but warn the user
            }
        }

        // Check if content script is ready (Ping)
        try {
            await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
        } catch (e) {
            logToConsole('Error: Extension connection failed. Please REFRESH this page.', 'error');
            return;
        }

        logToConsole(`Running on ${tab.url}...`, 'info');

        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: injectedFunction,
                args: [code, paramsObj],
                world: 'MAIN' // Inject into the page's main context
            });
        } catch (err) {
            logToConsole(`Execution Error: ${err.message}`, 'error');
        }
    }

    // --- Message Listener for Logs ---
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'CONSOLE_LOG') {
            logToConsole(message.content, message.level);
        }
    });

    function logToConsole(msg, level = 'log') {
        const div = document.createElement('div');
        div.className = `log-entry ${level}`;
        // Timestamp
        const time = new Date().toLocaleTimeString();
        div.textContent = `[${time}] ${String(msg)}`;
        consoleLogs.appendChild(div);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }

    // --- Injected Function ---
    // This runs INSIDE the web page (MAIN world)
    function injectedFunction(userCode, userParams) {
        // Helper to send messages to content script
        function sendLog(level, args) {
            const content = args.map(arg => {
                try {
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                } catch (e) {
                    return String(arg);
                }
            }).join(' ');

            window.postMessage({
                source: 'EX_CONSOLE_STAMP',
                type: 'CONSOLE_LOG',
                level: level,
                content: content
            }, '*');
        }

        // Custom console object
        const customConsole = {
            log: (...args) => sendLog('log', args),
            error: (...args) => sendLog('error', args),
            warn: (...args) => sendLog('warn', args),
            info: (...args) => sendLog('info', args)
        };

        try {
            // Create a function that has access to 'params' and 'console'
            // We use 'window' to access global variables since we are in MAIN world
            const func = new Function('params', 'console', `
                try {
                    ${userCode}
                } catch (e) {
                    console.error(e.toString());
                }
            `);
            func(userParams, customConsole);
        } catch (err) {
            customConsole.error('Script Setup Error: ' + err.toString());
        }
    }
});
