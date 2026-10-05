import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950">
      <Text className="text-3xl font-bold text-white">
        Hello!
      </Text>
      <Text className="mt-2 text-lg text-slate-400">
        It works 🎉
      </Text>
    </View>
  );
}