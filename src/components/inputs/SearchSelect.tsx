import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/use-theme";

type SearchSelectProps<T> = {
  items: T[];
  value: T | null;
  onChange: (item: T) => void;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  renderItem?: (item: T, selected: boolean) => React.ReactNode;
  renderValue?: (item: T) => React.ReactNode;
  // Full control over the closed trigger's content, including the empty (no
  // selection) state — used for the compact swatch/icon-only boxes, which don't
  // want the default label+placeholder text treatment at all.
  renderTrigger?: (value: T | null) => React.ReactNode;
  // When true, the trigger renders as a padded square box with centered content
  // and no chevron (used for ColorSelect/IconSelect) instead of the default
  // row-style field. triggerClassName/showChevron still override either preset.
  squareTrigger?: boolean;
  triggerClassName?: string;
  showChevron?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  title?: string;
  numColumns?: number;
  maxResults?: number;
};

// A generic searchable picker: a pressable field that opens a full-screen modal with a
// search box and a (optionally multi-column) list of matching items. ColorSelect and
// IconSelect are both just this, specialized with how an item looks and what it searches.
export function SearchSelect<T>({
  items,
  value,
  onChange,
  getKey,
  getLabel,
  renderItem,
  renderValue,
  renderTrigger,
  squareTrigger = false,
  triggerClassName,
  showChevron,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  title,
  numColumns = 1,
  maxResults = 60,
}: SearchSelectProps<T>) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const resolvedTriggerClassName =
    triggerClassName ??
    (squareTrigger
      ? "h-28 w-28 items-center justify-center rounded-3xl border p-4"
      : "flex-row items-center justify-between rounded-xl border px-4 py-3");
  const resolvedShowChevron = showChevron ?? !squareTrigger;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter((item) => getLabel(item).toLowerCase().includes(q))
      : items;
    return filtered.slice(0, maxResults);
  }, [items, query, getLabel, maxResults]);

  const selectedKey = value ? getKey(value) : null;

  const handleSelect = (item: T) => {
    onChange(item);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={resolvedTriggerClassName}
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        {renderTrigger ? (
          renderTrigger(value)
        ) : value && renderValue ? (
          renderValue(value)
        ) : (
          <Text style={{ color: theme.secondaryText }}>{placeholder}</Text>
        )}
        {resolvedShowChevron && (
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={18}
            color={theme.secondaryText}
          />
        )}
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaProvider>
          <SafeAreaView
            className="flex-1"
            style={{ backgroundColor: theme.modalBackground }}
          >
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-lg font-bold" style={{ color: theme.text }}>
                {title ?? placeholder}
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.surface }}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={18}
                  color={theme.text}
                />
              </Pressable>
            </View>

            <View
              className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <HugeiconsIcon
                icon={Search01Icon}
                size={18}
                color={theme.secondaryText}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={theme.secondaryText}
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1"
                style={{ color: theme.text }}
              />
            </View>

            <FlatList
              key={numColumns}
              data={results}
              keyExtractor={getKey}
              numColumns={numColumns}
              contentContainerStyle={{ padding: 16, gap: 8 }}
              columnWrapperStyle={numColumns > 1 ? { gap: 8 } : undefined}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = getKey(item) === selectedKey;
                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={{ flex: numColumns > 1 ? 1 : undefined }}
                  >
                    {renderItem ? (
                      renderItem(item, selected)
                    ) : (
                      <Text style={{ color: theme.text }}>
                        {getLabel(item)}
                      </Text>
                    )}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text
                  className="mt-8 text-center"
                  style={{ color: theme.secondaryText }}
                >
                  No results
                </Text>
              }
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}
