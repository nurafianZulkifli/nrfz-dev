// PDF.js loader for local PDF embedding using ESM (pdf.mjs)
import * as pdfjsLib from './pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.mjs';

const pdfUrl = 'assets/system-map-lta.pdf';
let currentScale = 1.2;
let pdfDoc = null;
let currentPageNum = 1;
const viewerWidth = window.innerWidth > 900 ? 900 : window.innerWidth - 40;

function renderPage(pageNum, scale) {
  if (!pdfDoc) return;
  pdfDoc.getPage(pageNum).then(page => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const viewer = document.getElementById('pdf-viewer');
    viewer.innerHTML = '';
    viewer.appendChild(canvas);
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    page.render(renderContext);
    updateZoomLevel();
  });
}

function updateZoomLevel() {
  const zoomPercent = Math.round(currentScale * 100);
  document.getElementById('zoom-level').textContent = zoomPercent + '%';
}

function fitToWidth() {
  if (!pdfDoc) return;
  pdfDoc.getPage(1).then(page => {
    const viewport = page.getViewport({ scale: 1 });
    const newScale = (viewerWidth - 20) / viewport.width;
    currentScale = newScale;
    renderPage(1, currentScale);
  });
}

function fitToPage() {
  if (!pdfDoc) return;
  pdfDoc.getPage(1).then(page => {
    const viewport = page.getViewport({ scale: 1 });
    const maxHeight = window.innerHeight * 0.8;
    const scaleByWidth = (viewerWidth - 20) / viewport.width;
    const scaleByHeight = maxHeight / viewport.height;
    currentScale = Math.min(scaleByWidth, scaleByHeight);
    renderPage(1, currentScale);
  });
}

pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
  pdfDoc = pdf;
  fitToPage();
}, reason => {
  document.getElementById('pdf-viewer').innerText = 'Failed to load PDF.';
});

// Touch pinch-to-zoom functionality
let touchStartDistance = 0;
let touchStartScale = 1.2;

document.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    touchStartDistance = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
    touchStartScale = currentScale;
  }
});

document.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
    const ratio = currentDistance / touchStartDistance;
    const newScale = Math.min(Math.max(touchStartScale * ratio, 0.4), 10);
    if (Math.abs(newScale - currentScale) > 0.05) {
      currentScale = newScale;
      renderPage(currentPageNum, currentScale);
      e.preventDefault();
    }
  }
}, { passive: false });

// Scroll wheel zoom functionality
document.addEventListener('wheel', (e) => {
  // Check if we're over the PDF viewer
  if (!e.target.closest('#pdf-viewer') && !e.target.closest('.pdf-controls')) {
    return;
  }
  
  e.preventDefault();
  
  // Determine zoom direction (negative deltaY = scroll up = zoom in)
  const zoomDirection = e.deltaY < 0 ? 0.2 : -0.2;
  const newScale = Math.min(Math.max(currentScale + zoomDirection, 0.4), 10);
  
  if (Math.abs(newScale - currentScale) > 0.01) {
    currentScale = newScale;
    renderPage(currentPageNum, currentScale);
  }
}, { passive: false });

// Drag to pan functionality
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let scrollLeft = 0;
let scrollTop = 0;

const pdfViewerElement = document.getElementById('pdf-viewer');

// Mouse drag events
document.addEventListener('mousedown', (e) => {
  if (e.target.closest('#pdf-viewer')) {
    isDragging = true;
    dragStartX = e.pageX;
    dragStartY = e.pageY;
    scrollLeft = pdfViewerElement.scrollLeft;
    scrollTop = pdfViewerElement.scrollTop;
    pdfViewerElement.style.cursor = 'grabbing';
  }
});

document.addEventListener('mousemove', (e) => {
  if (isDragging && pdfViewerElement) {
    const x = e.pageX - dragStartX;
    const y = e.pageY - dragStartY;
    pdfViewerElement.scrollLeft = scrollLeft - x;
    pdfViewerElement.scrollTop = scrollTop - y;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  if (pdfViewerElement) {
    pdfViewerElement.style.cursor = 'grab';
  }
});

// Touch drag events (alternative to pinch zoom)
let touchDragStartX = 0;
let touchDragStartY = 0;
let touchScrollLeft = 0;
let touchScrollTop = 0;

document.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1 && e.target.closest('#pdf-viewer')) {
    touchDragStartX = e.touches[0].pageX;
    touchDragStartY = e.touches[0].pageY;
    touchScrollLeft = pdfViewerElement.scrollLeft;
    touchScrollTop = pdfViewerElement.scrollTop;
  }
});

document.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1 && pdfViewerElement) {
    const x = e.touches[0].pageX - touchDragStartX;
    const y = e.touches[0].pageY - touchDragStartY;
    pdfViewerElement.scrollLeft = touchScrollLeft - x;
    pdfViewerElement.scrollTop = touchScrollTop - y;
  }
}, { passive: true });

window.addEventListener('DOMContentLoaded', () => {
  if (pdfViewerElement) {
    pdfViewerElement.style.cursor = 'grab';
  }
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const fitWidthBtn = document.getElementById('fit-width');
  const fitPageBtn = document.getElementById('fit-page');

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      currentScale = Math.min(currentScale + 0.2, 10);
      renderPage(currentPageNum, currentScale);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      currentScale = Math.max(currentScale - 0.2, 0.4);
      renderPage(currentPageNum, currentScale);
    });
  }

  if (fitWidthBtn) {
    fitWidthBtn.addEventListener('click', fitToWidth);
  }

  if (fitPageBtn) {
    fitPageBtn.addEventListener('click', fitToPage);
  }
});
