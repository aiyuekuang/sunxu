import type { PropsWithChildren } from 'react';
import { Icon as NativeIcon } from '@tarojs/components';
import { SunxuTaroProvider, type IconProps } from 'sunxu-taro';
import 'sunxu-taro/tokens.css';
import 'sunxu-taro/styles.css';
import 'sunxu-taro/overrides.css';
import './app.css';

// A sample host supplies platform icons. Production hosts inject their own
// consistent icon family; the library never imports a host asset directory.
function renderIcon({ name, className, color }: IconProps) {
  const type = name === 'search' ? 'search' : name === 'checkmark' ? 'success_no_circle' : name === 'close' ? 'clear' : 'info';
  return <NativeIcon type={type} className={className} color={color || '#666666'} size={16} />;
}

export default function App({ children }: PropsWithChildren) {
  return <SunxuTaroProvider renderIcon={renderIcon}>{children}</SunxuTaroProvider>;
}
