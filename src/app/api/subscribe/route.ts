import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/data";
import { fireAutomations } from "@/lib/automations";

// Sanitize — strip HTML tags, trim, limit length
function clean(s: string, maxLen: number = 100): string {
  return s.replace(/<[^>]*>/g, "").replace(/[<>"'`;]/g, "").trim().slice(0, maxLen);
}

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { firstName, lastName, email, phone, tag } = body;

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First and last name required" }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const cleanFirst = clean(firstName, 50);
  const cleanLast = clean(lastName, 50);
  const cleanEmail = email.toLowerCase().trim().slice(0, 254);
  const cleanPhone = phone ? phone.replace(/\D/g, "").slice(0, 15) : undefined;
  const cleanTag = clean(tag || "general", 30);

  // Reject if names are empty after sanitization
  if (!cleanFirst || !cleanLast) {
    return NextResponse.json({ error: "Valid name required" }, { status: 400 });
  }

  try {
    const sub = addSubscriber({
      firstName: cleanFirst,
      lastName: cleanLast,
      email: cleanEmail,
      phone: cleanPhone || undefined,
      tags: [cleanTag],
      source: "website",
    });

    // Fire automations async
    fireAutomations(sub, cleanTag).catch(() => {});

    // Return minimal response — never echo back user data
    return NextResponse.json({ message: "Subscribed" }, { status: 201 });
  } catch (err: any) {
    if (err.message === "Already subscribed") {
      // Don't confirm existence — same response for privacy
      return NextResponse.json({ message: "Subscribed" }, { status: 201 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
