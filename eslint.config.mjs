import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/static-components": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/config": "off",
      "react-hooks/gating": "off",
      "@next/next/no-img-element": "off",
    },
  },
];
