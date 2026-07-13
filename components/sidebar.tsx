'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaCalendarAlt } from 'react-icons/fa'
import { MdClose, MdGTranslate, MdMenu } from 'react-icons/md'
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
  const [open, setOpen] = React.useState(false)

  return (
    <>
      {/* Mobile top bar — holds the menu button, so the drawer can stay hidden */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2 bg-dark-gray px-3 text-[#cfd8dc] md:hidden">
        <button type="button" aria-label="メニューを開く" onClick={() => setOpen(true)} className="p-2">
          <MdMenu className="text-2xl" />
        </button>
        <span className="text-lg font-bold">工程管理システム</span>
      </div>

      {/* Backdrop — mobile only, closes the drawer on tap */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Drawer: slides in on mobile, always visible from md up */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 h-full w-[250px] bg-dark-gray transition-transform duration-300 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          type="button"
          aria-label="メニューを閉じる"
          onClick={() => setOpen(false)}
          className="absolute right-2 top-3 p-2 text-[#cfd8dc] md:hidden"
        >
          <MdClose className="text-2xl" />
        </button>

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
                    onClick={() => setOpen(false)}
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
    </>
  )
}
