module.exports = () => ({
  autoDetect: ["node:test"],
  files: ["src/**/*.ts", "!src/**/*.test.ts"],
  tests: ["src/**/*.test.ts"],
  restart: false,
});
