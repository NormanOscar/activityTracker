import { useContext, useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { useTheme } from "@/hooks/use-theme";
import { AuthContext } from "@/utils/authContext";
import { Palette } from "@/constants/colors";
import { updateCategory } from "@/services/categoryService";
import type { Category } from "@/models/Category";

type EditCategoryModalProps = {
  category: Category | null;
  onClose: () => void;
  onSaved?: (category: Category) => void;
  onRequestDelete: (category: Category) => void;
};

export function EditCategoryModal({ category, onClose, onSaved, onRequestDelete }: EditCategoryModalProps) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!category) return;
    setName(category.name);
    setError("");
  }, [category]);

  const canSave = name.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!user || !category || !name.trim()) return;

    setSaving(true);
    setError("");
    try {
      await updateCategory(user.uid, category.id, name.trim());
      onSaved?.({ ...category, name: name.trim() });
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={!!category} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-black/50 px-6">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl p-5"
          style={{ backgroundColor: theme.modalBackground }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold" style={{ color: theme.text }}>
              Edit Category
            </Text>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.surface }}
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
                placeholder="e.g. Fitness"
                placeholderTextColor={theme.secondaryText}
                className="rounded-xl border px-4 py-3"
                style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }}
              />
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

            <Pressable onPress={() => category && onRequestDelete(category)} className="items-center rounded-xl py-3">
              <Text className="font-semibold" style={{ color: Palette.danger }}>
                Delete
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
