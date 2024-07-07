import { theme } from 'antd';

import type { ThemeConfig } from 'antd';

const { defaultAlgorithm, darkAlgorithm } = theme;

const basicTheme: ThemeConfig = {
  cssVar: true,
  token: {
    fontSize: 14,
    borderRadius: 6,
    colorPrimary: '#38d96b',
    colorLink: '#38d96b',
  },
  components: {
    Menu: {
      darkItemBg: '#191A17'
    },
    Layout: {
      siderBg: '#191A17'
    },
  }
};

const defaultTheme: ThemeConfig = { ...basicTheme, algorithm: defaultAlgorithm };
const darkTheme: ThemeConfig = { ...basicTheme, algorithm: darkAlgorithm };

export { defaultTheme, darkTheme };