"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface EmailBlock {
  id: string;
  type: "header" | "text" | "image" | "button" | "divider" | "spacer";
  content: string;
  url?: string;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg" | "xl";
}

function uid() { return `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

const MERGE_TAGS = [
  { tag: "{{first_name}}", desc: "Subscriber's first name" },
  { tag: "{{last_name}}", desc: "Subscriber's last name" },
  { tag: "{{full_name}}", desc: "Full name" },
  { tag: "{{email}}", desc: "Subscriber's email" },
  { tag: "{{phone}}", desc: "Phone number" },
  { tag: "{{unsubscribe_url}}", desc: "Unsubscribe link URL" },
  { tag: "{{unsubscribe_link}}", desc: "Styled unsubscribe link" },
  { tag: "{{site_url}}", desc: "Your site URL" },
];

const BLOCK_TYPES = [
  { type: "header", label: "Heading", icon: "H" },
  { type: "text", label: "Text", icon: "T" },
  { type: "image", label: "Image", icon: "◻" },
  { type: "button", label: "Button", icon: "▶" },
  { type: "divider", label: "Divider", icon: "—" },
  { type: "spacer", label: "Spacer", icon: "↕" },
] as const;

function CampaignComposerInner() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");

  const [token, setToken] = useState<string | null>(null);
  const [mode, setMode] = useState<"html" | "builder">("html");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [html, setHtml] = useState("");
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [targetTags, setTargetTags] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showMergeTags, setShowMergeTags] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [campaignId, setCampaignId] = useState<string | null>(editId);
  const [campaignStatus, setCampaignStatus] = useState("draft");
  const [subCount, setSubCount] = useState(0);

  useEffect(() => {
    const t = localStorage.getItem("sd-admin-token");
    if (!t) { router.push("/admin"); return; }
    setToken(t);
  }, [router]);

  const hdrs = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/subscribers", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setSubCount(data.filter((s: any) => s.status === "active" && s.email).length))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!editId || !token) return;
    fetch(`/api/campaigns?id=${editId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((c) => {
        setName(c.name); setSubject(c.subject); setPreheader(c.preheader || "");
        setMode(c.mode || "html"); setHtml(c.html || ""); setBlocks(c.blocks || []);
        setTargetTags(c.targetTags?.join(", ") || ""); setCampaignStatus(c.status);
      }).catch(() => {});
  }, [editId, token]);

  const addBlock = (type: EmailBlock["type"]) => {
    const b: EmailBlock = { id: uid(), type, content: type === "header" ? "Your headline" : type === "text" ? "Your text here" : type === "button" ? "Click Here" : "", align: "center", size: type === "header" ? "lg" : "md", url: type === "button" ? "https://" : undefined };
    setBlocks([...blocks, b]); setSelectedBlock(b.id);
  };
  const updateBlock = (id: string, u: Partial<EmailBlock>) => setBlocks(blocks.map((b) => b.id === id ? { ...b, ...u } : b));
  const removeBlock = (id: string) => { setBlocks(blocks.filter((b) => b.id !== id)); if (selectedBlock === id) setSelectedBlock(null); };
  const moveBlock = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id);
    if ((dir === -1 && i === 0) || (dir === 1 && i === blocks.length - 1)) return;
    const nb = [...blocks]; [nb[i], nb[i + dir]] = [nb[i + dir], nb[i]]; setBlocks(nb);
  };

  const saveDraft = async () => {
    if (!token) return; setSaving(true);
    const payload = { id: campaignId, name, subject, preheader, mode, html, blocks, targetTags: targetTags ? targetTags.split(",").map((t) => t.trim()).filter(Boolean) : [] };
    try {
      const res = await fetch("/api/campaigns", { method: campaignId ? "PUT" : "POST", headers: hdrs(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!campaignId) setCampaignId(data.id);
    } catch {} setSaving(false);
  };

  const sendCampaign = async () => {
    if (!campaignId || !token) return;
    if (!confirm(`Send "${subject}" to ${subCount} subscribers? Each gets their own individual email.`)) return;
    await saveDraft(); setSending(true);
    try {
      const res = await fetch("/api/campaigns/send", { method: "POST", headers: hdrs(), body: JSON.stringify({ campaignId }) });
      setSendResult(await res.json()); setCampaignStatus("sent");
    } catch { setSendResult({ error: "Send failed" }); } setSending(false);
  };

  if (!token) return null;
  const inp = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors";
  const selected = blocks.find((b) => b.id === selectedBlock);

  // Preview HTML — replace merge tags with sample data
  const previewHtml = (mode === "html" ? html : "")
    .replace(/\{\{first_name\}\}/gi, "Jordan")
    .replace(/\{\{last_name\}\}/gi, "Smith")
    .replace(/\{\{full_name\}\}/gi, "Jordan Smith")
    .replace(/\{\{email\}\}/gi, "jordan@example.com")
    .replace(/\{\{phone\}\}/gi, "(404) 555-1234")
    .replace(/\{\{site_url\}\}/gi, "https://sumndfrnt.com")
    .replace(/\{\{unsubscribe_url\}\}/gi, "#")
    .replace(/\{\{unsubscribe_link\}\}/gi, '<a href="#" style="color:rgba(255,255,255,0.25);">Unsubscribe</a>');

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-3 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-3">
          <a href="/admin" className="text-[13px] text-white/30 hover:text-white/60">← Back</a>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMergeTags(!showMergeTags)} className="text-[12px] text-white/40 border border-white/10 rounded-lg px-3 py-2 hover:text-white/70 hover:border-white/20 transition-all">
              {`{{ }}`} Tags
            </button>
            <button onClick={() => setShowPreview(!showPreview)} className="text-[12px] text-white/40 border border-white/10 rounded-lg px-3 py-2 hover:text-white/70 hover:border-white/20 transition-all">
              {showPreview ? "Editor" : "Preview"}
            </button>
            <button onClick={saveDraft} disabled={saving || !name || !subject} className="text-[12px] text-white/70 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 disabled:opacity-30">
              {saving ? "Saving..." : "Save Draft"}
            </button>
            {campaignStatus !== "sent" && (
              <button onClick={sendCampaign} disabled={sending || !name || !subject || (mode === "html" ? !html : blocks.length === 0)} className="text-[12px] font-medium text-black bg-white rounded-lg px-5 py-2 hover:opacity-90 disabled:opacity-30">
                {sending ? "Sending..." : `Send (${subCount})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Merge tags reference */}
      {showMergeTags && (
        <div className="border-b border-white/[0.04] px-6 py-4 bg-white/[0.01]">
          <div className="max-w-[800px] mx-auto">
            <p className="text-[11px] font-semibold text-white/30 tracking-wide mb-3">DYNAMIC MERGE TAGS — use in subject, HTML, or block content</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MERGE_TAGS.map((m) => (
                <button key={m.tag} onClick={() => navigator.clipboard.writeText(m.tag)} className="text-left bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 hover:bg-white/[0.06] transition-all">
                  <code className="text-[12px] text-white/60 font-mono">{m.tag}</code>
                  <p className="text-[10px] text-white/20 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/15 mt-2">Click to copy. Paste anywhere in your email.</p>
          </div>
        </div>
      )}

      {sendResult && (
        <div className={`px-6 py-3 text-center text-[13px] ${sendResult.error ? "bg-red-400/10 text-red-400/80" : "bg-green-400/10 text-green-400/80"}`}>
          {sendResult.error || `Sent! ${sendResult.sent} of ${sendResult.total} delivered individually.`}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {showPreview ? (
          <div className="flex-1 flex items-start justify-center py-8 px-6 overflow-y-auto">
            <div className="w-full max-w-[620px]">
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-t-2xl px-4 py-3">
                <div className="text-[11px] text-white/25">To: <span className="text-white/40">jordan@example.com</span></div>
                <div className="text-[11px] text-white/25">Subject: <span className="text-white/50">{subject.replace(/\{\{first_name\}\}/gi, "Jordan") || "—"}</span></div>
              </div>
              {mode === "html" ? (
                <iframe srcDoc={previewHtml} className="w-full bg-black border border-white/[0.08] border-t-0 rounded-b-2xl" style={{ minHeight: 600 }} sandbox="allow-same-origin" />
              ) : (
                <div className="bg-black border border-white/[0.08] border-t-0 rounded-b-2xl p-8">
                  {blocks.map((b) => <div key={b.id}>{renderPreview(b)}</div>)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-6 px-6">
            <div className="max-w-[700px] mx-auto">
              {/* Campaign details */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[11px] text-white/30 mb-1 block">CAMPAIGN NAME</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Internal name" className={inp} /></div>
                  <div><label className="text-[11px] text-white/30 mb-1 block">TARGET TAGS <span className="text-white/15">(blank = all)</span></label><input value={targetTags} onChange={(e) => setTargetTags(e.target.value)} placeholder="events, merch, vip" className={inp} /></div>
                </div>
                <div><label className="text-[11px] text-white/30 mb-1 block">SUBJECT LINE <span className="text-white/15">(supports merge tags)</span></label><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Hey {{first_name}}, something's coming" className={inp} /></div>
                <div><label className="text-[11px] text-white/30 mb-1 block">PREVIEW TEXT</label><input value={preheader} onChange={(e) => setPreheader(e.target.value)} placeholder="Shows after subject in inbox (optional)" className={inp} /></div>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-6">
                <button onClick={() => setMode("html")} className={`text-[13px] px-4 py-2 rounded-lg transition-all ${mode === "html" ? "bg-white text-black font-medium" : "bg-white/[0.04] text-white/30 hover:text-white/50"}`}>
                  Paste HTML
                </button>
                <button onClick={() => setMode("builder")} className={`text-[13px] px-4 py-2 rounded-lg transition-all ${mode === "builder" ? "bg-white text-black font-medium" : "bg-white/[0.04] text-white/30 hover:text-white/50"}`}>
                  Block Builder
                </button>
              </div>

              {/* HTML MODE */}
              {mode === "html" && (
                <div>
                  <label className="text-[11px] text-white/30 mb-2 block">PASTE YOUR HTML EMAIL CODE</label>
                  <p className="text-[11px] text-white/15 mb-3">Design in Figma → export HTML → paste below. Use {`{{merge_tags}}`} for personalization.</p>
                  <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder={`<!DOCTYPE html>\n<html>\n<head>...</head>\n<body>\n  <!-- Your email HTML from Figma -->\n  <h1>Hey {{first_name}},</h1>\n  ...\n  {{unsubscribe_link}}\n</body>\n</html>`}
                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-4 text-[13px] text-white/70 font-mono placeholder:text-white/10 outline-none focus:border-white/15 transition-colors resize-none"
                    rows={24}
                    spellCheck={false}
                  />
                  <p className="text-[11px] text-white/15 mt-2">
                    Each subscriber gets their own individual email — no CC/BCC. All links are automatically click-tracked.
                  </p>
                </div>
              )}

              {/* BUILDER MODE */}
              {mode === "builder" && (
                <>
                  <div className="border border-white/[0.06] rounded-2xl overflow-hidden bg-white/[0.01] mb-6">
                    {blocks.length === 0 ? (
                      <div className="py-20 text-center">
                        <p className="text-[14px] text-white/20">Add blocks to build your email</p>
                      </div>
                    ) : blocks.map((block) => (
                      <div key={block.id} onClick={() => setSelectedBlock(block.id === selectedBlock ? null : block.id)} className="relative group cursor-pointer transition-all px-6 py-1" style={{ outline: selectedBlock === block.id ? "2px solid rgba(255,255,255,0.15)" : "none", background: selectedBlock === block.id ? "rgba(255,255,255,0.02)" : "transparent" }}>
                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, -1); }} className="text-[10px] text-white/20 hover:text-white/50 bg-white/[0.05] rounded px-1.5 py-0.5">↑</button>
                          <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 1); }} className="text-[10px] text-white/20 hover:text-white/50 bg-white/[0.05] rounded px-1.5 py-0.5">↓</button>
                          <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="text-[10px] text-white/20 hover:text-red-400/60 bg-white/[0.05] rounded px-1.5 py-0.5">×</button>
                        </div>
                        {renderPreview(block)}
                      </div>
                    ))}
                  </div>

                  {/* Block toolbar */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {BLOCK_TYPES.map((bt) => (
                      <button key={bt.type} onClick={() => addBlock(bt.type)} className="flex items-center gap-1.5 text-[12px] text-white/30 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 hover:bg-white/[0.06] hover:text-white/50 transition-all">
                        <span className="text-[11px] font-mono">{bt.icon}</span>{bt.label}
                      </button>
                    ))}
                  </div>

                  {/* Properties */}
                  {selected && (
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-6">
                      <h4 className="text-[12px] font-semibold text-white/50 capitalize mb-4">{selected.type} Properties</h4>
                      {(selected.type === "header" || selected.type === "text") && (
                        <textarea value={selected.content} onChange={(e) => updateBlock(selected.id, { content: e.target.value })} rows={selected.type === "text" ? 4 : 2} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[13px] text-white outline-none focus:border-white/15 resize-none mb-3" />
                      )}
                      {selected.type === "button" && (<>
                        <input value={selected.content} onChange={(e) => updateBlock(selected.id, { content: e.target.value })} placeholder="Button text" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[13px] text-white outline-none focus:border-white/15 mb-3" />
                        <input value={selected.url || ""} onChange={(e) => updateBlock(selected.id, { url: e.target.value })} placeholder="https://..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[13px] text-white outline-none focus:border-white/15 mb-3" />
                      </>)}
                      {selected.type === "image" && (
                        <input value={selected.content} onChange={(e) => updateBlock(selected.id, { content: e.target.value })} placeholder="Image URL" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[13px] text-white outline-none focus:border-white/15 mb-3" />
                      )}
                      <div className="flex gap-4">
                        {selected.type !== "divider" && (
                          <div className="flex gap-1">{["sm","md","lg","xl"].map((s) => (
                            <button key={s} onClick={() => updateBlock(selected.id, { size: s as any })} className={`text-[11px] px-2.5 py-1 rounded ${selected.size === s ? "bg-white text-black" : "bg-white/[0.04] text-white/30"}`}>{s.toUpperCase()}</button>
                          ))}</div>
                        )}
                        {!["divider","spacer"].includes(selected.type) && (
                          <div className="flex gap-1">{["left","center","right"].map((a) => (
                            <button key={a} onClick={() => updateBlock(selected.id, { align: a as any })} className={`text-[11px] px-2.5 py-1 rounded ${selected.align === a ? "bg-white text-black" : "bg-white/[0.04] text-white/30"}`}>{a[0].toUpperCase() + a.slice(1)}</button>
                          ))}</div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderPreview(block: EmailBlock) {
  const align = block.align || "center";
  switch (block.type) {
    case "header": { const s: Record<string,string> = { sm:"text-lg", md:"text-2xl", lg:"text-[32px]", xl:"text-[42px]" }; return <div className={`py-2 ${s[block.size||"lg"]} font-bold text-white leading-tight tracking-tight`} style={{textAlign:align}}>{block.content}</div>; }
    case "text": { const s: Record<string,string> = { sm:"text-[13px] text-white/30", md:"text-[16px] text-white/55", lg:"text-[18px] text-white/65", xl:"text-[20px] text-white/70" }; return <div className={`py-1.5 ${s[block.size||"md"]} leading-relaxed whitespace-pre-wrap`} style={{textAlign:align}}>{block.content}</div>; }
    case "image": { const w: Record<string,string> = { sm:"80px", md:"200px", lg:"400px", xl:"100%" }; return <div className="py-3" style={{textAlign:align}}><img src={block.content||"/logo-512.png"} alt="" style={{width:w[block.size||"md"],maxWidth:"100%",borderRadius:8,display:"inline-block"}} /></div>; }
    case "button": return <div className="py-4" style={{textAlign:align}}><span className="inline-block bg-white text-black font-semibold text-[15px] px-8 py-3.5 rounded-full">{block.content}</span></div>;
    case "divider": return <div className="py-4"><hr className="border-white/[0.06]" /></div>;
    case "spacer": { const h: Record<string,string> = { sm:"16px", md:"32px", lg:"48px", xl:"64px" }; return <div style={{height:h[block.size||"md"]}} />; }
    default: return null;
  }
}

export default function CampaignComposer() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CampaignComposerInner />
    </Suspense>
  );
}
