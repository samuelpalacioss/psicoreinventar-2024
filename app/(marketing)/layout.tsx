import Navbar from '@/components/navbar';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={``}>
      <Navbar />
      {children}
    </div>
  );
}
