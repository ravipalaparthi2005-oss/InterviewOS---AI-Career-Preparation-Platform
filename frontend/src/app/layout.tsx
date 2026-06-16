import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Providers from '../components/Providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'InterviewOS | AI-Powered Career Preparation Operating System',
  description: 'Conduct real-time voice & coding mock interviews, scan resume ATS match, map customized career milestones, and gain candidate analytics dashboards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="antialiased bg-black text-[#f8fafc]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
