import { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  type ListRenderItemInfo,
} from 'react-native';

import { useTheme } from '@/theme';

export interface FilterChipOption {
  id: string;
  label: string;
}

export interface FilterChipsProps {
  options: FilterChipOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function FilterChips({ options, selectedId, onSelect }: FilterChipsProps) {
  const { colors } = useTheme();

  const renderItem = useCallback(
    ({ item: opt }: ListRenderItemInfo<FilterChipOption>) => {
      const active = opt.id === selectedId;
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          onPress={() => onSelect(opt.id)}
          style={[
            styles.chip,
            {
              backgroundColor: active ? colors.primary : colors.card,
              borderColor: active ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={{
              color: active ? colors.primaryForeground : colors.foreground,
              fontSize: 14,
              fontWeight: '500',
            }}
          >
            {opt.label}
          </Text>
        </Pressable>
      );
    },
    [selectedId, onSelect, colors],
  );

  return (
    <FlatList
      horizontal
      data={options}
      keyExtractor={(opt) => opt.id}
      renderItem={renderItem}
      extraData={selectedId}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 9999,
  },
});
