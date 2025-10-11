'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export function Layout({ children, pageTitle }: LayoutProps) {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header pageTitle={pageTitle} />
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  );
}
