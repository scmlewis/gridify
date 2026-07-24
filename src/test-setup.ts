import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

HTMLDivElement.prototype.setPointerCapture = vi.fn();
HTMLDivElement.prototype.releasePointerCapture = vi.fn();
