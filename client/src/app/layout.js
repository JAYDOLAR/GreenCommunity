
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import AuthLayoutWrapper from "@/components/AuthLayoutWrapper";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { AnimationProvider } from "@/context/AnimationContext";
import LenisProvider from "@/components/LenisProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GreenCommunity - Sustainable Living Dashboard",
  description: "Track and reduce your carbon footprint with our comprehensive environmental impact dashboard",
  other: {
    'format-detection': 'telephone=no, date=no, email=no, address=no',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://js.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          <ThemeProvider>
            <LenisProvider>
              <PreferencesProvider>
                <AnimationProvider>
                  <UserProvider>
                    <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
                  </UserProvider>
                </AnimationProvider>
              </PreferencesProvider>
            </LenisProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}