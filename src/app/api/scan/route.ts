import { NextResponse } from "next/server";
import { scanFileForSecrets } from "@/lib/scanner/secrets";
import { auditSqlSchemaForRLS } from "@/lib/scanner/rls-parser";
import { PaywallMasker } from "@/lib/scanner/paywall-masker";
import { GitHubRepoScanner } from "@/lib/scanner/github-scanner";

export async function POST(req: Request) {
  try {
    const { repoUrl, codeInput, sqlInput, isProUser = false } = await req.json();
    const rawFindings: any[] = [];
    let targetName = "vibe-coder-project / production-audit";

    // 1. Eğer GitHub Repo URL girildiyse GitHubRepoScanner sınıfını çalıştır
    if (repoUrl && repoUrl.trim() !== "") {
      const ghResult = await GitHubRepoScanner.scanPublicRepo(repoUrl);
      rawFindings.push(...ghResult.findings);
      targetName = ghResult.targetName;
    }

    // 2. Manuel kod veya SQL girildiyse ilgili tarayıcıları çalıştır
    if (codeInput) {
      rawFindings.push(...scanFileForSecrets("src/components/ClientApp.tsx", codeInput));
    }
    if (sqlInput) {
      rawFindings.push(...auditSqlSchemaForRLS(sqlInput));
    }

    // 3. PaywallMasker sınıfı ile sansürleme ve skor hesaplamasını yap
    const safeFindings = PaywallMasker.applyMasking(rawFindings, isProUser);
    const score = PaywallMasker.calculateScore(rawFindings);

    return NextResponse.json({ targetName, score, findings: safeFindings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Tarama sırasında bir hata oluştu." },
      { status: 400 }
    );
  }
}