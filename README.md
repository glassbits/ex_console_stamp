# Chrome Web Store Details

## App Name
Stamp Console.JS

## Short Description
A side panel console for running persistent JavaScript scripts on any webpage with dynamic parameters.

## Detailed Description
**Stamp Console.JS** is a powerful tool for developers and power users who need to run JavaScript snippets on various websites conveniently, quickly, and neatly, without retyping code in the browser console every time.

**Key Features:**

*   **Side Panel Interface:** Runs in a side panel, keeping the webpage view unobstructed and staying open while switching tabs.
*   **Script Management:** Save your frequently used scripts (Save/Load) and execute them instantly.
*   **Dynamic Parameters:** No need to hardcode values! Create dynamic Key-Value parameters and inject them into your scripts. Supports String, Number, and JSON.
*   **Main World Execution:** Scripts run in the same context as the webpage (Main World), allowing full access to global variables (`window.*`) and page functions.
*   **Isolated Logging:** Features a dedicated console in the side panel, keeping your logs separate from the website's noisy console output for easier debugging.
*   **URL Pattern Safety:** Define URL patterns to prevent accidental execution on the wrong websites.

**Perfect for:**
*   Developers needing to debug or test functions on live pages with various inputs.
*   Users looking for simple automation, such as auto-filling forms or scraping data.

**How to Use:**
1.  Open the Stamp Console.JS Side Panel.
2.  Write your JavaScript code.
3.  Set Parameters (optional).
4.  Click Run to see immediate results!

## Privacy & Permissions

This extension requires the following permissions to function:

1.  **Storage (`storage`):**
    *   **Reason:** To save your scripts and parameters locally on your device so you don't lose them when you close the browser. No data is sent to external servers.

2.  **Scripting (`scripting`):**
    *   **Reason:** To execute the JavaScript code you write *only* on the page you are currently viewing and explicitly choose to run it on.

3.  **Side Panel (`sidePanel`):**
    *   **Reason:** To display the extension interface in the browser's side panel for better usability.

4.  **Host Permissions (`<all_urls>`):**
    *   **Reason:** This extension is designed to be a general-purpose tool that works on *any* website you visit. Without this, the extension cannot inject your scripts or receive console logs from the page when you navigate between tabs. It only accesses the page when you click "Run".

## Remote Code Policy (For Validation)
**Does this extension load or execute remote code?**
**NO.**

*   All scripts executed by this extension are **created and stored locally by the user** within the extension's storage.
*   The extension **does not** fetch, load, or execute any JavaScript code from external servers or third-party sources.
*   The `chrome.scripting.executeScript` API is used solely to run the *user's own local snippets* within the context of their current tab.
