import { useContext, useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { useTheme } from "@/hooks/use-theme";
import { AuthContext } from "@/context/authContext";
import { Palette } from "@/constants/colors";
import { ColorSelect } from "@/components/inputs/ColorSelect";
import { IconSelect } from "@/components/inputs/IconSelect";
import { DateField } from "@/components/inputs/DateField";
import { CategorySelect } from "@/components/inputs/CategorySelect";
import { createActivity } from "@/services/activityService";
import { startOfDay } from "@/utils/dateKey";
import type { Color } from "@/models/Colors";
import type { Category } from "@/models/Category";

type CreateActivityModalProps = {
  visible: boolean;
  createdAt: Date;
  categories: Category[];
  onClose: () => void;
  onCreated?: (activityId: string) => void;
};

export function CreateActivityModal({
  visible,
  createdAt: defaultCreatedAt,
  categories,
  onClose,
  onCreated,
}: CreateActivityModalProps) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [color, setColor] = useState<Color | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState(defaultCreatedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setName("");
    setColor(null);
    setIcon(null);
    setCategoryId("");
    setStartDate(defaultCreatedAt);
    setError("");
  }, [visible, defaultCreatedAt]);

  const canSave = name.trim().length > 0 && color !== null && icon !== null && !saving;

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (!user || !color || !icon || !name.trim()) return;

    setSaving(true);
    setError("");
    try {
      const id = await createActivity(user.uid, {
        name: name.trim(),
        color,
        icon,
        categoryId: categoryId || null,
        createdAt: startOfDay(startDate),
      });
      onCreated?.(id);
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to create activity");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <Pressable onPress={handleClose} className="flex-1 items-center justify-center bg-black/50 px-6">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl p-5"
          style={{ backgroundColor: theme.modalBackground }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold" style={{ color: theme.text }}>
              New Activity
            </Text>
            <Pressable
              onPress={handleClose}
              disabled={saving}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.surface, opacity: saving ? 0.5 : 1 }}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} color={theme.text} />
            </Pressable>
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
                {saving ? "Saving..." : "Create"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
