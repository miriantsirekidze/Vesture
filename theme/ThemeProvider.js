import React, { createContext, useContext } from "react";
import { observer } from "@legendapp/state/react";
import theme$ from "../stores/theme";
import { lightTheme, darkTheme } from "./theme";

const ThemeContext = createContext(darkTheme);

export const ThemeProvider = observer(({ children }) => {
  const theme = theme$.isDark.get() ? darkTheme : lightTheme;
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
});

export const useTheme = () => useContext(ThemeContext);
