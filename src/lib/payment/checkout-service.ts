export class CheckoutService {
    private static STORAGE_KEY = "vibeshield_launch_pass_expiry";
    private static PASS_DURATION_DAYS = 7;
  
    /**
     * Lemon Squeezy veya Polar.sh üzerinde oluşturacağın 14$ ürün linki.
     * (.env.local içinde NEXT_PUBLIC_CHECKOUT_URL tanımlıysa oradan çeker)
     */
    public static getCheckoutUrl(): string {
      return (
        process.env.NEXT_PUBLIC_CHECKOUT_URL ||
        "https://polar.sh/checkout/vibeshield-launch-pass?payment=success"
      );
    }
  
    /**
     * Kullanıcı 14$ ödeyip "?payment=success" ile geri döndüğünde
     * tarayıcısına 7 günlük Launch Pass (Pro) yetkisi tanımlar.
     */
    public static activateLaunchPass(): void {
      if (typeof window === "undefined") return;
      const expiryDate = Date.now() + this.PASS_DURATION_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(this.STORAGE_KEY, expiryDate.toString());
    }
  
    /**
     * Kullanıcının aktif bir 7 günlük Launch Pass'i olup olmadığını kontrol eder.
     */
    public static hasActiveLaunchPass(): boolean {
      if (typeof window === "undefined") return false;
      const rawExpiry = localStorage.getItem(this.STORAGE_KEY);
      if (!rawExpiry) return false;
  
      const expiryTime = parseInt(rawExpiry, 10);
      if (Date.now() > expiryTime) {
        localStorage.removeItem(this.STORAGE_KEY);
        return false;
      }
      return true;
    }
  
    /**
     * Geliştirici testi için aktif geçiş hakkını sıfırlar.
     */
    public static clearLaunchPass(): void {
      if (typeof window === "undefined") return;
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }