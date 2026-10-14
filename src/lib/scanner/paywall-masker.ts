import { generateCursorFixPrompt } from "./prompt-generator";

export class PaywallMasker {
  public static applyMasking(rawFindings: any[], isProUser: boolean) {
    return rawFindings.map((item, idx) => {
      const prompt = generateCursorFixPrompt(item);

      if (idx === 0 || isProUser) {
        return {
          ...item,
          fixPrompt: prompt,
          isLocked: false
        };
      }

      const isRlsIssue =
        item.ruleId === "RLS_DISABLED" || item.ruleId === "RLS_ALWAYS_TRUE";

      return {
        ruleId: item.ruleId,
        title: isRlsIssue
          ? "Supabase Veritabanı Güvenlik Açığı: public.████████"
          : item.title,
        severity: item.severity,
        explanation: isRlsIssue
          ? "Veritabanınızdaki gizli bir tabloda RLS kapalı veya 'USING (true)' ile tüm dünyaya açık bırakılmış! Herkes bu tablodaki müşteri verilerini okuyabilir."
          : item.explanation,
        file: "src/████████/██████.tsx",
        table: "public.████████",
        maskedValue: "sk-████████████",
        fixPrompt: null,
        isLocked: true
      };
    });
  }

  public static calculateScore(rawFindings: any[]): string {
    const hasCritical = rawFindings.some((f) => f.severity === "CRITICAL");
    if (hasCritical) return "F";
    if (rawFindings.length > 0) return "C";
    return "A+";
  }
}