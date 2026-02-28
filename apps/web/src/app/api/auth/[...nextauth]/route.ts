// NextAuth route handler
// Google provider, domain restrict to @goa.bits-pilani.ac.in

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
