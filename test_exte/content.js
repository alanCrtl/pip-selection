// content.js
let isSelecting = false;
let startX, startY, endX, endY;

document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);

function handleMouseDown(event) {
  isSelecting = true;
  startX = event.clientX;
  startY = event.clientY;
}

function handleMouseMove(event) {
  if (isSelecting) {
    endX = event.clientX;
    endY = event.clientY;

    // Draw a selection rectangle on the page (you may need to customize this based on your UI preferences)
    drawSelectionRectangle(startX, startY, endX, endY);
  }
}

function handleMouseUp() {
  if (isSelecting) {
    isSelecting = false;

    // Perform actions with the selected rectangle coordinates (startX, startY, endX, endY)
    console.log('Selected rectangle:', startX, startY, endX, endY);
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
