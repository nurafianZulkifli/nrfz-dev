// PDF.js loader for local PDF embedding using ESM (pdf.mjs)
import * as pdfjsLib from './pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.mjs';

const pdfUrl = 'assets/SM_20250704_BI.pdf';
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
    const newScale = Math.min(Math.max(touchStartScale * ratio, 0.4), 6);
    if (Math.abs(newScale - currentScale) > 0.05) {
      currentScale = newScale;
      renderPage(currentPageNum, currentScale);
      e.preventDefault();
    }
  }
}, { passive: false });

window.addEventListener('DOMContentLoaded', () => {
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const fitWidthBtn = document.getElementById('fit-width');
  const fitPageBtn = document.getElementById('fit-page');

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      currentScale = Math.min(currentScale + 0.2, 6);
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
