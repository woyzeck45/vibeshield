"use client";

import { useState, useEffect } from "react";
import SecurityReportView, { Finding } from "@/components/SecurityReportView";
import ScannerInputForm from "@/components/ScannerInputForm";
import { CheckoutService } from "@/lib/payment/checkout-service";
import { Shield, RotateCcw } from "lucide-react";

const DEMO_CODE = `// src/components/ChatBox.tsx
"use client";
import { useState } from "react";

// VIBE CODER HATASI 1: İstemci kodunda unutulan OpenAI API Anahtarı!
const OPENAI_KEY = "sk-proj-98a7s6d8f76a8s7d6f87a6s8d7f6a8s7d6f87a6s8d";

// VIBE CODER HATASI 2: NEXT_PUBLIC ile tarayıcıya sızan Service Role Key!
const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

export default function ChatBox() {
  return <div>AI Sohbet Kutusu</div>;
}`;

const DEMO_SQL = `-- supabase/migrations/01_init.sql
-- VIBE CODER HATASI 3: Tablo oluşturuldu ama RLS açılmadı!
CREATE TABLE public.users_billing (
  id uuid primary key,
  email text,
  stripe_customer_id text
);

-- VIBE CODER HATASI 4: RLS açıldı ama AI 'USING (true)' yazarak tabloyu herkese açık bıraktı!
CREATE TABLE public.private_messages (
  id uuid primary key,
  sender_id uuid,
  content text
);
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_read" ON public.private_messages FOR SELECT USING (true);`;

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [sqlInput, setSqlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [report, setReport] = useState<{
    targetName: string;
    score: string;
    findings: Finding[];
  } | null>(null);
  const [isProSim, setIsProSim] = useState(false);

  // Sayfa açıldığında kullanıcının aktif Launch Pass'i var mı veya ödemeden mi döndü kontrol et
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      CheckoutService.activateLaunchPass();
      setIsProSim(true);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (CheckoutService.hasActiveLaunchPass()) {
      setIsProSim(true);
    }
  }, []);

  const runScan = async (
    proStatus = isProSim,
    customRepo = repoUrl,
    customCode = codeInput,
    customSql = sqlInput
  ) => {
    if (!customRepo.trim() && !customCode.trim() && !customSql.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: customRepo,
          codeInput: customCode,
          sqlInput: customSql,
          isProUser: proStatus
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Tarama sırasında bir hata oluştu.");
        return;
      }

      setReport(data);
    } catch {
      setErrorMsg("Sunucuya bağlanırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoAndScan = () => {
    setRepoUrl("");
    setCodeInput(DEMO_CODE);
    setSqlInput(DEMO_SQL);
    const hasPass = CheckoutService.hasActiveLaunchPass();
    setIsProSim(hasPass);
    runScan(hasPass, "", DEMO_CODE, DEMO_SQL);
  };

  const handleTogglePro = () => {
    const nextPro = !isProSim;
    if (nextPro) {
      CheckoutService.activateLaunchPass();
    } else {
      CheckoutService.clearLaunchPass();
    }
    setIsProSim(nextPro);
    runScan(nextPro);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* ÜST LOGO VE BAŞLIK */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                VibeShield{" "}
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  MVP v1.0
                </span>
                {isProSim && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                    ⚡ Launch Pass Aktif (7 Gün)
                  </span>
                )}
              </h1>
              <p className="text-xs text-zinc-400">
                Cursor, Lovable ve Bolt ile yazılan projeler için 30 saniyede güvenlik ve sızıntı tarayıcısı
              </p>
            </div>
          </div>

          {report && (
            <button
              onClick={() => setReport(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Yeni Tarama Yap
            </button>
          )}
        </div>

        {!report ? (
          <ScannerInputForm
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            codeInput={codeInput}
            setCodeInput={setCodeInput}
            sqlInput={sqlInput}
            setSqlInput={setSqlInput}
            loading={loading}
            errorMsg={errorMsg}
            onScan={() => runScan(isProSim)}
            onLoadDemo={handleLoadDemoAndScan}
          />
        ) : (
          <SecurityReportView
            targetName={report.targetName || "vibe-coder-project / production-audit"}
            score={report.score}
            findings={report.findings}
            checkoutUrl={CheckoutService.getCheckoutUrl()}
            onToggleProSim={handleTogglePro}
            isProSim={isProSim}
          />
        )}
      </div>
    </main>
  );
}