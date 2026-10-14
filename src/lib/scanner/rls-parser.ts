export function auditSqlSchemaForRLS(sqlContent: string) {
    const cleanSql = sqlContent
      .replace(/--.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");
  
    const tables = new Map<string, { tableName: string; rlsEnabled: boolean }>();
  
    // 1. CREATE TABLE ifadelerini yakala
    const createTableRegex =
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["']?(\w+)["']?\.)?["']?(\w+)["']?/gi;
    let match;
  
    while ((match = createTableRegex.exec(cleanSql)) !== null) {
      const schema = (match[1] || "public").toLowerCase();
      const tableName = match[2].toLowerCase();
      if (schema === "public") {
        tables.set(tableName, { tableName, rlsEnabled: false });
      }
    }
  
    // 2. ENABLE ROW LEVEL SECURITY ifadelerini yakala
    const enableRlsRegex =
      /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:["']?(\w+)["']?\.)?["']?(\w+)["']?\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
    while ((match = enableRlsRegex.exec(cleanSql)) !== null) {
      const schema = (match[1] || "public").toLowerCase();
      const tableName = match[2].toLowerCase();
      if (schema === "public" && tables.has(tableName)) {
        tables.get(tableName)!.rlsEnabled = true;
      }
    }
  
    const vulnerabilities: any[] = [];
  
    // 3. RLS tamamen unutulmuş tabloları raporla
    for (const [tableName, status] of tables.entries()) {
      if (!status.rlsEnabled) {
        vulnerabilities.push({
          ruleId: "RLS_DISABLED",
          title: `Supabase RLS Kapalı Tablo: public.${tableName}`,
          severity: "CRITICAL",
          table: `public.${tableName}`,
          file: "schema.sql",
          line: 1,
          explanation: `'public.${tableName}' tablosunda Satır Düzeyinde Güvenlik (RLS) tamamen kapalı! Ön yüzdeki Anon Key ile herkes bu tablodaki müşteri verilerini okuyabilir veya silebilir.`
        });
      }
    }
  
    // 4. YENİ: RLS açık olsa bile "USING (true)" ile herkese açık bırakılmış sahte politikaları yakala!
    const permissivePolicyRegex =
      /CREATE\s+POLICY\s+["']?([^"'\s]+)["']?\s+ON\s+(?:["']?(\w+)["']?\.)?["']?(\w+)["']?[\s\S]*?USING\s*\(\s*true\s*\)/gi;
  
    while ((match = permissivePolicyRegex.exec(cleanSql)) !== null) {
      const policyName = match[1];
      const tableName = match[3].toLowerCase();
      vulnerabilities.push({
        ruleId: "RLS_ALWAYS_TRUE",
        title: `Tehlikeli 'USING (true)' RLS Politikası: public.${tableName}`,
        severity: "HIGH",
        table: `public.${tableName}`,
        file: "schema.sql",
        line: 1,
        explanation: `'public.${tableName}' tablosundaki '${policyName}' politikasında 'USING (true)' kullanılmış! AI araçlarının sık yaptığı bu hata, RLS açık olsa bile tablodaki tüm verileri dış dünyaya tamamen açık hale getirir.`
      });
    }
  
    return vulnerabilities;
  }