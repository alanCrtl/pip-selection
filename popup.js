// popup code is code that lives within the context of the popup window that appears 
// after extension icon is clicked

// sends a message to content.js to start screenshot mode on button press within the popup
document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('screenshotButton');

    button.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "startScreenshotMode" });
        });
    });
});