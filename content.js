let isSelecting = false;
let startX, startY, endX, endY;
let overlay;

console.log('PiP screenshot loaded')

// start screenshot mode when button in popup is pressed
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "startScreenshotMode") {
        console.log('screenshot mode ON');
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // reset overlay
        if (overlay) {
            overlay.remove();
            overlay = null;
        }

        overlay = document.createElement('div');
        overlay.id = 'screenshot-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.5)'; // Adjust opacity as needed
        overlay.style.pointerEvents = 'none';
    
        document.body.appendChild(overlay);
    }
});

// =========== functions =========== 
function handleMouseDown(event) {
    event.preventDefault(); // Prevent text selection
    isSelecting = true;
    startX = event.clientX;
    startY = event.clientY;
}

function handleMouseMove(event) {
    if (isSelecting) {
        endX = event.clientX;
        endY = event.clientY;

        drawSelectionRectangle(startX, startY, endX, endY);
    }
}

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
    rectangle.style.border = '2px solid #ff0000';
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

function handleMouseUp() {
    if (isSelecting) {
        isSelecting = false;
        // Capture the selected area as an image
        console.log(`coords: sx ex sy ey ${[startX, endX, startY, endY]}`)
        captureSelectedArea()
            .then(selectedImage => {
                // Display the image in a PiP window
                showImageInPiP(selectedImage);
            })
            .catch(error => {
                console.error('Error capturing the selected area:', error);
            })

            // Clear the selection box
            clearSelectionBox();
            // Remove event listeners
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            // remove overlay
            if (overlay) {
                overlay.remove();
                overlay = null;
            }
    }
}

function clearSelectionBox() {
    const rectangleSelector = document.getElementById('rectangle-selector');
    rectangleSelector.style.width = '0';
    rectangleSelector.style.height = '0';

    // Reset cursor position
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
}

function captureSelectedArea() {
    console.log(`Width; height; x; y ${[Math.abs(endX - startX), Math.abs(endY - startY), Math.min(startX, endX), Math.min(startY, endY)]}`)
    return new Promise((resolve, reject) => {
        html2canvas(document.documentElement, {
            width: Math.abs(endX - startX),
            height: Math.abs(endY - startY),
            windowWidth: Math.abs(endX - startX),
            windowHeight: Math.abs(endY - startY),
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            scrollX: 0,
            scrollY: 0,
        }).then(canvas => {
              resolve(canvas.toDataURL('image/png'));
            })
            .catch(error => {
                reject(error);
            });
    });
}

function showImageInPiP(imageDataURL) {
    const img = document.createElement('img');
    img.src = imageDataURL;
    console.log(`image dimensions ${[img.width, img.height]}`)

    // Listen for the 'load' event before attempting to get the dimensions
    img.onload = function() {
        console.log(`Image dimensions: [${img.width}, ${img.height}]`);

        const pipOptions = {
            width: img.width,
            height: img.height,
        };

        documentPictureInPicture.requestWindow(pipOptions).then(pipWin => {
            img.classList.add('pip-mode');
            pipWin.document.body.append(img);
        });
    };
}