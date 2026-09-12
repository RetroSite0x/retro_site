import '@testing-library/jest-dom';

// jsdom does not implement PointerEvent capture API — polyfill as no-ops.
// Tests fire pointerup on document/window targets, so patch all three prototypes.

function noop() {
  // no-op: pointer capture not supported in jsdom
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const protos: any[] = [Element.prototype, Document.prototype, Window.prototype];

for (const proto of protos) {
  if (typeof proto.setPointerCapture !== 'function') {
    proto.setPointerCapture = noop;
  }
  if (typeof proto.releasePointerCapture !== 'function') {
    proto.releasePointerCapture = noop;
  }
}
