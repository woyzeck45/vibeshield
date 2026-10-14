"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Lock,
  Copy,
  Check,
  Terminal,
  Flame,
  Sparkles,
  ArrowRight,
  EyeOff,
  FileCode,
  Database,
  ShieldCheck,
  Unlock,
  CheckCircle2
} from "lucide-react";

export interface Finding {
  ruleId: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  explanation: string;
  file?: string;
  line?: number;
  table?: string;
  maskedValue?: string;
  fixPrompt: string | null;
  isLocked: boolean;
}

interface SecurityReportProps {
  targetName: string;
  score: string;
  findings: Finding[];
  checkoutUrl?: string;
  onToggleProSim?: () => void;
  isProSim?: boolean;
}

export default function SecurityReportView({
  targetName = "kullanici/vibe-saas-app",
  score = "F",
  findings = [],
  checkoutUrl = "#paywall-checkout",
  onToggleProSim,
  isProSim = false
}: SecurityReportProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Sadece senin bilgisayarında (localhost) çalışırken geliştirici çubuğunu aktif et,
  // canlı sitede (vercel.app vb.) müşterilere karşı otomatik gizle!
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ) {
      setIsLocalhost(true);
    }
  }, []);

  const isClean = findings.length === 0;
  const criticalCount = findings.filter((f) => f.severity === "CRITICAL").length;
  const lockedCount = findings.filter((f) => f.isLocked).length;

  const handleCopyPrompt = (promptText: string, index: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* GELİŞTİRİCİ TEST BARI (Sadece localhost'ta ve açık bulunduğunda görünür!) */}
      {isLocalhost && !isClean && onToggleProSim && (
        <div className="flex items-center justify-between bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-4 py-3 text-xs">
          <span className="text-indigo-300 font-medium">
            🛠️ <strong>Geliştirici Modu (Sadece Localhost&apos;ta Görünür):</strong> Müşterinin ödeme öncesi ve sonrası ekranını test et:
          </span>
          <button
            onClick={onToggleProSim}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            {isProSim ? "Ücretsiz Görünüme Dön (Kilitle)" : "14$ Ödendi Simülasyonu (Kilidi Aç)"}
          </button>
        </div>
      )}

      {/* 1. ÜST DURUM BANNER'I (Temizse Yeşil, Tehlikeliyse Kırmızı!) */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 shadow-2xl ${
          isClean
            ? "border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 via-zinc-900 to-zinc-900 shadow-emerald-950/20"
            : "border-red-500/40 bg-gradient-to-b from-red-950/40 via-zinc-900 to-zinc-900 shadow-red-950/20"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            {isClean ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Canlıya Çıkış İçin Güvenli
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
                <Flame className="w-4 h-4" /> Canlıya Çıkış İçin Tehlikeli
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {targetName}
            </h2>

            {isClean ? (
              <p className="text-zinc-300 text-sm sm:text-base max-w-xl">
                Harika iş! Taranan dosyalarda istemci tarafına sızmış herhangi bir API anahtarı veya RLS kapalı Supabase tablosu{" "}
                <span className="text-emerald-400 font-semibold">tespit edilmedi.</span>
              </p>
            ) : (
              <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
                Projenizde{" "}
                <span className="text-red-400 font-semibold underline decoration-red-500/50">
                  {criticalCount > 0 ? `${criticalCount} kritik` : `${findings.length} önemli`} güvenlik açığı
                </span>{" "}
                tespit edildi. Kötü niyetli botlar bu açıkları kullanarak API bütçenizi sömürebilir veya müşteri veritabanınızı silebilir.
              </p>
            )}
          </div>

          <div
            className={`flex flex-col items-center justify-center bg-zinc-950/80 border rounded-xl p-4 min-w-[130px] text-center ${
              isClean ? "border-emerald-500/30" : "border-red-500/30"
            }`}
          >
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
              Güvenlik Skoru
            </span>
            <span
              className={`text-5xl font-black my-1 ${
                isClean ? "text-emerald-400" : "text-red-500"
              }`}
            >
              {score}
            </span>
            <span
              className={`text-[11px] font-medium ${
                isClean ? "text-emerald-400/80" : "text-red-400/80"
              }`}
            >
              {isClean ? "Sızıntı Bulunmadı" : "Acil Müdahale Şart"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. AÇIK BULGULAR LİSTESİ */}
      {!isClean && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-400 px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {lockedCount > 0
                ? `Ücretsiz Önizleme (1 / ${findings.length} Bulgu Açık)`
                : `Tüm Bulgular Açık (${findings.length} / ${findings.length})`}
            </span>
            <span className="text-zinc-500">Kanıtlanmış Zafiyet</span>
          </div>

          {findings
            .filter((f) => !f.isLocked)
            .map((finding, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-5 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 mt-0.5">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-red-500 text-white rounded uppercase">
                        {finding.severity}
                      </span>
                      <h3 className="text-lg font-bold text-white">{finding.title}</h3>
                    </div>
                    <p className="text-zinc-300 text-sm mt-1.5 leading-relaxed">
                      {finding.explanation}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {finding.file && (
                    <div className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-800/80 px-3.5 py-2.5 rounded-lg font-mono text-xs text-zinc-300">
                      <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">
                        Dosya: <strong className="text-white">{finding.file}</strong> (Satır: {finding.line})
                      </span>
                    </div>
                  )}
                  {finding.table && (
                    <div className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-800/80 px-3.5 py-2.5 rounded-lg font-mono text-xs text-zinc-300">
                      <Database className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="truncate">
                        Açık Tablo: <strong className="text-red-400">{finding.table}</strong>
                      </span>
                    </div>
                  )}
                  {finding.maskedValue && (
                    <div className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-800/80 px-3.5 py-2.5 rounded-lg font-mono text-xs text-zinc-300">
                      <Terminal className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="truncate">
                        Sızan Anahtar: <strong className="text-red-400">{finding.maskedValue}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {finding.fixPrompt && (
                  <div className="rounded-xl bg-zinc-950 border border-emerald-500/30 p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                        <Terminal className="w-4 h-4" />
                        <span>10 Saniyede Çözüm: Kopyalayıp Cursor veya Lovable sohbetine yapıştırın</span>
                      </div>
                      <button
                        onClick={() => handleCopyPrompt(finding.fixPrompt!, idx)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" /> Kopyalandı! Cursor&apos;a Yapıştır
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Cursor Fix Promptunu Kopyala
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-zinc-300 bg-zinc-900/90 p-3.5 rounded-lg overflow-x-auto whitespace-pre-wrap border border-zinc-800">
                      {finding.fixPrompt}
                    </pre>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* 3. KİLİTLİ BULGULAR VE 14$ PAYWALL KUTUSU */}
      {lockedCount > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400 px-1">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Gizlenen Kritik Bulgular ({lockedCount} Adet Daha Var)
            </span>
            <span className="text-red-400 animate-pulse">Veritabanı & API Riski Devam Ediyor</span>
          </div>

          <div className="space-y-4">
            {findings
              .filter((f) => f.isLocked)
              .map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-red-500/20 bg-zinc-900/60 p-6 space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded uppercase">
                          {item.severity}
                        </span>
                        <h3 className="text-base font-bold text-zinc-100">{item.title}</h3>
                      </div>
                      <p className="text-zinc-400 text-sm">{item.explanation}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-amber-500/30 shrink-0">
                      <EyeOff className="w-3.5 h-3.5" /> Konum Kilitli
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none pointer-events-none opacity-75">
                    <div className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800/60 px-3.5 py-2.5 rounded-lg font-mono text-xs">
                      <Database className="w-4 h-4 text-red-400" />
                      <span className="text-zinc-500">Tablo / Dosya:</span>
                      <span className="blur-[4px] text-white font-bold tracking-widest">
                        {item.table || item.file}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800/60 px-3.5 py-2.5 rounded-lg font-mono text-xs">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span className="text-zinc-500">Cursor Promptu:</span>
                      <span className="blur-[4px] text-emerald-400 font-bold">
                        ALTER TABLE public.users ENABLE RLS...
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden mt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" /> Tek Seferlik Ödeme • Abonelik Yok
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Kalan {lockedCount} Kritik Açığı ve Cursor Düzeltme Komutlarını Açın
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Saatlerce SQL dökümanı okumayın veya hangi dosyada anahtar unuttuğunuzu aramayın.{" "}
                  <strong className="text-white">7 Günlük Launch Pass</strong> ile tüm gizli dosya konumlarını açın ve kopyala-yapıştır komutlarla 2 dakikada projenizi koruma altına alın.
                </p>
              </div>

              <div className="w-full md:w-auto flex flex-col items-center bg-zinc-950/90 border border-zinc-800 p-5 rounded-xl min-w-[240px]">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Launch Pass (7 Gün)</span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-4xl font-black text-white">$14</span>
                  <span className="text-xs text-zinc-500">/ tek çekim</span>
                </div>
                <a
                  href={checkoutUrl}
                  onClick={(e) => {
                    // Canlı sitede gerçek ödeme sayfasına gider, sadece localhost'ta simülasyon yapar!
                    if (isLocalhost && onToggleProSim && checkoutUrl.includes("polar.sh/checkout/vibeshield-launch-pass")) {
                      e.preventDefault();
                      onToggleProSim();
                    }
                  }}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Tüm Raporun Kilidini Aç <ArrowRight className="w-4 h-4" />
                </a>
                <span className="text-[11px] text-zinc-500 mt-2">
                  Sınırsız yeniden tarama (Re-scan) dahildir
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}