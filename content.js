// content.js
// Proxies messages from the MAIN world (injected scripts) to the Extension (Side Panel)

window.addEventListener('message', (event) => {
    // Only accept messages from the same window
    if (event.source !== window) return;

    // Filter by our specific protocol/signature
    if (event.data && event.data.source === 'EX_CONSOLE_STAMP') {
        // Forward to the extension runtime
        // Note: event.data.type should be something like 'CONSOLE_LOG'
        chrome.runtime.sendMessage({
            type: event.data.type,
            level: event.data.level,
            content: event.data.content
        }).catch(err => {
            // Context might be invalidated, or side panel closed
            // Suppress errors to avoid polluting the console
        });
    }
});

// Listener to check if content script is ready
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'PING') {
        sendResponse({ status: 'OK' });
    }
});
