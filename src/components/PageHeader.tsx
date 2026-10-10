import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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

type PageHeaderProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  date?: Date;
  onChangeDate?: (date: Date) => void;
  disabled?: boolean;
};

export function PageHeader({ left, center, right, date, onChangeDate, disabled = false }: PageHeaderProps) {
  const theme = useTheme();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const [pickerOpen, setPickerOpen] = useState(false);
  const translateY = useRef(new Animated.Value(PANEL_OFFSET)).current;

  const isDateMode = !!date && !!onChangeDate;
  const isToday = date ? isSameDay(date, new Date()) : false;

  useEffect(() => {
    if (!isDateMode) return;
    Animated.timing(translateY, {
      toValue: pickerOpen ? 0 : PANEL_OFFSET,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [pickerOpen, translateY, isDateMode]);

  const resolvedLeft = isDateMode
    ? !isToday && (
        <TouchableOpacity
          onPress={() => onChangeDate!(new Date())}
          disabled={disabled}
          className="rounded-full border px-6 py-2.5"
          style={{ borderColor: theme.border, backgroundColor: theme.surface, opacity: disabled ? 0.4 : 1 }}
        >
          <Text className="text-base font-semibold" style={{ color: theme.text }}>
            Today
          </Text>
        </TouchableOpacity>
      )
    : left;

  const resolvedCenter = isDateMode ? (
    <View className="flex-row items-center gap-4" style={{ opacity: disabled ? 0.4 : 1 }}>
      <TouchableOpacity onPress={() => onChangeDate!(addDays(date!, -1))} disabled={disabled} className="p-1">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color={theme.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setPickerOpen(true)}
        disabled={disabled}
        className="rounded-full border px-6 py-2.5"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <Text className="text-base font-semibold" style={{ color: theme.text }}>
          {isToday ? "Today" : formatDate(date!)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onChangeDate!(addDays(date!, 1))} disabled={disabled} className="p-1">
        <HugeiconsIcon icon={ArrowRight01Icon} size={28} color={theme.text} />
      </TouchableOpacity>
    </View>
  ) : (
    center
  );

  return (
    <>
      <View
        className="mb-4 flex-row items-center justify-between px-4 pb-3"
        style={{ backgroundColor: theme.card, paddingTop: insets.top + 12 }}
      >
        <View className="h-12 items-start justify-center">{resolvedLeft}</View>

        <View className="h-12 items-end justify-center">{right}</View>

        {resolvedCenter && (
          <View
            pointerEvents="box-none"
            className="absolute items-center justify-center"
            style={{ top: insets.top, left: 0, right: 0, bottom: 0 }}
          >
            {resolvedCenter}
          </View>
        )}
      </View>

      {isDateMode && (
        <Modal visible={pickerOpen} transparent animationType="none" onRequestClose={() => setPickerOpen(false)}>
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
                      value={date!}
                      display={Platform.OS === "ios" ? "inline" : "calendar"}
                      themeVariant={isDark ? "dark" : "light"}
                      onValueChange={(_event, selected) => {
                        onChangeDate!(selected);
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
      )}
    </>
  );
}
