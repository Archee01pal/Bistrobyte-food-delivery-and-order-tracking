import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { NotificationProvider } from '@/context/notification-context';
import { Navbar } from '@/components/navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'BistroByte - Food Delivery',
  description: 'Order food from local restaurants and track your orders in real time',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-culinary-pattern min-h-screen text-slate-900 antialiased">
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <Navbar />
              <main>{children}</main>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}