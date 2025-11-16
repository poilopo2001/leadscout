import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://pumped-monkey-19.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
