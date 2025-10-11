import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface JestAssertion extends jest.Matchers<void> {}
  }
}
