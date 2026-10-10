import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { getDateKey } from "@/utils/dateKey";

export function useTodayDate(): Date {
  const [today, setToday] = useState(() => new Date());
  const lastKeyRef = useRef(getDateKey(today));

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;

      const now = new Date();
      const nowKey = getDateKey(now);
      if (nowKey !== lastKeyRef.current) {
        lastKeyRef.current = nowKey;
        setToday(now);
      }
    });

    return () => subscription.remove();
  }, []);

  return today;
}
