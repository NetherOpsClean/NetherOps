export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["shared", "server", "docker", "auth", "database", "config", "ci", "deps", "pipeline"],
    ],
  },
};
