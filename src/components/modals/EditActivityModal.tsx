import { useContext, useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Cancel01Icon, StarIcon } from "@hugeicons/core-free-icons";

import { useTheme } from "@/hooks/use-theme";
import { AuthContext } from "@/utils/authContext";
import { Palette } from "@/constants/colors";
import { ColorSelect } from "@/components/inputs/ColorSelect";
import { IconSelect } from "@/components/inputs/IconSelect";
import { DateField } from "@/components/inputs/DateField";
import { CategorySelect } from "@/components/inputs/CategorySelect";
import { updateActivity } from "@/services/activityService";
import { startOfDay } from "@/utils/dateKey";
import type { Activity } from "@/models/Activity";
import type { Color } from "@/models/Colors";
import type { Category } from "@/models/Category";

type EditActivityModalProps = {
  activity: Activity | null;
  categories: Category[];
  onClose: () => void;
  onSaved?: (activity: Activity) => void;
  onRequestArchive: (activity: Activity) => void;
  onRequestDelete: (activity: Activity) => void;
};

export function EditActivityModal({
  activity,
  categories,
  onClose,
  onSaved,
  onRequestArchive,
  onRequestDelete,
}: EditActivityModalProps) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [color, setColor] = useState<Color | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [startDate, setStartDate] = useState(() => startOfDay(new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activity) return;
    setName(activity.name);
    setColor(activity.color);
    setIcon(activity.icon);
    setCategoryId(activity.categoryId ?? "");
    setIsFavorite(activity.isFavorite ?? false);
    setStartDate(activity.createdAt ?? startOfDay(new Date()));
    setError("");
  }, [activity]);

  const canSave = name.trim().length > 0 && color !== null && icon !== null && !saving;

  const handleSave = async () => {
    if (!user || !activity || !color || !icon || !name.trim()) return;

    setSaving(true);
    setError("");
    try {
      const createdAt = startOfDay(startDate);

      const wasFavorite = activity.isFavorite ?? false;
      const categoryStillExists = categories.some((c) => c.id === categoryId);
      const resolvedCategoryId = wasFavorite && !isFavorite && !categoryStillExists ? "" : categoryId;

      const updated: Activity = {
        ...activity,
        name: name.trim(),
        color,
        icon,
        categoryId: resolvedCategoryId,
        isFavorite,
        createdAt,
      };
      await updateActivity(user.uid, activity.id, {
        name: updated.name,
        color,
        icon,
        categoryId: resolvedCategoryId,
        isFavorite,
        createdAt,
      });
      onSaved?.(updated);
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to save activity");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={!!activity} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-black/50 px-6">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl p-5"
          style={{ backgroundColor: theme.modalBackground }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold" style={{ color: theme.text }}>
              Edit Activity
            </Text>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => setIsFavorite((prev) => !prev)}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.surface }}
              >
                <HugeiconsIcon
                  icon={StarIcon}
                  size={18}
                  color={isFavorite ? Palette.favorite : theme.secondaryText}
                />
              </Pressable>
              <Pressable
                onPress={onClose}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.surface }}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold" style={{ color: theme.secondaryText }}>
                Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Play Chess"
                placeholderTextColor={theme.secondaryText}
                className="rounded-xl border px-4 py-3"
                style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }}
              />
            </View>
            
            <View className="gap-2">
              <Text className="text-sm font-semibold" style={{ color: theme.secondaryText }}>
                Category
              </Text>
              <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold" style={{ color: theme.secondaryText }}>
                Start date
              </Text>
              <DateField value={startDate} onChange={setStartDate} />
            </View>

            <View className="flex-row justify-center gap-6">
              <View className="items-center gap-2">
                <Text className="text-sm font-semibold" style={{ color: theme.secondaryText }}>
                  Color
                </Text>
                <ColorSelect value={color} onChange={setColor} />
              </View>
              <View className="items-center gap-2">
                <Text className="text-sm font-semibold" style={{ color: theme.secondaryText }}>
                  Icon
                </Text>
                <IconSelect value={icon} onChange={setIcon} />
              </View>
            </View>

            {error ? <Text style={{ color: Palette.danger }}>{error}</Text> : null}

            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              className="mt-2 items-center rounded-xl py-3"
              style={{ backgroundColor: canSave ? theme.primary : theme.disabled }}
            >
              <Text className="font-semibold" style={{ color: canSave ? theme.text : theme.disabledText }}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </Pressable>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => activity && onRequestArchive(activity)}
                className="flex-1 items-center rounded-xl border py-3"
                style={{ borderColor: theme.border }}
              >
                <Text className="font-semibold" style={{ color: theme.text }}>
                  Archive
                </Text>
              </Pressable>

              <Pressable
                onPress={() => activity && onRequestDelete(activity)}
                className="flex-1 items-center rounded-xl py-3"
              >
                <Text className="font-semibold" style={{ color: Palette.danger }}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
