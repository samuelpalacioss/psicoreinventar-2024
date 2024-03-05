import Navbar from '@/components/main-nav';
import { marketingConfig } from '@/config/marketing';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={``}>
      <Navbar items={marketingConfig.mainNav} shadow={true} />
      {children}
    </div>
  );
}
