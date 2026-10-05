import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useTheme } from "@/hooks/use-theme";
import { useIsDark } from "@/hooks/use-is-dark";

const PANEL_OFFSET = -340;

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

type DateHeaderProps = {
  date: Date;
  onChangeDate: (date: Date) => void;
  rightAccessory?: ReactNode;
};

export function DateHeader({ date, onChangeDate, rightAccessory }: DateHeaderProps) {
  const theme = useTheme();
  const isDark = useIsDark();
  const [pickerOpen, setPickerOpen] = useState(false);
  const translateY = useRef(new Animated.Value(PANEL_OFFSET)).current;
  const isToday = isSameDay(date, new Date());

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: pickerOpen ? 0 : PANEL_OFFSET,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [pickerOpen, translateY]);

  return (
    <View className="flex-row items-center justify-between px-4 py-5">
      <View className="items-start justify-center">
        {!isToday && (
          <TouchableOpacity
            onPress={() => onChangeDate(new Date())}
            className="rounded-full border px-6 py-3"
            style={{ borderColor: theme.border, backgroundColor: theme.surface }}
          >
            <Text className="text-base font-semibold" style={{ color: theme.text }}>
              Today
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {rightAccessory}

      {/* Positioned absolutely so it centers on the row's full width, independent of
          the today-button and rightAccessory, which aren't the same width as each other. */}
      <View
        pointerEvents="box-none"
        className="absolute inset-0 items-center justify-center"
      >
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => onChangeDate(addDays(date, -1))} className="p-1">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPickerOpen(true)}
            className="rounded-full border px-6 py-3"
            style={{ borderColor: theme.border, backgroundColor: theme.surface }}
          >
            <Text className="text-base font-semibold" style={{ color: theme.text }}>
              {isToday ? "Today" : formatDate(date)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onChangeDate(addDays(date, 1))} className="p-1">
            <HugeiconsIcon icon={ArrowRight01Icon} size={28} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="none"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setPickerOpen(false)}>
          <SafeAreaProvider>
            <SafeAreaView edges={["top"]}>
              <Animated.View style={{ transform: [{ translateY }] }}>
                <Pressable
                  onPress={(e) => e.stopPropagation()}
                  className="mx-4 mt-2 rounded-2xl border p-3"
                  style={{ borderColor: theme.border, backgroundColor: theme.surface }}
                >
                  <DateTimePicker
                    value={date}
                    display={Platform.OS === "ios" ? "inline" : "calendar"}
                    themeVariant={isDark ? "dark" : "light"}
                    onValueChange={(_event, selected) => {
                      onChangeDate(selected);
                      if (Platform.OS === "android") setPickerOpen(false);
                    }}
                    onDismiss={() => setPickerOpen(false)}
                  />
                </Pressable>
              </Animated.View>
            </SafeAreaView>
          </SafeAreaProvider>
        </Pressable>
      </Modal>
    </View>
  );
}
