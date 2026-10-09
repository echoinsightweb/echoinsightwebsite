import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 5 requests per 10 seconds
const ratelimit = process.env.UPSTASH_REDIS_REST_URL 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "10 s"),
      analytics: true,
    }) 
  : null;

export default withAuth(
  async function middleware(req) {
    const path = req.nextUrl.pathname;
    
    // Apply rate limiting to specific public API routes
    if (path.startsWith("/api/enquiries") || path.startsWith("/api/appointments") || path.startsWith("/api/reschedule/request")) {
      if (ratelimit) {
        const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
        const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
        
        if (!success) {
          return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const path = req.nextUrl.pathname;
        
        // If attempting to access the dashboard or any protected admin route
        if (path.startsWith("/admin") && path !== "/admin/login") {
          const allowedEmails = [
            "ridhi.mentalhealthpractitioner@gmail.com",
            "echoinsightsupport@gmail.com"
          ];
          return !!token && !!token.email && allowedEmails.includes(token.email);
        }

        // Allow all other paths
        return true;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/enquiries", "/api/appointments", "/api/reschedule/request"],
};
