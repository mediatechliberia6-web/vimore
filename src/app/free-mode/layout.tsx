import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ViMore — Free Mode',
  description: 'ViMore Free Mode: text-only feed optimised for low-data mobile networks.',
};

export default function FreeModeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
