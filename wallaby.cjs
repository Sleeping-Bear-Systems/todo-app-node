module.exports = () => ({
  autoDetect: ["node:test"],
  files: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.test.ts",
    "!src/**/*.test.tsx",
  ],
  tests: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  restart: false,
});
