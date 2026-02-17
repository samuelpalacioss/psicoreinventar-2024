import Navbar from "@/components/main-nav";
import { marketingConfig } from "@/config/marketing";
import Footer from "@/components/footer";
import { getServerSession } from "@/lib/auth/session";
export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <div className={``}>
      <header className="sticky top-0 bg-cream inset-x-0 z-50 ">
        <Navbar items={marketingConfig.mainNav} user={session?.user ?? undefined} />
      </header>

      {children}
      <Footer />
    </div>
  );
}
