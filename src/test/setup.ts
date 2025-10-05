import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Make React available globally
global.React = React;

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test case
afterEach(() => {
  cleanup();
});

// Add global types for jest-dom matchers
declare module 'vitest' {
  interface Assertion extends jest.Matchers<void> {}
  interface AsymmetricMatchersContaining extends jest.Matchers<void> {}
}
