import { ScrollView, Text, View, type ViewProps } from '@tarojs/components';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export interface SheetProps {
  open: boolean;
  /** Accessible dialog name, including when a custom header is supplied. */
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Replaces the visible title; the sheet still owns its close control. */
  header?: ReactNode;
  /** Fixed outside the content viewport. Omit for immediate selection. */
  footer?: ReactNode;
  /** Decorative glyph only; the sheet owns the button and accessible name. */
  closeIcon?: ReactNode;
  closeLabel?: string;
  closePlacement?: 'start' | 'end';
  titleAlign?: 'start' | 'center';
  closeOnBackdrop?: boolean;
  /** Natural content, a container ScrollView, or a bounded child-owned body. */
  bodyMode?: 'natural' | 'scroll' | 'fill';
  className?: string;
  style?: ViewProps['style'];
  contentClassName?: string;
  contentStyle?: ViewProps['style'];
}

/** Composable Taro surface. Data, selection and navigation remain in the host. */
export function Sheet({
  open,
  title,
  onClose,
  children,
  header,
  footer,
  closeIcon,
  closeLabel = `关闭${title}`,
  closePlacement = 'end',
  titleAlign = 'start',
  closeOnBackdrop = true,
  bodyMode = 'natural',
  className = '',
  style,
  contentClassName = '',
  contentStyle,
}: SheetProps) {
  if (!open) return null;
  const bodyClassName = `ui-sheet__content ui-sheet__content--${bodyMode}${contentClassName ? ` ${contentClassName}` : ''}`;
  const closeControl = (
    <Button
      className={`ui-sheet__close ui-sheet__close--${closePlacement}`}
      ariaLabel={closeLabel}
      onClick={onClose}
      appearance="plain"
      uiSize="icon"
    >
      {closeIcon ?? <Icon name="close" size="var(--sheet-close-icon-size, var(--sz-icon-control))" />}
    </Button>
  );

  return (
    <View className={`ui-sheet-host${className ? ` ${className}` : ''}`} style={style} catchMove>
      <Button
        className="ui-sheet__backdrop"
        ariaLabel={closeLabel}
        disabled={!closeOnBackdrop}
        onClick={closeOnBackdrop ? onClose : undefined}
        appearance="plain"
        uiSize="backdrop"
      />
      <View className="ui-sheet" ariaRole="dialog" ariaLabel={title}>
        <View className="ui-sheet__header">
          <View className={`ui-sheet__header-row ui-sheet__header-row--${closePlacement} ui-sheet__header-row--${titleAlign}`}>
            {closePlacement === 'start' ? closeControl : null}
            <View className="ui-sheet__heading">
              {header ?? <Text className="ui-sheet__title">{title}</Text>}
            </View>
            {closePlacement === 'end' ? closeControl : null}
          </View>
        </View>
        {bodyMode === 'scroll' ? (
          <ScrollView className={bodyClassName} style={contentStyle} scrollY enableFlex>
            {children}
          </ScrollView>
        ) : (
          <View className={bodyClassName} style={contentStyle}>{children}</View>
        )}
        {footer != null ? <View className="ui-sheet__footer">{footer}</View> : null}
      </View>
    </View>
  );
}
