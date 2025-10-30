import Navbar from "@/components/main-nav";
import { marketingConfig } from "@/config/marketing";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={``}>
      <header className="sticky top-0 bg-cream inset-x-0 z-10 ">
        <Navbar items={marketingConfig.mainNav} />
      </header>

      {children}
      <Footer />

      <Toaster />
    </div>
  );
}
