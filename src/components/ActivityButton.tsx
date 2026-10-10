import { Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { StarIcon, Tick02Icon } from "@hugeicons/core-free-icons";

import type { Activity } from "@/models/Activity";
import { getIconByName } from "@/utils/icons";
import { getContrastColor } from "@/utils/getContrastColor";
import { useTheme } from "@/hooks/use-theme";
import { NO_COLOR_ID } from "@/constants/activityColors";
import { Palette } from "@/constants/colors";

type ActivityButtonProps = Activity & {
  onPress?: () => void;
  onLongPress?: () => void;
  editMode?: boolean;
  logged?: boolean;
};

export function ActivityButton({
  name,
  color,
  icon,
  isFavorite,
  onPress,
  onLongPress,
  editMode = false,
  logged = false,
}: ActivityButtonProps) {
  const theme = useTheme();
  const iconData = getIconByName(icon);

  const isNoColor = color.id === NO_COLOR_ID;
  const backgroundColor = isNoColor ? theme.noColorBackground : color.hex;
  const contentColor = isNoColor ? theme.text : getContrastColor(color.hex);

  const showLoggedBorder = logged && !editMode;

  const borderColor = editMode
    ? theme.primary
    : showLoggedBorder
      ? Palette.success
      : isNoColor
        ? theme.border
        : "transparent";

  const scale = editMode ? 1.03 : logged ? 0.95 : 1;

  const style = {
    backgroundColor,
    borderWidth: 2,
    borderColor,
    transform: [{ scale }],
  };

  const showOverlay = logged && !editMode;

  const content = (
    <>
      <View className="flex-1 items-center justify-center">
        {iconData && (
          <HugeiconsIcon icon={iconData} size={45} color={contentColor} />
        )}
      </View>
      <Text
        className="text-center text-lg font-semibold"
        numberOfLines={2}
        style={{ color: contentColor }}
      >
        {name}
      </Text>
      {showOverlay && (
        <View
          className="absolute inset-0 rounded-2xl"
          style={{ backgroundColor: "rgba(128, 128, 128, 0.35)" }}
        />
      )}
      {isFavorite && (
        <View
          className="absolute left-2 top-2 h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: Palette.favorite }}
        >
          <HugeiconsIcon icon={StarIcon} size={14} color="#FFFFFF" />
        </View>
      )}
      {logged && (
        <View
          className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: Palette.success }}
        >
          <HugeiconsIcon icon={Tick02Icon} size={14} color="#FFFFFF" />
        </View>
      )}
    </>
  );

  if (editMode) {
    return (
      <View
        className="aspect-square rounded-2xl p-3"
        style={[
          style,
          {
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          },
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
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
