import { useState } from "react";
import { Modal, Platform, Pressable, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useTheme } from "@/hooks/use-theme";
import { useIsDark } from "@/hooks/use-is-dark";

type DateFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
};

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DateField({ value, onChange }: DateFieldProps) {
  const theme = useTheme();
  const isDark = useIsDark();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="rounded-xl border px-4 py-3"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <Text className="font-semibold" style={{ color: theme.text }}>
          {formatDate(value)}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 items-center justify-center bg-black/50 px-3"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl px-2 py-4"
            style={{ backgroundColor: theme.modalBackground }}
          >
            <DateTimePicker
              value={value}
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              themeVariant={isDark ? "dark" : "light"}
              onValueChange={(_event, selected) => {
                onChange(selected);
                if (Platform.OS === "android") setOpen(false);
              }}
              onDismiss={() => setOpen(false)}
            />

            <Pressable
              onPress={() => setOpen(false)}
              className="mx-2 mt-3 items-center rounded-xl py-3"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="font-semibold" style={{ color: "#FFFFFF" }}>
                Done
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
