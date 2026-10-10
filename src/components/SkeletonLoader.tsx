import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import type { DimensionValue } from "react-native";

import { useTheme } from "@/hooks/use-theme";

type SkeletonLoaderProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  className?: string;
};

export function SkeletonLoader({ width = "100%", height = 16, borderRadius = 8, className }: SkeletonLoaderProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={{ width, height, borderRadius, backgroundColor: theme.surface, opacity }}
    />
  );
}
