const SECRET_RULES = [
    {
      id: "OPENAI_API_KEY",
      name: "OpenAI API Anahtarı Sızıntısı",
      regex: /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/g,
      severity: "CRITICAL" as const,
      vibeImpact: "Botlar bu anahtarı saniyeler içinde çalıp OpenAI hesabınızdan binlerce dolarlık kredi harcayabilir."
    },
    {
      id: "GEMINI_GOOGLE_API_KEY",
      name: "Google Gemini / Firebase API Anahtarı",
      regex: /\bAIzaSy[A-Za-z0-9_-]{33}\b/g,
      severity: "CRITICAL" as const,
      vibeImpact: "İstemci kodunda unutulan Google/Gemini API anahtarı kotanızın saniyeler içinde tüketilmesine veya faturanızın şişmesine yol açar."
    },
    {
      id: "GROQ_API_KEY",
      name: "Groq AI API Anahtarı Sızıntısı",
      regex: /\bgsk_[A-Za-z0-9]{40,}\b/g,
      severity: "CRITICAL" as const,
      vibeImpact: "Groq API anahtarınız açıkta! Saldırganlar sizin hesabınız üzerinden sınırsız LLM isteği atabilir."
    },
    {
      id: "ANTHROPIC_API_KEY",
      name: "Anthropic (Claude) API Anahtarı Sızıntısı",
      regex: /\bsk-ant-api03-[A-Za-z0-9_-]{20,}\b/g,
      severity: "CRITICAL" as const,
      vibeImpact: "Claude API anahtarınız kaynak kodda unutulmuş. Kötü niyetli botlar tüm bakiyenizi dakikalar içinde sıfırlayabilir."
    },
    {
      id: "STRIPE_SECRET_KEY",
      name: "Stripe Gizli (Canlı) Anahtarı",
      regex: /\b(?:sk|rk)_live_[0-9a-zA-Z]{20,}\b/g,
      severity: "CRITICAL" as const,
      vibeImpact: "Saldırganlar tüm müşteri ödemelerinizi görebilir, iade yapabilir veya paranızı çekebilir."
    },
    {
      id: "SUPABASE_SERVICE_ROLE_ENV",
      name: "İstemciye Sızmış Supabase Service Role Anahtarı",
      regex: /\b(?:NEXT_PUBLIC_|VITE_|REACT_APP_)[A-Z0-9_]*SERVICE_ROLE[A-Z0-9_]*\b/g,
      severity: "CRITICAL" as const,
      vibeImpact: "Service Role anahtarı tüm RLS güvenlik kurallarını ezer geçer. Veritabanınızın tam kontrolü dışarıya açılmış durumda."
    },
    {
      id: "RESEND_API_KEY",
      name: "Resend E-posta API Anahtarı",
      regex: /\bre_[A-Za-z0-9_]{20,}\b/g,
      severity: "HIGH" as const,
      vibeImpact: "Alan adınız üzerinden binlerce sahte/spam e-posta gönderilebilir."
    }
  ];
  
  function maskSecret(secret: string) {
    if (secret.length <= 10) return "***MASKED***";
    return `${secret.slice(0, 7)}...${secret.slice(-4)}`;
  }
  
  export function scanFileForSecrets(filePath: string, fileContent: string) {
    const findings: any[] = [];
    const lines = fileContent.split("\n");
  
    lines.forEach((line, index) => {
      if (line.trim().startsWith("//") || line.includes("YOUR_API_KEY")) return;
  
      for (const rule of SECRET_RULES) {
        rule.regex.lastIndex = 0;
        const match = rule.regex.exec(line);
        if (match) {
          findings.push({
            ruleId: rule.id,
            title: rule.name,
            file: filePath,
            line: index + 1,
            maskedValue: maskSecret(match[0]),
            severity: rule.severity,
            explanation: rule.vibeImpact
          });
        }
      }
    });
  
    return findings;
  }