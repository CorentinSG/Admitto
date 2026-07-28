import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "graphify-out/**",
      "coverage/**",
      "next-env.d.ts", // fichier généré par Next.js
    ],
  },
  {
    rules: {
      // Le design system impose des styles inline : ne jamais activer de
      // règle interdisant style={{}} dans le JSX.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];

export default config;
