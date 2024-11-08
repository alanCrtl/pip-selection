# Picture-in-picture selection screenshot

Work in progress !

![Alt Text](usage.gif)

## ressources

This allows you to populate PiP with pretty much anything: --- [document picture-in-picture](https://wicg.github.io/document-picture-in-picture/)  
To capture visible tab using chrome api --- [here](https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=fr#method-captureVisibleTab)

## Install

- download the folder  
- load the extension with chrome (load unpacked extension)  
- click the extension icon  
- draw a rectangle
- The screenshot will now appear in Picture-in-picture window, meaning it's in a "always on top mode"

## Explanation

I honestly have a lot cases where I just wanted to screenshot some code or text and
keep it in a "always on top" window but didn't find anything sastifying so I made this.

## TODO:

- remove opacity layer from screenshot (the image is darkened at the moment)
- remove the left and top red border from the screenshot
- add a copy image to clipboard somewhere
