import { createAuthClient } from "better-auth/react";

// export const authClient = createAuthClient();

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL ?? "http://localhost:3000",
  fetchOptions: {
    onError: (ctx) => {
      console.error("[auth-client error]", ctx.response?.status, ctx.error);
    }
  }
});
