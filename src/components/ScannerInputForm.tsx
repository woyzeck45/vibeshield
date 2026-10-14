"use client";

import { Sparkles, Code2, Database, Search, GitBranch, AlertCircle } from "lucide-react";

interface ScannerInputFormProps {
  repoUrl: string;
  setRepoUrl: (val: string) => void;
  codeInput: string;
  setCodeInput: (val: string) => void;
  sqlInput: string;
  setSqlInput: (val: string) => void;
  loading: boolean;
  errorMsg: string | null;
  onScan: () => void;
  onLoadDemo: () => void;
}

export default function ScannerInputForm({
  repoUrl,
  setRepoUrl,
  codeInput,
  setCodeInput,
  sqlInput,
  setSqlInput,
  loading,
  errorMsg,
  onScan,
  onLoadDemo
}: ScannerInputFormProps) {
  const isScanDisabled =
    loading || (!repoUrl.trim() && !codeInput.trim() && !sqlInput.trim());

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Başlık ve Demo Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Uygulamanız Canlıya Çıkmaya Gerçekten Hazır Mı?
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              GitHub repo adresinizi girin veya kodunuzu yapıştırın; unutulmuş API anahtarlarını ve açık kalan RLS tablolarını 10 saniyede yakalayın.
            </p>
          </div>
          <button
            onClick={onLoadDemo}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0 cursor-pointer transition"
          >
            <Sparkles className="w-4 h-4" /> Örnek Zafiyetli Kod Yükle & Test Et
          </button>
        </div>

        {/* Hata Mesajı Kutusu */}
        {errorMsg && (
          <div className="flex items-center gap-2.5 bg-red-950/50 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* GITHUB REPO URL GİRİŞİ */}
        <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/90 space-y-2">
          <label className="flex items-center justify-between text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" /> Otomatik GitHub Repo Taraması (Public)
            </span>
            <span className="text-[11px] text-emerald-400 font-mono normal-case">
              Dosyalar sunucuya kaydedilmez, RAM&apos;de taranır
            </span>
          </label>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Örn: https://github.com/kullanici/vibe-saas-projesi veya kullanici/repo"
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/60"
          />
        </div>

        {/* VEYA Ayırıcı Çizgi */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            VEYA MANUEL KOD / SQL YAPIŞTIRIN
          </span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* Manuel Kod ve SQL Alanları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              <Code2 className="w-4 h-4 text-emerald-400" /> 1. Ön Yüz / API Kodu (.tsx, .ts, .env)
            </label>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Şüphelendiğiniz React/Next.js kodunu buraya yapıştırın..."
              rows={8}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-zinc-200 focus:outline-none focus:border-red-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              <Database className="w-4 h-4 text-amber-400" /> 2. Supabase SQL Şeması (schema.sql)
            </label>
            <textarea
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="CREATE TABLE ifadelerinizin olduğu SQL kodunu buraya yapıştırın..."
              rows={8}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-zinc-200 focus:outline-none focus:border-red-500/50"
            />
          </div>
        </div>

        {/* Tarama Başlat Butonu */}
        <button
          onClick={onScan}
          disabled={isScanDisabled}
          className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer transition"
        >
          <Search className="w-4 h-4" />
          {loading ? "Güvenlik Açıkları Taranıyor..." : "Ücretsiz Güvenlik Taramasını Başlat"}
        </button>
      </div>
    </div>
  );
}