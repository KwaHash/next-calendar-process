'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaCalendarAlt } from 'react-icons/fa'
import {  MdGTranslate } from 'react-icons/md'
import { RiLogoutCircleRLine } from 'react-icons/ri'
import { cn } from '@/lib/utils'

const menues = [
  {
    label: '日本語 → ポルトガル語',
    icon: <MdGTranslate />,
    link: '/ja-pt',
  },
  {
    label: 'Português → Japonês',
    icon: <MdGTranslate />,
    link: '/pt-ja',
  },
  {
    label: 'agendar (スケジュール)',
    icon: <FaCalendarAlt />,
    link: '/schedule',
  },
  {
    label: 'ログアウト',
    icon: <RiLogoutCircleRLine />,
    link: '/logout',
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed h-full w-[250px] bg-dark-gray z-50">
      <ul className="p-0 relative text-[#cfd8dc]">
        <li className="w-full flex items-center px-3 py-4">
          <span className="w-full text-center text-xl font-bold">工程管理システム</span>
        </li>
        <hr className="border-border-gray" />
        {menues.map((item, index) => {
          const isActive = pathname === item.link || pathname.startsWith(`${item.link}/`)
          return (
            <div key={index}>
              <li className={cn('py-1 relative hover:bg-[#0098ba]', isActive && 'bg-[#0098ba]')}>
                <Link href={item.link}
                  className="w-full flex items-center p-3 gap-3"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
              <hr className="border-border-gray" />
            </div>
          )
        })}
      </ul>
    </div>
  )
}
