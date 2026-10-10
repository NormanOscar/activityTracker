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

export default function ForgotPasswordScreen() {
  const { resetPassword } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
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
            <Text className="mb-6 text-center text-3xl font-bold text-white">Reset password</Text>

            {sent ? (
              <Text className="mb-6 text-center text-white">
                Check your email for a reset link.
              </Text>
            ) : (
              <>
                <Text className="mb-6 text-center text-white">
                  Enter your email and we'll send you a link to reset your password.
                </Text>

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

                <TouchableOpacity
                  onPress={handleReset}
                  disabled={submitting}
                  className="mt-4 items-center rounded-full bg-white py-3 shadow"
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  <Text className="text-lg font-semibold text-brand">
                    {submitting ? "Sending..." : "Send reset link"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={() => router.replace("/(auth)/login")} className="mt-8">
              <Text className="text-center font-bold text-white underline">Back to sign in</Text>
            </TouchableOpacity>

            {error ? <Text className="mt-4 text-center text-red-200">{error}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
