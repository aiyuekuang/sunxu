import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';

/**
 * 标识当前组件树是否在 BottomSheet 内部。
 * 输入组件据此自动切换为 BottomSheetTextInput + 非受控模式，
 * 避免 IME（手写/拼音等）组合状态被打断。
 */
export const BottomSheetInternalContext = createContext(false);

/** 检测当前组件是否在 BottomSheet 内部 */
export function useIsInsideBottomSheet(): boolean {
  return useContext(BottomSheetInternalContext);
}

/**
 * BottomSheet 内 TextInput 的非受控适配 hook。
 *
 * 受控 TextInput（value + onChangeText + setState）的 value prop 回写会在每次
 * 重渲染时清空 IME 组合缓冲区，导致手写/拼音输入每画一笔就提交一个字符
 * (RN #19104, React #8683)。
 *
 * 本 hook 在 BottomSheet 内自动切换为非受控模式（defaultValue + key 重挂载），
 * 外部仅在表单 reset/编辑回填等非打字场景才触发重挂载。
 * 非 BottomSheet 场景完全透传，零影响。
 *
 * @example
 * const { inputProps, InputComponent } = useBottomSheetTextInput({ value, onChangeText });
 * <InputComponent {...inputProps} style={...} placeholder={...} />
 */
export function useBottomSheetTextInput({
  value,
  onChangeText,
  forceInsideBottomSheet,
}: {
  value: string | undefined;
  onChangeText: ((text: string) => void) | undefined;
  forceInsideBottomSheet?: boolean;
}) {
  const contextInside = useIsInsideBottomSheet();
  const isInside = forceInsideBottomSheet ?? contextInside;
  const internalValueRef = useRef(value ?? '');
  const latestValueRef = useRef(value ?? '');
  const syncFrameRef = useRef<number | null>(null);
  const [resetKey, setResetKey] = useState(0);

  latestValueRef.current = value ?? '';

  useEffect(() => {
    if (!isInside) return;
    const externalValue = value ?? '';
    if (syncFrameRef.current != null) {
      cancelAnimationFrame(syncFrameRef.current);
      syncFrameRef.current = null;
    }
    if (externalValue === internalValueRef.current) {
      return;
    }
    // 延后一帧再对齐外部值，避免快速连续删字时被中间态误判成“外部重置”。
    syncFrameRef.current = requestAnimationFrame(() => {
      syncFrameRef.current = null;
      if (latestValueRef.current !== externalValue) {
        return;
      }
      if (externalValue === internalValueRef.current) {
        return;
      }
      internalValueRef.current = externalValue;
      setResetKey((k) => k + 1);
    });
    return () => {
      if (syncFrameRef.current != null) {
        cancelAnimationFrame(syncFrameRef.current);
        syncFrameRef.current = null;
      }
    };
  }, [value, isInside]);

  const handleChangeText = (text: string) => {
    if (isInside) {
      internalValueRef.current = text;
    }
    onChangeText?.(text);
  };

  // 统一返回 handleChangeText，保证 onChangeText 始终非 undefined。
  // 这样 QuickNumInput/ScanInput 等组件可以安全地直接调用 inputProps.onChangeText()。
  if (!isInside) {
    return {
      InputComponent: TextInput,
      inputKey: undefined,
      inputProps: { value, onChangeText: handleChangeText },
    } as const;
  }

  return {
    InputComponent: BottomSheetTextInput,
    inputKey: resetKey,
    inputProps: {
      defaultValue: value ?? '',
      onChangeText: handleChangeText,
    },
  } as const;
}
