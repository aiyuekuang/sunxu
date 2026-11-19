import { useEffect, useState } from 'react';
import { ScrollView, Text } from '@tarojs/components';
import { Button } from './Button';
import { Icon } from './Icon';
import { SearchInput } from './SearchInput';
import { Sheet } from './Sheet';

const OPTION_ROW_HEIGHT_RPX = 84; // Matches --h-select-option.
const MAX_VISIBLE_OPTIONS = 8;

/** Shared bottom sheet for choosing one value from a short or searchable option list. */
export function OptionSheet({
  open,
  title,
  options,
  selectedIndex,
  searchable = false,
  searchPlaceholder = '搜索选项',
  emptyText = '暂无可选项',
  onClose,
  onChoose
}: {
  open: boolean;
  title: string;
  options: readonly string[];
  selectedIndex?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  onClose: () => void;
  onChoose: (index: number) => void;
}) {
  const [keyword, setKeyword] = useState('');
  useEffect(() => {
    if (!open) setKeyword('');
  }, [open]);
  if (!open) return null;
  const query = keyword.trim().toLocaleLowerCase();
  const visibleOptions = options
    .map((label, index) => ({ label, index }))
    .filter((option) => !query || option.label.toLocaleLowerCase().includes(query));

  function close() {
    setKeyword('');
    onClose();
  }

  function choose(index: number) {
    setKeyword('');
    onChoose(index);
  }

  return (
    <Sheet open={open} title={title} onClose={close} closeLabel={`关闭${title}选项`} className="ui-select-sheet-host" bodyMode="fill">
        {searchable ? (
          <SearchInput
            ariaLabel={`${title}搜索`}
            className="ui-select-sheet__search"
            placeholder={searchPlaceholder}
            value={keyword}
            onInput={(event) => setKeyword(event.detail.value)}
            clearable
            onClear={() => setKeyword('')}
          />
        ) : null}
        {visibleOptions.length ? (
          <ScrollView
            className="ui-select-sheet__list"
            scrollY
            enableFlex
            style={{ height: `${Math.min(visibleOptions.length, MAX_VISIBLE_OPTIONS) * OPTION_ROW_HEIGHT_RPX}rpx` }}
          >
            {visibleOptions.map(({ index, label }) => (
              <Button
                ariaLabel={label}
                aria-pressed={selectedIndex === index}
                className={`ui-select-sheet__option${selectedIndex === index ? ' is-selected' : ''}`}
                key={`${index}-${label}`}
                onClick={() => choose(index)}
                appearance="plain"
                uiSize="row"
              >
                <Text>{label}</Text>
                {selectedIndex === index ? <Icon name="checkmark" size="var(--sz-icon-control)" /> : null}
              </Button>
            ))}
          </ScrollView>
        ) : (
          <Text className="ui-select-sheet__empty">{keyword ? '没有匹配选项' : emptyText}</Text>
        )}
    </Sheet>
  );
}
