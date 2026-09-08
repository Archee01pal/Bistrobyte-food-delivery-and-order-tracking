import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { Navbar } from '@/components/navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'BistroByte - Food Delivery',
  description: 'Order food from your favorite local restaurants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-slate-900">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}