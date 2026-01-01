import Navbar from "@/components/main-nav";
import { marketingConfig } from "@/config/marketing";
import Footer from "@/components/footer";
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={``}>
      <header className="sticky top-0 bg-cream inset-x-0 z-50 ">
        <Navbar items={marketingConfig.mainNav} />
      </header>

      {children}
      <Footer />
    </div>
  );
}
