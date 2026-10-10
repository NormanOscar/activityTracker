import { useContext, useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { useTheme } from "@/hooks/use-theme";
import { AuthContext } from "@/utils/authContext";
import { Palette } from "@/constants/colors";
import { createCategory } from "@/services/categoryService";

type NewCategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated?: (categoryId: string) => void;
};

export function NewCategoryModal({ visible, onClose, onCreated }: NewCategoryModalProps) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setName("");
    setError("");
  }, [visible]);

  const canSave = name.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!user || !name.trim()) return;

    setSaving(true);
    setError("");
    try {
      const id = await createCategory(user.uid, name.trim());
      onCreated?.(id);
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-black/50 px-6">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl p-5"
          style={{ backgroundColor: theme.modalBackground }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold" style={{ color: theme.text }}>
              New Category
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
                {saving ? "Saving..." : "Create"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
