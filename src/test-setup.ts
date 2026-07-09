import '@testing-library/jest-dom';

// jsdom does not implement PointerEvent capture API — polyfill as no-ops
if (typeof Element.prototype.setPointerCapture !== 'function') {
  Element.prototype.setPointerCapture = function () {
    // no-op: pointer capture not supported in jsdom
  };
}
if (typeof Element.prototype.releasePointerCapture !== 'function') {
  Element.prototype.releasePointerCapture = function () {
    // no-op
  };
}
