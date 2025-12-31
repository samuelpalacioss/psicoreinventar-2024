import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";
import SimpleNav from "@/components/simple-nav";

export default function GetMatchedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SimpleNav backHref="/" backLabel="Back to home" />
      {children}
      <Toaster />
      <Footer />
    </div>
  );
}
