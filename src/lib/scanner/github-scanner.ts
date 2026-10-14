import { scanFileForSecrets } from "./secrets";
import { auditSqlSchemaForRLS } from "./rls-parser";

export class GitHubRepoScanner {
  private static MAX_FILES_TO_SCAN = 20;

  public static parseRepoInput(input: string): { owner: string; repo: string } | null {
    const cleaned = input
      .trim()
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\.git$/i, "")
      .replace(/\/$/, "");

    const parts = cleaned.split("/");
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;

    return { owner: parts[0], repo: parts[1] };
  }

  public static async scanPublicRepo(repoInput: string) {
    const parsed = this.parseRepoInput(repoInput);
    if (!parsed) {
      throw new Error("Geçersiz GitHub adresi. Lütfen 'kullanici/repo-adi' formatında girin.");
    }

    const { owner, repo } = parsed;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "VibeShield-Scanner"
    };

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      throw new Error("GitHub reposu bulunamadı veya gizli (Private) durumda.");
    }
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers }
    );
    if (!treeRes.ok) {
      throw new Error("Repo dosya ağacı okunamadı.");
    }
    const treeData = await treeRes.json();

    // HTML, JS, TS, Python, SQL ve ENV dosyalarını yakala
    const targetFiles = (treeData.tree || [])
      .filter((item: any) => {
        if (item.type !== "blob") return false;
        const p = item.path.toLowerCase();
        if (
          p.includes("node_modules/") ||
          p.includes(".next/") ||
          p.includes("dist/") ||
          p.endsWith("package-lock.json")
        ) {
          return false;
        }
        return (
          p.endsWith(".ts") ||
          p.endsWith(".tsx") ||
          p.endsWith(".js") ||
          p.endsWith(".jsx") ||
          p.endsWith(".html") ||
          p.endsWith(".py") ||
          p.endsWith(".sql") ||
          p.includes(".env")
        );
      })
      .slice(0, this.MAX_FILES_TO_SCAN);

    const findings: any[] = [];

    await Promise.all(
      targetFiles.map(async (file: any) => {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`;
        const contentRes = await fetch(rawUrl);
        if (!contentRes.ok) return;

        const content = await contentRes.text();

        if (file.path.toLowerCase().endsWith(".sql")) {
          const sqlFindings = auditSqlSchemaForRLS(content).map((f) => ({
            ...f,
            file: file.path
          }));
          findings.push(...sqlFindings);
        } else {
          findings.push(...scanFileForSecrets(file.path, content));
        }
      })
    );

    return {
      targetName: `${owner}/${repo}`,
      findings,
      scannedFileCount: targetFiles.length
    };
  }
}