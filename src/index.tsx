import React from "react";
import { createRoot } from "react-dom/client";
import App from "~/components/App/App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { theme } from "~/theme";
import axios from "axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false, staleTime: Infinity },
  },
});

if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser");
  worker.start({ onUnhandledRequest: "bypass" });
}

const container = document.getElementById("app");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

axios.interceptors.response.use(
  response => response,
  error => {
    const { response, request, message } = error;

    if (response) {
      const statusMessages: { [key: number]: string } = {
        401: "401 - Unauthorized",
        403: "403 - Access Denied error"
      };

      const alertMessage = statusMessages[response.status as number];
      if (alertMessage) {
        console.log(alertMessage.split(' - ')[1].toLowerCase() + " error");
        alert(alertMessage);
      } else {
        console.log("Error", message);
      }
    } else if (request) {
      console.log("No response was received");
    } else {
      console.log("Error setting up request");
    }

    return Promise.reject(error);
  }
);
