/**
 * Registers swipe events.
 * Will emits swipe{left|right|up|down}-events on the `document`.
 */
(function() {
  var xDown = null,
      yDown = null,
      MIN_OFFSET = 40; // Minimum swipe distance in pixels
  document.addEventListener('touchstart', function (e) {                                         
    xDown = e.touches[0].clientX;                                      
    yDown = e.touches[0].clientY;                                      
  }, false);        
  document.addEventListener('touchmove', function (e) {
    if (!xDown || !yDown) {
      return;
    }

    var xUp = e.touches[0].clientX,
        yUp = e.touches[0].clientY,
        xDiff = xDown - xUp,
        yDiff = yDown - yUp,
        dir;
    if (Math.abs(xDiff) < MIN_OFFSET && Math.abs(yDiff) < MIN_OFFSET) {
      return false;
    }
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        dir = 'left';
      } else {
        dir = 'right';
      }                       
    } else {
      if (yDiff > 0) {
        dir = 'up';
      } else { 
        dir = 'down';
      }
    }
    if (dir) {
      var event = new Event('swipe' + dir);
      document.dispatchEvent(event);
    }

    xDown = null;
    yDown = null;                                             
  }, false);
})();