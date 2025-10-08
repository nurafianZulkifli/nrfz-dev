  // Initialize Flickity with options for partial slides
  document.addEventListener('DOMContentLoaded', function () {
    var elem = document.getElementById('delays-carousel');
    if (elem && window.Flickity) {
      new Flickity(elem, {
        cellAlign: 'left',
        contain: true,
        pageDots: false,
        groupCells: false,
        wrapAround: false,
        draggable: true,
        selectedAttraction: 0.025,
        friction: 0.28
      });
    }
  });