import { Buffer } from "buffer";

// Polyfill for Buffer in browser environment
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}

// Polyfill for global
if (typeof global === "undefined") {
  window.global = window;
}

// Polyfill for process
if (typeof process === "undefined") {
  // @ts-expect-error - Adding process to window
  window.process = { env: {} };
}
