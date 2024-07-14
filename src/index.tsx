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

const handleImport = async () => {
  const authorization_token = localStorage.getItem('authorization_token');

  const config = () => {
    if (authorization_token) {
      return {
        headers: {
          'Authorization': `Basic ${authorization_token}`
        },
        params: {
          name: encodeURIComponent('products.csv'),
        }
      }
    } else {
      return {
        params: {
          name: encodeURIComponent('products.csv'),
        }
      }
    }
  }

  try {
    const response = await axios.get('https://2jpg5wfxt7.execute-api.eu-central-1.amazonaws.com/prod/import', config());

    if (response.status === 401) {
      alert('Authorization header not provided');
    } else if (response.status === 403) {
      alert('Access denied');
    } else {
      console.log('Import successful:', response.data);
    }
  } catch (error: any) {
    console.log(error);
    if (error.response) {
      if (error.response.status === 401) {
        alert('Authorization header not provided (401 Unauthorized)');
      } else if (error.response.status === 403) {
        alert('Access denied (403 Forbidden)');
      } else {
        console.error('Error importing:', error.response.data);
      }
    } else if (error.request) {
      console.error('Error importing: No response received', error.request);
    } else {
      console.error('Error importing:', error.message);
    }
  }
};

handleImport();