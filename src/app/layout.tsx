import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { FloatingMascots } from "@/components/FloatingMascots";
import { LocaleProvider } from "@/components/LocaleProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getDictionary, getLocale, localeToHtmlLang } from "@/lib/i18n/server";
import "./globals.css";

const display = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getLocale());
  return {
    title: dict.brand,
    description: dict.metaDescription,
  };
}

const themeBootScript = `
(() => {
  try {
    const stored = localStorage.getItem('ptcgl-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (!stored && prefersDark);
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch {}
})();
`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={localeToHtmlLang(locale)}
      className={`${display.variable} ${body.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="relative min-h-full flex flex-col overflow-x-hidden">
        <LocaleProvider locale={locale}>
          <ThemeProvider>
            <FloatingMascots />
            <div className="relative z-[1] flex min-h-full flex-1 flex-col">{children}</div>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
