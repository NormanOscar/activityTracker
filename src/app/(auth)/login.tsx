import { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { AuthContext } from "@/utils/authContext";

export default function LoginScreen() {
  const { logIn } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      await logIn(email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View className="flex-1 bg-brand">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center px-8">
            <Text className="mb-8 text-center text-3xl font-bold text-white">Sign in</Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              className="mb-4 rounded-full bg-white/20 px-5 py-3 text-white"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.7)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              className="mb-4 rounded-full bg-white/20 px-5 py-3 text-white"
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgotPassword")}
              className="mb-2 self-end"
            >
              <Text className="text-sm text-white underline">Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              className="mt-4 items-center rounded-full bg-white py-3 shadow"
            >
              <Text className="text-lg font-semibold text-brand">Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/(auth)/signup")} className="mt-8">
              <Text className="text-center text-white">
                Don&apos;t have an account? <Text className="font-bold underline">Sign up</Text>
              </Text>
            </TouchableOpacity>

            {error ? <Text className="mt-4 text-center text-red-200">{error}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
