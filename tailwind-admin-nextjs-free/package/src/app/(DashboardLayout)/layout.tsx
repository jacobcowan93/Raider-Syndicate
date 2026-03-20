'use client'

import Header from './layout/header/Header'

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='flex flex-col min-h-screen w-full'>
      {/* Full-width top navbar */}
      <Header />
      {/* Full-width content */}
      <div className='flex-1 bg-background w-full'>
        <div className='container mx-auto px-6 py-[30px]'>{children}</div>
      </div>
    </div>
  )
}
