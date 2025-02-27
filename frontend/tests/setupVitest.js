import * as matchers from "vitest-dom/matchers";
import createFetchMock from "vitest-fetch-mock";
import { vi, expect } from "vitest";
expect.extend(matchers);

const fetchMock = createFetchMock(vi);

fetchMock.enableMocks();

// Throw errors when a `console.error` or `console.warn` happens
// by overriding the functions
const CONSOLE_FAIL_TYPES = ["error", "warn"];

CONSOLE_FAIL_TYPES.forEach((type) => {
  console[type] = (message) => {
    throw new Error(
      `Failing due to console.${type} while running test! The original message:\n\n${message}`
    );
  };
});

// Mock FormData to make it easier to test
global.FormData = function () {
  return {
    _this_will_be_a_FormData_in_production: true,
    append(x, y) {
      Object.assign(this, { [x]: y });
    },
    toString() {
      return JSON.stringify(this);
    },
  };
}

