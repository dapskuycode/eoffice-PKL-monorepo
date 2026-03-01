import { cookies, headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    
    // Get all cookies and convert to cookie header format
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await fetch(`${API_URL}/api/auth/get-session`, {
      headers: {
        Cookie: cookieHeader,
        ...Object.fromEntries(headersList.entries()),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}
