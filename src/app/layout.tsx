import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/lib/config";
import { getSiteSettings } from "@/lib/data";

const sourceCodePro = Source_Code_Pro({
  variable: "--font-main",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name || siteConfig.name;
  const siteDescription = settings?.site_description || siteConfig.description;

  return {
    title: {
      default: siteName,
      template: `%s — ${siteName}`,
    },
    description: siteDescription,
    metadataBase: new URL(siteConfig.url),
    icons: {
      icon: "/favicon.svg",
    },
    openGraph: {
      title: siteName,
      description: siteDescription,
      url: siteConfig.url,
      siteName: siteName,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
      locale: "es_CL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${sourceCodePro.variable} antialiased`}
      >
        <Navbar />
        <main className="min-h-screen" style={{ paddingTop: '96px' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
