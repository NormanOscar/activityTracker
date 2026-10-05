// src/components/ActivityButton.tsx
import { Text, TouchableOpacity, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";

import type { Activity } from "@/models/Activity";
import { getIconByName } from "@/utils/icons";
import { getContrastColor } from "@/utils/getContrastColor";
import { useTheme } from "@/hooks/use-theme";
import { NO_COLOR_ID } from "@/constants/activityColors";

type ActivityButtonProps = Activity & {
  onPress?: () => void;
};

export function ActivityButton({ name, color, icon, onPress }: ActivityButtonProps) {
  const theme = useTheme();
  const iconData = getIconByName(icon);

  const isNoColor = color.id === NO_COLOR_ID;
  const backgroundColor = isNoColor ? theme.noColorBackground : color.hex;
  const contentColor = isNoColor ? theme.text : getContrastColor(color.hex);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="aspect-square w-[31%] rounded-2xl p-3"
      style={{
        backgroundColor,
        borderWidth: isNoColor ? 1 : 0,
        borderColor: theme.border,
      }}
    >
      <View className="flex-1 items-center justify-center">
        {iconData && <HugeiconsIcon icon={iconData} size={45} color={contentColor} />}
      </View>
      <Text className="text-lg text-center font-semibold" numberOfLines={2} style={{ color: contentColor }}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}
