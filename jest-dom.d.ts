// Brings @testing-library/jest-dom's matcher types (toBeChecked, toBeDisabled,
// toBeInTheDocument, ...) into scope for `tsc --noEmit`. The matchers
// themselves are registered at runtime by jest.setup.js.
import "@testing-library/jest-dom";
