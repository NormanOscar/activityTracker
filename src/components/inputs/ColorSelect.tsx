import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import type { Color } from "@/models/Colors";
import { ACTIVITY_COLORS, NO_COLOR_ID } from "@/constants/activityColors";
import { useTheme } from "@/hooks/use-theme";
import { SearchSelect } from "./SearchSelect";

type ColorSelectProps = {
  value: Color | null;
  onChange: (color: Color) => void;
};

export function ColorSelect({ value, onChange }: ColorSelectProps) {
  const theme = useTheme();

  const swatchStyle = (color: Color) =>
    color.id === NO_COLOR_ID ? { backgroundColor: theme.noColorBackground } : { backgroundColor: color.hex };

  return (
    <SearchSelect<Color>
      items={ACTIVITY_COLORS}
      value={value}
      onChange={onChange}
      getKey={(color) => color.id}
      getLabel={(color) => color.name}
      placeholder="Select a color"
      searchPlaceholder="Search colors..."
      title="Color"
      numColumns={3}
      squareTrigger
      renderTrigger={(color) => {
        // No selection yet reads the same as the "No color" option itself —
        // a blank theme.background circle looked like a rendering glitch
        // rather than a deliberate empty state.
        const isNoColor = !color || color.id === NO_COLOR_ID;
        return (
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: isNoColor ? theme.noColorBackground : color.hex }}
          >
            {isNoColor && <HugeiconsIcon icon={Cancel01Icon} size={26} color={theme.secondaryText} />}
          </View>
        );
      }}
      renderItem={(color, selected) => (
        <View className="items-center gap-2 rounded-xl p-3">
          <View
            className="h-20 w-20 items-center justify-center rounded-full"
            style={{
              ...swatchStyle(color),
              borderWidth: selected ? 3 : 0,
              borderColor: theme.primary,
            }}
          >
            {color.id === NO_COLOR_ID && (
              <HugeiconsIcon icon={Cancel01Icon} size={32} color={theme.secondaryText} />
            )}
          </View>
          <Text className="text-sm" style={{ color: theme.text }}>
            {color.name}
          </Text>
        </View>
      )}
    />
  );
}
