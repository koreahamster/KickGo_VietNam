import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

type AppQueryProviderProps = {
  children: React.ReactNode;
};

export function AppQueryProvider({ children }: AppQueryProviderProps): JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 15 * 1000,
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}