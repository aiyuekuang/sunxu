import { useState } from 'react';
import { Text, View } from '@tarojs/components';
import { Button } from './Button';

export function Hint({ label, hint }: { label: string; hint: string }) {
  const [open, setOpen] = useState(false);

  return (
    <View className={`app-hint${open ? ' is-open' : ''}`}>
      <Button
        className="app-hint__trigger"
        uiSize="icon"
        ariaLabel={`${open ? '收起' : '查看'}${label}`}
        aria-expanded={open}
        screenReaderLabel={`${open ? '收起' : '查看'}${label}`}
        onClick={() => setOpen((current) => !current)}
      >
        <Text>?</Text>
      </Button>
      {open ? <Text className="app-hint__message">{hint}</Text> : null}
    </View>
  );
}
