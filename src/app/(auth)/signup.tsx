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

import { AuthContext } from "@/context/authContext";

export default function SignupScreen() {
  const { signUp } = useContext(AuthContext);
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (submitting) return;
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await signUp(email, password, `${firstName} ${lastName}`);
      router.replace("/(auth)/login");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-brand">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-8">
            <Text className="mb-8 text-center text-3xl font-bold text-white">Create account</Text>

            <TextInput
              placeholder="First name"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={firstName}
              onChangeText={setFirstName}
              className="mb-4 rounded-full bg-white/20 px-5 py-3 text-white"
            />
            <TextInput
              placeholder="Last name"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={lastName}
              onChangeText={setLastName}
              className="mb-4 rounded-full bg-white/20 px-5 py-3 text-white"
            />
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
              textContentType="newPassword"
              className="mb-4 rounded-full bg-white/20 px-5 py-3 text-white"
            />
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor="rgba(255,255,255,0.7)"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              className="mb-4 rounded-full bg-white/20 px-5 py-3 text-white"
            />

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={submitting}
              className="mt-4 items-center rounded-full bg-white py-3 shadow"
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              <Text className="text-lg font-semibold text-brand">
                {submitting ? "Signing up..." : "Sign up"}
              </Text>
            </TouchableOpacity>

            <View className="mt-8 flex-row justify-center">
              <Text className="text-white">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text className="font-bold text-white underline">Sign in</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text className="mt-4 text-center text-red-200">{error}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
