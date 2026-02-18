# Walkthrough: Stamp Console.JS

## Overview
This extension allows you to run JavaScript snippets on any webpage with persistent storage and dynamic parameters, using a Side Panel interface.

## Verification Steps
1.  **Open Chrome Extensions Page** (`chrome://extensions`).
2.  **Enable Developer Mode** (top right toggle).
3.  **Load Unpacked**: Select the folder `ex_console_stamp`.
4.  **Open Side Panel**:
    - Click the extension icon in the toolbar.
5.  **Create a New Script**:
    - **Name**: `Test Script`
    - **Code**: `console.log("Hello " + params.name)`
    - **Params**: Key=`name`, Value=`World`
6.  **Run**: Click "Run".
    - Check the output in the bottom console.

## Example Scenario: Auto-Login Form Filler

This example demonstrates how to use the extension to automatically fill a login form on a specific website, using dynamic parameters for the credentials.

1.  **Preparation**:
    - Navigate to a site with a login form (e.g., `https://github.com/login`).
    - Open the Extension Side Panel.

2.  **Configuration**:
    - **Script Name**: `GitHub Login Filler`
    - **URL Pattern**: `https://github.com*/login*`
    - **Parameters**:
        - Key: `user`, Value: `my_username`
        - Key: `pass`, Value: `my_secret_password`
        - Key: `autoSubmit`, Value: `true` (Boolean, triggers JSON parsing)

3.  **Code**:
    Paste the following into the editor:
    ```javascript
    // Select the input fields (Adjust selectors based on target site)
    const usernameField = document.querySelector('input[name="login"]');
    const passwordField = document.querySelector('input[name="password"]');

    if (usernameField && passwordField) {
        // Use parameters to fill data
        usernameField.value = params.user;
        passwordField.value = params.pass;
        
        console.log("Credentials filled for user: " + params.user);

        // Check the 'autoSubmit' parameter
        if (params.autoSubmit === true) {
            const submitBtn = document.querySelector('input[type="submit"]');
            console.warn("Auto-submitting form in 3 seconds...");
            setTimeout(() => {
                if(submitBtn) submitBtn.click();
            }, 3000);
        }
    } else {
        console.error("Login fields not found on this page!");
    }
    ```

4.  **Execution**:
    - Click **Run**.
    - **Observe**: The form fields should be filled instantly. The console in the side panel will confirm the action. If `autoSubmit` is true, it will click the button after a delay.
