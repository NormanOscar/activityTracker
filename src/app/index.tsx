import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-slate-950" edges={["top"]}>
      <Text className="text-3xl font-bold text-black dark:text-white">
        Hello!
      </Text>
      <Text className="mt-2 text-lg text-slate-600 dark:text-slate-400">
        It works 🎉
      </Text>
    </SafeAreaView>
  );
}