import React from "react";
import { BrowserRouter } from "react-router-dom";
import Router from "./router";
import "./App.css";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import theme from "./theme";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
