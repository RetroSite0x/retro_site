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

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  Object.defineProperty(globalThis, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverStub,
  });
}
