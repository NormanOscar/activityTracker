import { Modal, Pressable, Text, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable onPress={onCancel} className="flex-1 items-center justify-center bg-black/50 px-8">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl p-5"
          style={{ backgroundColor: theme.modalBackground }}
        >
          <Text className="mb-2 text-lg font-bold" style={{ color: theme.text }}>
            {title}
          </Text>
          {message && (
            <Text className="mb-4" style={{ color: theme.secondaryText }}>
              {message}
            </Text>
          )}

          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 items-center rounded-xl py-4"
              style={{ backgroundColor: theme.surface }}
            >
              <Text className="font-semibold" style={{ color: theme.text }}>
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="flex-1 items-center rounded-xl py-4"
              style={{ backgroundColor: confirmColor ?? theme.primary, opacity: loading ? 0.6 : 1 }}
            >
              <Text className="font-semibold text-white">{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
