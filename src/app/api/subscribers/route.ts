import { NextRequest, NextResponse } from "next/server";
import { getSubscribers, saveSubscribers, addSubscriber, type Subscriber } from "@/lib/data";

function isAuthed(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth?.replace("Bearer ", "") === process.env.ADMIN_TOKEN;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const status = searchParams.get("status");
  const format = searchParams.get("format");

  let subs = await getSubscribers();
  if (tag) subs = subs.filter((s) => s.tags.includes(tag));
  if (status) subs = subs.filter((s) => s.status === status);

  if (format === "csv") {
    const header = "id,firstName,lastName,email,phone,tags,source,status,createdAt";
    const rows = subs.map((s) =>
      `${s.id},${s.firstName},${s.lastName},${s.email || ""},${s.phone || ""},"${s.tags.join(";")}",${s.source},${s.status},${s.createdAt}`
    );
    return new NextResponse([header, ...rows].join("\n"), {
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=subscribers.csv" },
    });
  }

  return NextResponse.json(subs);
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (Array.isArray(body)) {
    const subs = await getSubscribers();
    const existing = new Set(subs.map((s) => s.email?.toLowerCase()));
    let added = 0;
    for (const item of body) {
      const email = item.email?.toLowerCase().trim();
      if (email && existing.has(email)) continue;
      try {
        await addSubscriber({
          firstName: item.firstName || "",
          lastName: item.lastName || "",
          email: email || "",
          phone: item.phone?.replace(/\D/g, "") || undefined,
          tags: item.tags || ["imported"],
          source: "import",
        });
        if (email) existing.add(email);
        added++;
      } catch {}
    }
    return NextResponse.json({ imported: added });
  }

  const { firstName, lastName, email, phone, tags } = body;
  if (!email && !phone) return NextResponse.json({ error: "Email or phone required" }, { status: 400 });
  try {
    const sub = await addSubscriber({
      firstName: firstName || "",
      lastName: lastName || "",
      email: email?.toLowerCase().trim() || "",
      phone: phone?.replace(/\D/g, "") || undefined,
      tags: tags || [],
      source: "admin",
    });
    return NextResponse.json(sub, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const subs = await getSubscribers();
  const idx = subs.findIndex((s) => s.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (body.firstName !== undefined) subs[idx].firstName = body.firstName;
  if (body.lastName !== undefined) subs[idx].lastName = body.lastName;
  if (body.tags) subs[idx].tags = body.tags;
  if (body.email) subs[idx].email = body.email.toLowerCase().trim();
  if (body.phone) subs[idx].phone = body.phone.replace(/\D/g, "");
  await saveSubscribers(subs);
  return NextResponse.json(subs[idx]);
}

export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const subs = (await getSubscribers()).filter((s) => s.id !== id);
  await saveSubscribers(subs);
  return NextResponse.json({ deleted: id });
}
