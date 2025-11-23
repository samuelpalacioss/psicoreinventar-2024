import Navbar from "@/components/main-nav";
import { marketingConfig } from "@/config/marketing";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";
import SimpleNav from "@/components/simple-nav";
export default function TherapistDemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={``}>
      <SimpleNav backHref="/find" backLabel="Back to therapists" />

      {children}
      <Footer />
    </div>
  );
}
