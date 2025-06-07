"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
            retry: (failureCount, error: unknown) => {
              // 4xx errors should not be retried
              if (error && typeof error === "object" && "response" in error) {
                const errorWithResponse = error as { response?: { status?: number } };
                if (
                  errorWithResponse.response?.status &&
                  errorWithResponse.response.status >= 400 &&
                  errorWithResponse.response.status < 500
                ) {
                  return false;
                }
              }

              // 401 Unauthorized errors should not be retried
              if (error && typeof error === "object" && "message" in error) {
                const errorWithMessage = error as { message: string };
                if (errorWithMessage.message.includes("401") || errorWithMessage.message.includes("Unauthorized")) {
                  return false;
                }
              }

              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: false,
            // Global error handling for mutations
            onError: (error) => {
              console.error("Mutation error:", error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
