import { Modal, Pressable, Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Activity01Icon, FolderAddIcon } from "@hugeicons/core-free-icons";

import { useTheme } from "@/hooks/use-theme";

type AddMenuProps = {
  visible: boolean;
  onClose: () => void;
  onSelectActivity: () => void;
  onSelectCategory: () => void;
};

export function AddMenu({
  visible,
  onClose,
  onSelectActivity,
  onSelectCategory,
}: AddMenuProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <View
          className="absolute bottom-32 right-6 min-w-[200px] overflow-hidden rounded-2xl"
          style={{
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          <Pressable
            onPress={() => {
              onClose();
              onSelectActivity();
            }}
            className="flex-row items-center gap-4 px-6 py-5"
          >
            <HugeiconsIcon icon={Activity01Icon} size={26} color={theme.text} />
            <Text
              className="text-lg font-semibold"
              style={{ color: theme.text }}
            >
              Activity
            </Text>
          </Pressable>

          <View style={{ height: 1, backgroundColor: theme.border }} />

          <Pressable
            onPress={() => {
              onClose();
              onSelectCategory();
            }}
            className="flex-row items-center gap-4 px-6 py-5"
          >
            <HugeiconsIcon icon={FolderAddIcon} size={26} color={theme.text} />
            <Text
              className="text-lg font-semibold"
              style={{ color: theme.text }}
            >
              Category
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
