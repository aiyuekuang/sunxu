import { View } from '@tarojs/components';
import type { ViewProps } from '@tarojs/components';

type PageContentContainerProps = Omit<ViewProps, 'className'> & {
  className?: string;
};

/** Inset content inside an intentional full-bleed page root. */
export function PageContentContainer({ className = '', children, ...viewProps }: PageContentContainerProps) {
  return (
    <View
      {...viewProps}
      className={['app-page-content-container', className].filter(Boolean).join(' ')}
    >
      {children}
    </View>
  );
}
