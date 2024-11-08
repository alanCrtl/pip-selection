// // Background code is code that lives in the context of the browser

// // returns visible tab as imageURL format
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'captureVisibleTab') {
        chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 100 }, dataUrl => {
            sendResponse({ dataUrl: dataUrl });
        });
        return true; // To indicate that the response will be sent asynchronously
    }
});

// sends action startScreenshotMode when pressing keybind defined in manifest.json
chrome.commands.onCommand.addListener(function(command) {
    if (command === "startScreenshotModeShortcut") {
        // Send a message to the content script to start the screenshot mode
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "startScreenshotMode" });
        });
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
    // alert("Extension icon clicked!");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startScreenshotMode" });
    });
  });
