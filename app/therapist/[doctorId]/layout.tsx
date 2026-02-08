import Footer from "@/components/footer";
import SimpleNav from "@/components/simple-nav";
export default function TherapistLayout({
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
