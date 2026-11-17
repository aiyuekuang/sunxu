import { Button as NativeButton, Text, type ITouchEvent } from '@tarojs/components';
import type { ButtonProps as NativeButtonProps } from '@tarojs/components';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Taro from '@tarojs/taro';

/**
 * Native Taro button wrapper. Business variants remain explicit CSS classes;
 * size and shape variants own shared geometry, while page classes own layout.
 */
export type ButtonProps = Omit<NativeButtonProps, 'className'> & {
  className?: string;
  screenReaderLabel?: string;
  appearance?: 'standard' | 'plain';
  /** Allow a floating button to drag within the viewport and snap to a side. */
  draggableFab?: boolean;
  uiSize: 'small' | 'compact' | 'medium' | 'regular' | 'tall' | 'large' | 'hero' | 'fab' | 'icon' | 'touch-icon' | 'row' | 'tab' | 'segmented' | 'link' | 'action' | 'filter' | 'backdrop';
  shape?: 'rounded' | 'pill' | 'circle';
};

interface FloatingButtonBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

let appButtonId = 0;

export function Button({
  className = '',
  screenReaderLabel,
  appearance = 'standard',
  draggableFab = false,
  plain,
  uiSize,
  shape,
  id,
  style,
  disabled = false,
  onClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  children,
  hoverClass = 'ui-button--pressed',
  hoverStartTime = 20,
  hoverStayTime = 70,
  ...props
}: ButtonProps) {
  const generatedIdRef = useRef<string | null>(null);
  if (!generatedIdRef.current) generatedIdRef.current = `app-fab-${++appButtonId}`;
  const buttonId = id || (draggableFab ? generatedIdRef.current : undefined);
  const boundsRef = useRef<FloatingButtonBounds | null>(null);
  const didDragRef = useRef(false);
  const suppressClickUntilRef = useRef(0);
  const [dragStyle, setDragStyle] = useState<CSSProperties | undefined>();

  useEffect(() => {
    if (!draggableFab || !buttonId) return undefined;
    const timer = setTimeout(() => {
      Taro.createSelectorQuery().select(`#${buttonId}`).boundingClientRect((result) => {
        const rect = Array.isArray(result) ? result[0] : result;
        if (!rect || typeof rect.left !== 'number' || typeof rect.top !== 'number') return;
        boundsRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      }).exec();
    }, 80);
    return () => clearTimeout(timer);
  }, [buttonId, draggableFab]);

  const handleTouchStart = (event: ITouchEvent) => {
    onTouchStart?.(event);
    didDragRef.current = false;
    suppressClickUntilRef.current = 0;
    setDragStyle((current) => current ? { ...current, transition: 'none' } : current);
  };

  const handleTouchMove = (event: ITouchEvent) => {
    onTouchMove?.(event);
    if (!draggableFab || disabled) return;
    const touch = event.touches[0] || event.changedTouches[0];
    const bounds = boundsRef.current;
    if (!touch || !bounds) return;
    didDragRef.current = true;
    event.stopPropagation();
    event.preventDefault();
    const left = touch.clientX - bounds.width / 2;
    const top = touch.clientY - bounds.height / 2;
    boundsRef.current = { ...bounds, left, top };
    setDragStyle({ position: 'fixed', left, top, right: 'auto', bottom: 'auto', transition: 'none' });
  };

  const finishDrag = () => {
    const bounds = boundsRef.current;
    if (!draggableFab || disabled || !didDragRef.current || !bounds) return;
    const { windowWidth, windowHeight } = Taro.getSystemInfoSync();
    const minLeft = 20;
    const maxLeft = Math.max(minLeft, windowWidth - bounds.width - 20);
    const minTop = 116;
    const maxTop = Math.max(minTop, windowHeight - bounds.height - 70);
    const clampedLeft = Math.min(Math.max(bounds.left, minLeft), maxLeft);
    const nextLeft = clampedLeft > windowWidth / 2 ? maxLeft : minLeft;
    const nextTop = Math.min(Math.max(bounds.top, minTop), maxTop);
    boundsRef.current = { ...bounds, left: nextLeft, top: nextTop };
    setDragStyle({ position: 'fixed', left: nextLeft, top: nextTop, right: 'auto', bottom: 'auto', transition: 'all 0.3s' });
    suppressClickUntilRef.current = Date.now() + 500;
    didDragRef.current = false;
  };

  const handleTouchEnd = (event: ITouchEvent) => {
    onTouchEnd?.(event);
    finishDrag();
  };

  const handleTouchCancel = (event: ITouchEvent) => {
    onTouchCancel?.(event);
    finishDrag();
  };

  const handleClick = (event: ITouchEvent) => {
    if (Date.now() < suppressClickUntilRef.current) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const expandHitArea = ['small', 'compact', 'medium', 'regular', 'tall', 'large', 'icon', 'row', 'tab', 'segmented', 'link', 'filter'].includes(uiSize);
  const variantClasses = [
    `ui-button--size-${uiSize}`,
    appearance === 'plain' ? 'ui-button--appearance-plain' : '',
    expandHitArea ? 'ui-button--expanded-hit-area' : '',
    shape ? `ui-button--shape-${shape}` : ''
  ].filter(Boolean).join(' ');
  return (
    <NativeButton
      {...props}
      id={buttonId}
      disabled={disabled}
      style={dragStyle || style}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      plain={appearance === 'plain' || plain}
      className={`ui-button${variantClasses ? ` ${variantClasses}` : ''}${className ? ` ${className}` : ''}`}
      hoverClass={hoverClass}
      hoverStartTime={hoverStartTime}
      hoverStayTime={hoverStayTime}
    >
      {children}
      {screenReaderLabel ? <Text className="ui-visually-hidden">{screenReaderLabel}</Text> : null}
    </NativeButton>
  );
}
