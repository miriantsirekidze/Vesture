import React, {useEffect} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./theme/ThemeProvider";
import { subscribeTrending } from "./utils/trending";
import AppTabs from "./navigation";

export default function App() {
  useEffect(() => {
    const unsubscribe = subscribeTrending();
    return unsubscribe;
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppTabs />
      </NavigationContainer>
    </ThemeProvider>
  );
}