import type { Metadata, Viewport } from 'next';
import {
  Playfair_Display,
  Cormorant_Garamond,
  Inter,
  Caveat,
  Dancing_Script,
  Sacramento,
  Homemade_Apple,
  Shadows_Into_Light,
  Patrick_Hand,
} from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  display: 'swap',
});

const dancingScript = Dancing_Script({
  variable: '--font-dancing',
  subsets: ['latin'],
  display: 'swap',
});

const sacramento = Sacramento({
  variable: '--font-sacramento',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const homemadeApple = Homemade_Apple({
  variable: '--font-homemade',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const shadowsIntoLight = Shadows_Into_Light({
  variable: '--font-shadows',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const patrickHand = Patrick_Hand({
  variable: '--font-patrick',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#F8E2EB',
};

export const metadata: Metadata = {
  title: 'Write a Love Letter — Some words deserve to be written down',
  description:
    'Write, customize, and send a heartfelt love letter to someone special. Choose handwriting styles, paper textures, polaroid photos, and send via cute link or email — completely free.',
  keywords: [
    'love letter',
    'romantic letter',
    'write love letter',
    'send love letter',
    'handwriting letter',
    'digital stationery',
  ],
  openGraph: {
    title: 'Write a Love Letter 💌',
    description:
      'Some words deserve to be written down. Create and send a personalized romantic letter for free.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${playfair.variable}
        ${cormorant.variable}
        ${inter.variable}
        ${caveat.variable}
        ${dancingScript.variable}
        ${sacramento.variable}
        ${homemadeApple.variable}
        ${shadowsIntoLight.variable}
        ${patrickHand.variable}
        h-full
      `}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FFFDF9] text-[#2B2320] selection:bg-[#F8E2EB] selection:text-[#2B2320]">
        {children}
      </body>
    </html>
  );
}
