import { handlers } from "@/src/lib/auth";
import { NextRequest } from "next/server";

// Lambda's internal request URL can be localhost; rewrite to the public domain
// so Auth.js generates correct OAuth callback URLs.
const SITE_URL = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://metaforgeis.com";

function withPublicUrl(req: NextRequest): NextRequest {
  const url = new URL(req.url);
  const site = new URL(SITE_URL);
  if (url.hostname === site.hostname) return req;
  url.protocol = site.protocol;
  url.hostname = site.hostname;
  url.port = site.port;
  return new NextRequest(url.toString(), req);
}

export async function GET(req: NextRequest) {
  return handlers.GET(withPublicUrl(req));
}

export async function POST(req: NextRequest) {
  return handlers.POST(withPublicUrl(req));
}
