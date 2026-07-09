import "./globals.css";

export const metadata = {
  title: "GrowEasy CRM - AI CSV Importer",
  description: "Intelligently map and import any CSV lead list into your GrowEasy CRM using AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full bg-bg-base text-text-primary font-sans antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
