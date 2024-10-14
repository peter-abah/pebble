import { Stack } from "expo-router";

import "../global.css";

export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
