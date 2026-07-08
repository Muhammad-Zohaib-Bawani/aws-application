import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profiles',
  description: 'Profiles with image upload — Next.js + Sequelize + S3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
