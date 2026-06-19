import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/*
 * Public routes are accessible without authentication.
 * Everything else (dashboard, admin, API proxies) requires a valid Clerk session.
 */
const isPublicRoute = createRouteMatcher([
  "/",            // landing page — always accessible
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
