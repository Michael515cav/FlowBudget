import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowBudget — Free Budget Tracker",
  description: "Track your spending, set budgets, and visualize your finances for free.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
