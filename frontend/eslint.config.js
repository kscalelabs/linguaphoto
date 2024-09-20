import { fixupConfigRules } from "@eslint/compat";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import globals from "globals";
import tseslint from "typescript-eslint";

const reactSettings = {
  settings: {
    react: {
      version: "detect", // Automatically detect the React version
    },
  },
};

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  reactSettings,
  ...fixupConfigRules({
    ...pluginReactConfig,
    rules: {
      ...pluginReactConfig.rules,
      "react/react-in-jsx-scope": "off", 
      "react/prop-types": "off", // Disable prop-types validation
    },
  }),
  {
    files: ["*.ts", "*.tsx"], // Apply this rule to TypeScript files
    rules: {
      "react/prop-types": "off", // Ensure prop-types are off for TypeScript files
    },
  },
];
