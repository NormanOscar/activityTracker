// src/components/ActivityButton.tsx
import { Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { HugeiconsIcon } from "@hugeicons/react-native";

import type { Activity } from "@/models/Activity";
import { getIconByName } from "@/utils/icons";
import { getContrastColor } from "@/utils/getContrastColor";
import { useTheme } from "@/hooks/use-theme";
import { NO_COLOR_ID } from "@/constants/activityColors";

type ActivityButtonProps = Activity & {
  onPress?: () => void;
  onLongPress?: () => void;
  editMode?: boolean;
};

export function ActivityButton({
  name,
  color,
  icon,
  onPress,
  onLongPress,
  editMode = false,
}: ActivityButtonProps) {
  const theme = useTheme();
  const iconData = getIconByName(icon);

  const isNoColor = color.id === NO_COLOR_ID;
  const backgroundColor = isNoColor ? theme.noColorBackground : color.hex;
  const contentColor = isNoColor ? theme.text : getContrastColor(color.hex);

  const style = {
    backgroundColor,
    borderWidth: editMode ? 2 : isNoColor ? 1 : 0,
    borderColor: editMode ? theme.primary : theme.border,
  };

  const content = (
    <>
      <View className="flex-1 items-center justify-center">
        {iconData && <HugeiconsIcon icon={iconData} size={45} color={contentColor} />}
      </View>
      <Text className="text-lg text-center font-semibold" numberOfLines={2} style={{ color: contentColor }}>
        {name}
      </Text>
    </>
  );

  // Sortable.Grid owns the long-press-to-drag gesture for this item internally
  // while in edit mode — wrapping it in our own Touchable here, even with no
  // handlers attached, would still compete for the same gesture (the exact issue
  // that made dragging laggy with the previous library). So edit mode renders a
  // plain, non-interactive View and leaves all touch handling to the library.
  if (editMode) {
    return (
      <View className="aspect-square rounded-2xl p-3" style={style}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      // Plain style values, not className — NativeWind only translates className
      // into real styles for components it explicitly patches, and this Pressable
      // (from react-native-gesture-handler, not core React Native) isn't one of
      // them, so the aspect-ratio/radius/padding classes were silently no-ops here.
      style={({ pressed }) => [
        { aspectRatio: 1, borderRadius: 16, padding: 12 },
        style,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      {content}
    </Pressable>
  );
}
