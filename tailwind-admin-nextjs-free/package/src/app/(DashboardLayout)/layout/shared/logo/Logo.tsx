'use client'

import Link from 'next/link';

const Logo = () => {
  return (
    <Link href={'/'} className="flex items-center justify-center">
      <span
        className="text-[13px] font-black tracking-[0.15em] uppercase"
        style={{ color: "#dc2626" }}
      >
        ARC
      </span>
    </Link>
  )
}

export default Logo
