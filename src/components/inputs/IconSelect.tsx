import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import * as HugeIcons from "@hugeicons/core-free-icons";
const { Cancel01Icon } = HugeIcons;

import { getIconByName } from "@/utils/icons";
import { useTheme } from "@/hooks/use-theme";
import { SearchSelect } from "./SearchSelect";

const ICON_NAMES = Object.keys(HugeIcons).filter(
  (key) => key.endsWith("Icon") && !key.endsWith("FreeIcons")
);

const labelFromName = (name: string) => name.replace(/Icon$/, "");

type IconSelectProps = {
  value: string | null;
  onChange: (iconName: string) => void;
};

export function IconSelect({ value, onChange }: IconSelectProps) {
  const theme = useTheme();

  return (
    <SearchSelect<string>
      items={ICON_NAMES}
      value={value}
      onChange={onChange}
      getKey={(name) => name}
      getLabel={labelFromName}
      placeholder="Select an icon"
      searchPlaceholder="Search icons..."
      title="Icon"
      numColumns={3}
      maxResults={60}
      squareTrigger
      renderTrigger={(name) => {
        const icon = name ? getIconByName(name) : undefined;
        if (icon) return <HugeiconsIcon icon={icon} size={48} color={theme.text} />;
        // No icon chosen yet — show a placeholder rather than an empty box,
        // matching ColorSelect's "no selection" treatment.
        return <HugeiconsIcon icon={Cancel01Icon} size={26} color={theme.secondaryText} />;
      }}
      renderItem={(name, selected) => {
        const icon = getIconByName(name);
        return (
          <View
            className="items-center gap-2 rounded-xl p-4"
            style={{ backgroundColor: selected ? theme.surface : "transparent" }}
          >
            {icon && <HugeiconsIcon icon={icon} size={36} color={theme.text} />}
            <Text
              className="text-center text-xs"
              numberOfLines={1}
              style={{ color: theme.secondaryText }}
            >
              {labelFromName(name)}
            </Text>
          </View>
        );
      }}
    />
  );
}
