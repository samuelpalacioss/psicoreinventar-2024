import Navbar from "@/components/main-nav";
import { marketingConfig } from "@/config/marketing";
import Footer from "@/components/footer";
import { getServerSession } from "@/lib/auth/session";
import { Suspense } from "react";

async function MarketingNavbarWithSession() {
  const session = await getServerSession();

  return <Navbar items={marketingConfig.mainNav} user={session?.user ?? undefined} />;
}

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={``}>
      <header className="sticky top-0 bg-cream inset-x-0 z-50 ">
        <Suspense fallback={<Navbar items={marketingConfig.mainNav} />}>
          <MarketingNavbarWithSession />
        </Suspense>
      </header>

      {children}
      <Footer />
    </div>
  );
}
