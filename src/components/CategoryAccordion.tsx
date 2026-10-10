import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowUp02Icon,
} from "@hugeicons/core-free-icons";
import Sortable from "react-native-sortables";
import type { AnimatedRef } from "react-native-reanimated";

import { useTheme } from "@/hooks/use-theme";
import { ActivityButton } from "@/components/ActivityButton";
import type { Activity } from "@/models/Activity";
import type { Category } from "@/models/Category";

type CategoryAccordionProps = {
  category: Category;
  activities: Activity[];
  editMode: boolean;
  loggedIds: Set<string>;
  scrollableRef: AnimatedRef<any>;
  onPressActivity: (activity: Activity) => void;
  onLongPressActivity: (activity: Activity) => void;
  onDragEnd: (categoryId: string, data: Activity[]) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  sortable?: boolean;
  onLongPressHeader?: () => void;
};

export function CategoryAccordion({
  category,
  activities,
  editMode,
  loggedIds,
  scrollableRef,
  onPressActivity,
  onLongPressActivity,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  sortable = true,
  onLongPressHeader,
}: CategoryAccordionProps) {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const showReorderControls = editMode && (onMoveUp || onMoveDown);
  const bodyVisible = !collapsed && activities.length > 0;

  return (
    <View className="mb-4">
      <View
        className={
          bodyVisible
            ? "flex-row items-center rounded-t-2xl border px-1"
            : "flex-row items-center rounded-2xl border px-1"
        }
        style={{ borderColor: theme.border, backgroundColor: theme.card }}
      >
        <TouchableOpacity
          onPress={() => setCollapsed((prev) => !prev)}
          onLongPress={editMode ? undefined : onLongPressHeader}
          className="flex-1 flex-row items-center px-3 py-3"
        >
          <Text className="text-base font-bold" style={{ color: theme.text }}>
            {category.name} {collapsed ? `(${activities.length})` : ""}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-2 pr-2">
          {showReorderControls && (
            <>
              <TouchableOpacity
                onPress={onMoveUp}
                disabled={!canMoveUp}
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: theme.surface,
                  opacity: canMoveUp ? 1 : 0.3,
                }}
              >
                <HugeiconsIcon
                  icon={ArrowUp02Icon}
                  size={16}
                  color={theme.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onMoveDown}
                disabled={!canMoveDown}
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: theme.surface,
                  opacity: canMoveDown ? 1 : 0.3,
                }}
              >
                <HugeiconsIcon
                  icon={ArrowDown02Icon}
                  size={16}
                  color={theme.text}
                />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => setCollapsed((prev) => !prev)}
            className="h-8 w-8 items-center justify-center"
          >
            <View
              style={{ transform: [{ rotate: collapsed ? "-90deg" : "0deg" }] }}
            >
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={18}
                color={theme.secondaryText}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {bodyVisible && (
        <View
          className="rounded-b-2xl p-4"
          style={{ backgroundColor: theme.surface }}
        >
          <Sortable.Grid
            data={activities}
            columns={3}
            rowGap={12}
            columnGap={12}
            strategy="insert"
            sortEnabled={editMode && sortable}
            scrollableRef={scrollableRef}
            activeItemScale={1.05}
            activeItemShadowOpacity={0.25}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => onDragEnd(category.id, data)}
            renderItem={({ item }) => (
              <ActivityButton
                {...item}
                editMode={editMode}
                logged={loggedIds.has(item.id)}
                onPress={editMode ? undefined : () => onPressActivity(item)}
                onLongPress={
                  editMode ? undefined : () => onLongPressActivity(item)
                }
              />
            )}
          />
        </View>
      )}
    </View>
  );
}
