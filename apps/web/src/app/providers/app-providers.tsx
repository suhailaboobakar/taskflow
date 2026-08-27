import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { applyTheme, useThemeStore } from "../../features/theme/theme.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000
    }
  }
});

export function AppProviders({ children }: React.PropsWithChildren): React.JSX.Element {
  const mode = useThemeStore((state) => state.mode);

  React.useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme(useThemeStore.getState().mode);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
