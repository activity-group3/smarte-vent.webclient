// @ts-nocheck

import { BrowserRouter } from "react-router-dom";
import Router from "./router";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { getTheme } from "./theme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useMemo } from "react";
import { AuthProvider } from "./hooks/useAuth";

const App = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(() => getTheme(prefersDarkMode ? "dark" : "light"), [prefersDarkMode]);

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
