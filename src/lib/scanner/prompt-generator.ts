export function generateCursorFixPrompt(finding: any): string {
    if (finding.ruleId === "RLS_DISABLED") {
      return `Projemdeki Supabase veritabanında bulunan '${finding.table}' tablosunda Row Level Security (RLS) kapalı durumda. \nLütfen şu adımları içeren güvenli bir SQL migration kodu yaz:\n1. '${finding.table}' tablosu için RLS'i aktif et (ALTER TABLE ${finding.table} ENABLE ROW LEVEL SECURITY;).\n2. Sadece giriş yapmış kullanıcıların (auth.uid() = user_id) kendi verilerini okuyup güncelleyebileceği güvenli CREATE POLICY kurallarını oluştur.`;
    }
  
    if (finding.ruleId === "RLS_ALWAYS_TRUE") {
      return `Projemdeki '${finding.table}' tablosunda 'USING (true)' içeren aşırı izin verici bir RLS politikası bulundu. \nLütfen bu politikayı kaldırıp (DROP POLICY), sadece 'auth.uid() = user_id' kontrolü yapan güvenli bir RLS politikası ile değiştiren SQL migration kodunu yaz.`;
    }
  
    return `'${finding.file}' dosyasının ${finding.line}. satırında istemci tarafına sızmış kritik bir anahtar (${finding.title}) tespit edildi.\nLütfen bu kodu şu şekilde güvenli hale getir:\n1. Açık anahtarı koddan kaldır ve '.env.local' dosyasında güvenli bir değişkene taşı (kesinlikle NEXT_PUBLIC_ veya VITE_ ön eki kullanma).\n2. Bu API çağrısını doğrudan ön yüzde yapmak yerine '/app/api/...' altında güvenli bir Next.js Server Route oluştur ve ön yüzden oraya istek at.`;
  }