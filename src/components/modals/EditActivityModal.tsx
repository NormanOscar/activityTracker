import { useContext, useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { useTheme } from "@/hooks/use-theme";
import { AuthContext } from "@/utils/authContext";
import { Palette } from "@/constants/colors";
import { ColorSelect } from "@/components/inputs/ColorSelect";
import { IconSelect } from "@/components/inputs/IconSelect";
import { updateActivity } from "@/services/activityService";
import type { Activity } from "@/models/Activity";
import type { Color } from "@/models/Colors";

type EditActivityModalProps = {
  activity: Activity | null;
  onClose: () => void;
  onSaved?: (activity: Activity) => void;
  onRequestDelete: (activity: Activity) => void;
};

export function EditActivityModal({ activity, onClose, onSaved, onRequestDelete }: EditActivityModalProps) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [color, setColor] = useState<Color | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Re-syncs every time a (different) activity is opened for editing — Modal
  // keeps this mounted while hidden, so without this a previous edit's values
  // could still be sitting in state the next time it opens.
  useEffect(() => {
    if (!activity) return;
    setName(activity.name);
    setColor(activity.color);
    setIcon(activity.icon);
    setError("");
  }, [activity]);

  const canSave = name.trim().length > 0 && color !== null && icon !== null && !saving;

  const handleSave = async () => {
    if (!user || !activity || !color || !icon || !name.trim()) return;

    setSaving(true);
    setError("");
    try {
      const updated: Activity = { ...activity, name: name.trim(), color, icon };
      await updateActivity(user.uid, activity.id, { name: updated.name, color, icon });
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
                placeholder="e.g. Play Chess"
                placeholderTextColor={theme.secondaryText}
                className="rounded-xl border px-4 py-3"
                style={{ borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }}
              />
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

            <Pressable
              onPress={() => activity && onRequestDelete(activity)}
              className="items-center rounded-xl py-3"
            >
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
