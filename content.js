/*
This is the backend code of the extension

You enter screenshot mode by keybind shortcut or button click
then it puts an overlay, a cross cursor, mouse events etc.
You can start following the logic of the code by following
the mouse events handleMouseDown(), handleMouseMove(), handleMouseUp().
*/
let isSelecting = false;
let startX, startY, endX, endY;
let startClientX, startClientY, endClientX, endClientY
let overlay;

// console.log('PiP screenshot loaded');
// ==================================================================== 
// start screenshot mode when the button in the popup or the shortcut is pressed 
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "startScreenshotMode") {
        console.log('screenshot mode ON');
        // Disable pointer events for links
        disableLinkHover();
        // events to draw selection and take screenshot on mouseup
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        // add event listener for the 'Esc' key
        document.addEventListener('keydown', handleKeyDown);
        // crosshair cursor
        document.body.style.cursor = 'crosshair';
        // reset overlay
        if (overlay) {
            overlay.remove();
            overlay = null;
        }
        // build an overlay to show the user he's in screenshot mode
        overlay = document.createElement('div');
        overlay.id = 'screenshot-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.2)'; // Adjust opacity as needed
        overlay.style.pointerEvents = 'none';
        document.body.appendChild(overlay);
    }
});

// ==================================================================== 
// ===== screenshot mode reset functions =====
function exitScreenshotmode() {
    // reenable link hover
    enableLinkHover()
    // off selection
    isSelecting = false;
    // remove overlay
    if (overlay) {
        overlay.remove();
        overlay = null;
    }
    // reset cursor style
    document.body.style.cursor = 'auto';
    // Clear the selection box
    clearSelectionBox();
    // reset startX, endX, startY, endY to 0
    resetSelectionCoordinates();
    // remove event listeners
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
}

// Exit screenshotmode on 'Esc' (key code 27)
function handleKeyDown(event) {
    if (event.keyCode === 27) {
        exitScreenshotmode();
    }
}

// Disable pointer events for links
function disableLinkHover() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.style.pointerEvents = 'none';
        link.style.cursor = 'default'; // Optionally, set a default cursor for links
    });
}

// Enable pointer events for links
function enableLinkHover() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.style.pointerEvents = 'auto';
        link.style.cursor = 'pointer'; // Optionally, set the cursor back to pointer
    });
}

// ==================================================================== 
// ===== Rectangle drawing and clearing =====
function drawSelectionRectangle(startX, startY, endX, endY) {
    // Remove any existing rectangles
    const existingRect = document.getElementById('rectangle-selector');
    if (existingRect) {
        existingRect.remove();
    }

    // Create a new rectangle element
    const rectangle = document.createElement('div');
    rectangle.id = 'rectangle-selector';
    rectangle.style.position = 'absolute';
    rectangle.style.border = '1px solid #ff0000';
    rectangle.style.pointerEvents = 'none';

    // Calculate dimensions and position of the rectangle
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const top = Math.min(startY, endY);
    const left = Math.min(startX, endX);

    rectangle.style.width = `${width}px`;
    rectangle.style.height = `${height}px`;
    rectangle.style.top = `${top}px`;
    rectangle.style.left = `${left}px`;

    // Append the rectangle to the document
    document.body.appendChild(rectangle);
}

function clearSelectionBox() {
    const rectangleSelector = document.getElementById('rectangle-selector');
    rectangleSelector.style.width = '0';
    rectangleSelector.style.height = '0';
    console.log('removed seclection box')
}

function resetSelectionCoordinates() {
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
}

// ==================================================================== 
// ===== Mouse events =====
function handleMouseDown(event) {
    // Prevent text selection
    event.preventDefault();
    isSelecting = true;
    startX = event.pageX;
    startY = event.pageY;
    startClientX = event.clientX
    startClientY = event.clientY
}

function handleMouseMove(event) {
    if (isSelecting) {
        endX = event.pageX;
        endY = event.pageY;
        endClientX = event.clientX
        endClientY = event.clientY
        drawSelectionRectangle(startX, startY, endX, endY);
    }
}

function handleMouseUp() {
    if (isSelecting) {
        isSelecting = false;
        // remove overlay, and clear box for clean screenshot
        if (overlay) {
            overlay.remove();
            overlay = null;
            console.log('removed overlay')
        }
        clearSelectionBox();

        // Get the current scroll position of the page
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Capture the visible tab, crop it, display it in pip window, exit screenshot mode.
        console.log(`coords of selection: sx ex sy ey = [${[startX, endX, startY, endY]}]`);
        captureVisiblePage()
            .then(selectedImage => {
                cropped = cropImage(selectedImage, scrollX, scrollY)
                s = selectedImage
                return cropped
            })
            .then(croppedImage => {
                showImageInPiP(croppedImage)
                c = croppedImage
            }) 
            .then(() => {
                // for debug
                // openImageInNewTab(s)
                // openImageInNewTab(c)
            })
            .finally(() => {
                exitScreenshotmode()
            })
            .catch(error => {
                console.error('Error capturing and cropping the selected area:', error);
            });
    }
}

// ==================================================================== 
// ======== Image functions ==========
function openImageInNewTab(imageDataURL) { // for debug purposes
    const newTab = window.open();
    newTab.document.write('<html><head><title>Image Preview</title></head><body>');
    newTab.document.write(`<img src="${imageDataURL}" alt="Cropped Image">`);
    newTab.document.write('</body></html>');
    newTab.document.close();
}

function captureVisiblePage() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, response => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(response.dataUrl);
            }
        });
    });
}

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
function cropImage(selectedImage, scrollX, scrollY) {
    return new Promise((resolve, reject) => {
        console.log('cropping image');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        var img = new Image();
        img.src = selectedImage;

        img.onload = function () {
            // Set canvas dimensions to match the selected area
            const pixelRatio = window.devicePixelRatio || 1;
            const sx = Math.min(startClientX, endClientX) * pixelRatio;
            const sy = Math.min(startClientY, endClientY) * pixelRatio;
            const swidth = Math.abs(endX - startX) * pixelRatio;
            const sheight = Math.abs(endY - startY) * pixelRatio;
            const dwidth = swidth;
            const dheight = sheight;
            canvas.width = swidth;
            canvas.height = sheight;
            
            console.log(`cropping attrs (sx, sy, width, height): ${[sx, sy, swidth, sheight]}`)
            // Draw the selected area onto the canvas
            context.drawImage(img, sx, sy, swidth, sheight, 0, 0, dwidth, dheight);
            const croppedImageDataUrl = canvas.toDataURL();
            resolve(croppedImageDataUrl);
        };
    });
}

function showImageInPiP(imageDataURL) {
    return new Promise((resolve, reject) => {
        console.log('putting image in PiP');
        const img = document.createElement('img');
        img.src = imageDataURL;

        // Listen for the 'load' event before attempting to get the dimensions
        img.onload = function () {
            console.log(`Image dimensions: [${img.width}, ${img.height}]`);
            // Increase pip window a tiny bit further than the images dimensions
            // cause otherwise scrollbar show up and it's bad
            extend_dimensions_px = 60;
            const pipOptions = {
                width: img.width + extend_dimensions_px,
                height: img.height + extend_dimensions_px,
            };

            documentPictureInPicture.requestWindow(pipOptions).then(pipWin => {
                img.classList.add('pip-mode');
                pipWin.document.body.append(img);
                resolve();
            });
        };
    });
}
