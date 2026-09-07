import { auth } from "@/lib/auth/server";

export default auth.middleware({
  // Redirects unauthenticated users to the sign-in page
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    // Protected routes requiring authentication
    "/workspace/:path*",
  ],
};
