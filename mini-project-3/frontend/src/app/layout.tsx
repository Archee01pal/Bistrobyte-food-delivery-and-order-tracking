import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { Navbar } from '@/components/navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'BistroByte - Food Delivery',
  description: 'Order food from local restaurants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-slate-900">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}