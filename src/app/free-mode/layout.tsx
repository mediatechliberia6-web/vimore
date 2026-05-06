import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Mode | ViMore — Zero Data, Full Access',
  description:
    "ViMore Free Mode lets you browse, post, and connect without using mobile data. Designed for Liberia's network conditions by Media Tech Liberia.",
  openGraph: {
    title: 'ViMore Free Mode — Zero Data, Full Access',
    description:
      'Use ViMore without consuming your mobile data. Built for low-bandwidth Liberian networks.',
    url: 'https://vimore.cfd/free-mode',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512, alt: 'ViMore Free Mode' }],
  },
};

export default function FreeModeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
