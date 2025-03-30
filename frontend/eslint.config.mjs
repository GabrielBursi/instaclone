import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginQuery from '@tanstack/eslint-plugin-query'
import eslintConfigPrettier from "eslint-config-prettier/flat";
import sonarjs from 'eslint-plugin-sonarjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...pluginQuery.configs['flat/recommended'],
  eslintConfigPrettier,
  sonarjs.configs.recommended,
];

export default eslintConfig;
