import { defineConfig } from '@tarojs/cli';

export default defineConfig({
  projectName: 'sunxu-taro-catalog',
  designWidth: 750,
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  compiler: 'webpack5',
  cache: { enable: false },
  plugins: [],
  mini: { postcss: { pxtransform: { enable: true } } }
});
