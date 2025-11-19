import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";

export default function SpecialistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
      <Footer />
      <Toaster />
    </div>
  );
}
