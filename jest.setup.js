const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

beforeEach(() => {
  // Setup code for each test
});

afterEach(() => {
  // Cleanup code for each test
});