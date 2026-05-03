import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col" style={{ backgroundColor: 'var(--cream)' }}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
