import { Metadata } from "next";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Auth - NewTube",
  description: "NewTube Authentication",
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      {children}
    </div>
  );
};

export default Layout;
