import { Text, TouchableOpacity, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArchiveRestoreIcon } from "@hugeicons/core-free-icons";

import type { Activity } from "@/models/Activity";
import { getIconByName } from "@/utils/icons";
import { getContrastColor } from "@/utils/getContrastColor";
import { useTheme } from "@/hooks/use-theme";
import { NO_COLOR_ID } from "@/constants/activityColors";

type ArchivedActivityRowProps = {
  activity: Activity;
  onUnarchive: () => void;
};

export function ArchivedActivityRow({
  activity,
  onUnarchive,
}: ArchivedActivityRowProps) {
  const theme = useTheme();
  const iconData = getIconByName(activity.icon);

  const isNoColor = activity.color.id === NO_COLOR_ID;
  const swatchColor = isNoColor ? theme.noColorBackground : activity.color.hex;
  const iconColor = isNoColor
    ? theme.text
    : getContrastColor(activity.color.hex);

  return (
    <View
      className="flex-row items-center gap-3 rounded-lg border p-3"
      style={{ borderColor: theme.border, backgroundColor: theme.surface }}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: swatchColor }}
      >
        {iconData && (
          <HugeiconsIcon icon={iconData} size={24} color={iconColor} />
        )}
      </View>

      <Text
        className="flex-1 text-base font-semibold"
        style={{ color: theme.text }}
        numberOfLines={1}
      >
        {activity.name}
      </Text>

      <TouchableOpacity
        onPress={onUnarchive}
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.background }}
      >
        <HugeiconsIcon
          icon={ArchiveRestoreIcon}
          size={20}
          color={theme.primary}
        />
      </TouchableOpacity>
    </View>
  );
}
