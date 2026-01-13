import {
  createDarkTheme,
  createLightTheme,
  type BrandVariants,
  type Theme,
} from "@fluentui/react-components";

const kmm: BrandVariants = {
  10: "#020304",
  20: "#10191E",
  30: "#162934",
  40: "#193645",
  50: "#1B4357",
  60: "#1D516A",
  70: "#1D5F7D",
  80: "#1D6E91",
  90: "#1B7DA5",
  100: "#168CB9",
  110: "#239BCC",
  120: "#53A8D3",
  130: "#73B5DA",
  140: "#8FC2E1",
  150: "#AAD0E8",
  160: "#C3DEEF",
};

export const kmmLightTheme: Theme = {
  ...createLightTheme(kmm),
};

export const kmmDarkTheme: Theme = {
  ...createDarkTheme(kmm),
};

kmmDarkTheme.colorBrandForeground1 = kmm[110];
kmmDarkTheme.colorBrandForeground2 = kmm[120];
