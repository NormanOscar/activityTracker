import { Text, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";
import type { Category } from "@/models/Category";
import { SearchSelect } from "./SearchSelect";

type CategorySelectProps = {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
};

const NO_CATEGORY: Category = { id: "", name: "No category", sortOrder: -1 };

export function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  const theme = useTheme();
  const items = [NO_CATEGORY, ...categories];
  const selected = items.find((category) => category.id === value) ?? NO_CATEGORY;

  return (
    <SearchSelect<Category>
      items={items}
      value={selected}
      onChange={(category) => onChange(category.id)}
      getKey={(category) => category.id}
      getLabel={(category) => category.name}
      placeholder="Select a category"
      searchPlaceholder="Search categories..."
      title="Category"
      renderValue={(category) => (
        <Text className="font-semibold" style={{ color: theme.text }}>
          {category.name}
        </Text>
      )}
      renderItem={(category, selected) => (
        <View
          className="rounded-xl px-4 py-3"
          style={{ backgroundColor: selected ? theme.surface : "transparent" }}
        >
          <Text className="font-semibold" style={{ color: theme.text }}>
            {category.name}
          </Text>
        </View>
      )}
    />
  );
}
