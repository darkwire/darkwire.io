/* eslint-disable */
function Zoom(domContent) {
  const OFFSET = 80;

  // From http://youmightnotneedjquery.com/#offset
  function offset(element) {
    const rect = element.getBoundingClientRect();

    return {
      top: rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft,
    };
  }

  function zoomListener() {
    let activeZoom = null;
    let initialScrollPosition = null;
    let initialTouchPosition = null;

    function listen() {
      domContent.addEventListener('click', event => {
        if (event.target.tagName !== 'IMG') return;

        zoom(event);
      });
    }

    function zoom(event) {
      event.stopPropagation();

      if (document.body.classList.contains('zoom-overlay-open')) return;
      if (event.target.width >= window.innerWidth - OFFSET) return;

      if (event.metaKey || event.ctrlKey) return openInNewWindow();

      closeActiveZoom({ forceDispose: true });

      activeZoom = vanillaZoom(event.target);
      activeZoom.zoomImage();

      addCloseActiveZoomListeners();
    }

    function openInNewWindow() {
      window.open(event.target.getAttribute('data-original') || event.target.currentSrc || event.target.src, '_blank');
    }

    function closeActiveZoom(options) {
      options = options || { forceDispose: false };
      if (!activeZoom) return;

      activeZoom[options.forceDispose ? 'dispose' : 'close']();
      removeCloseActiveZoomListeners();
      activeZoom = null;
    }

    function addCloseActiveZoomListeners() {
      // todo(fat): probably worth throttling this
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('click', handleClick);
      document.addEventListener('keyup', handleEscPressed);
      document.addEventListener('touchstart', handleTouchStart);
    }

    function removeCloseActiveZoomListeners() {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keyup', handleEscPressed);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchstart', handleTouchStart);
    }

    function handleScroll(event) {
      if (initialScrollPosition === null) initialScrollPosition = window.scrollY;
      const deltaY = initialScrollPosition - window.scrollY;
      if (Math.abs(deltaY) >= 40) closeActiveZoom();
    }

    function handleEscPressed(event) {
      if (event.keyCode == 27) closeActiveZoom();
    }

    function handleClick(event) {
      event.stopPropagation();
      event.preventDefault();
      closeActiveZoom();
    }

    function handleTouchStart(event) {
      initialTouchPosition = event.touches[0].pageY;
      event.target.addEventListener('touchmove', handleTouchMove);
    }

    function handleTouchMove(event) {
      if (Math.abs(event.touches[0].pageY - initialTouchPosition) <= 10) return;
      closeActiveZoom();
      event.target.removeEventListener('touchmove', handleTouchMove);
    }

    return { listen };
  }

  var vanillaZoom = (function () {
    let fullHeight = null;
    let fullWidth = null;
    let overlay = null;
    let imgScaleFactor = null;

    let targetImage = null;
    let targetImageWrap = null;
    let targetImageClone = null;

    function zoomImage() {
      const img = document.createElement('img');
      img.onload = function () {
        fullHeight = Number(img.height);
        fullWidth = Number(img.width);
        zoomOriginal();
      };
      img.src = targetImage.currentSrc || targetImage.src;
    }

    function zoomOriginal() {
      targetImageWrap = document.createElement('div');
      targetImageWrap.className = 'zoom-img-wrap';
      targetImageWrap.style.position = 'absolute';
      targetImageWrap.style.top = `${offset(targetImage).top}px`;
      targetImageWrap.style.left = `${offset(targetImage).left}px`;

      targetImageClone = targetImage.cloneNode();
      targetImageClone.style.visibility = 'hidden';

      targetImage.style.width = `${targetImage.offsetWidth}px`;
      targetImage.parentNode.replaceChild(targetImageClone, targetImage);

      document.body.appendChild(targetImageWrap);
      targetImageWrap.appendChild(targetImage);

      targetImage.classList.add('zoom-img');
      targetImage.setAttribute('data-action', 'zoom-out');

      overlay = document.createElement('div');
      overlay.className = 'zoom-overlay';

      document.body.appendChild(overlay);

      calculateZoom();
      triggerAnimation();
    }

    function calculateZoom() {
      targetImage.offsetWidth; // repaint before animating

      const originalFullImageWidth = fullWidth;
      const originalFullImageHeight = fullHeight;

      const maxScaleFactor = originalFullImageWidth / targetImage.width;

      const viewportHeight = window.innerHeight - OFFSET;
      const viewportWidth = window.innerWidth - OFFSET;

      const imageAspectRatio = originalFullImageWidth / originalFullImageHeight;
      const viewportAspectRatio = viewportWidth / viewportHeight;

      if (originalFullImageWidth < viewportWidth && originalFullImageHeight < viewportHeight) {
        imgScaleFactor = maxScaleFactor;
      } else if (imageAspectRatio < viewportAspectRatio) {
        imgScaleFactor = (viewportHeight / originalFullImageHeight) * maxScaleFactor;
      } else {
        imgScaleFactor = (viewportWidth / originalFullImageWidth) * maxScaleFactor;
      }
    }

    function triggerAnimation() {
      targetImage.offsetWidth; // repaint before animating

      const imageOffset = offset(targetImage);
      const scrollTop = window.scrollY;

      const viewportY = scrollTop + window.innerHeight / 2;
      const viewportX = window.innerWidth / 2;

      const imageCenterY = imageOffset.top + targetImage.height / 2;
      const imageCenterX = imageOffset.left + targetImage.width / 2;

      const translateY = viewportY - imageCenterY;
      const translateX = viewportX - imageCenterX;

      const targetImageTransform = `scale(${imgScaleFactor})`;
      const targetImageWrapTransform = `translate(${translateX}px, ${translateY}px) translateZ(0)`;

      targetImage.style.webkitTransform = targetImageTransform;
      targetImage.style.msTransform = targetImageTransform;
      targetImage.style.transform = targetImageTransform;

      targetImageWrap.style.webkitTransform = targetImageWrapTransform;
      targetImageWrap.style.msTransform = targetImageWrapTransform;
      targetImageWrap.style.transform = targetImageWrapTransform;

      document.body.classList.add('zoom-overlay-open');
    }

    function close() {
      document.body.classList.remove('zoom-overlay-open');
      document.body.classList.add('zoom-overlay-transitioning');

      targetImage.style.webkitTransform = '';
      targetImage.style.msTransform = '';
      targetImage.style.transform = '';

      targetImageWrap.style.webkitTransform = '';
      targetImageWrap.style.msTransform = '';
      targetImageWrap.style.transform = '';

      if (!('transition' in document.body.style)) return dispose();

      targetImage.addEventListener('transitionend', dispose);
      targetImage.addEventListener('webkitTransitionEnd', dispose);
    }

    function dispose() {
      targetImage.removeEventListener('transitionend', dispose);
      targetImage.removeEventListener('webkitTransitionEnd', dispose);

      if (!targetImageWrap || !targetImageWrap.parentNode) return;

      targetImage.classList.remove('zoom-img');
      targetImage.style.width = '';
      targetImage.setAttribute('data-action', 'zoom');

      targetImageClone.parentNode.replaceChild(targetImage, targetImageClone);
      targetImageWrap.parentNode.removeChild(targetImageWrap);
      overlay.parentNode.removeChild(overlay);

      document.body.classList.remove('zoom-overlay-transitioning');
    }

    return function (target) {
      targetImage = target;
      return { zoomImage, close, dispose };
    };
  })();

  zoomListener().listen();
}

export default Zoom;
