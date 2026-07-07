import * as React from 'react'
import Link from 'next/link'
import { FaCalendarAlt } from 'react-icons/fa'
import {  MdGTranslate } from 'react-icons/md'
import { RiLogoutCircleRLine } from 'react-icons/ri'

const menues = [
  {
    label: '翻訳',
    icon: <MdGTranslate />,
    link: '/translate',
  },
  {
    label: 'スケジュール',
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
  return (
    <div className="fixed h-full w-[250px] bg-dark-gray z-50">
      <ul className="p-0 relative text-[#cfd8dc]">
        <li className="w-full flex items-center px-3 py-4">
          <span className="w-full text-center text-xl font-bold">工程管理システム</span>
        </li>
        <hr className="border-border-gray" />
        {menues.map((item, index) => (
          <div key={index}>
            <li className="py-1 hover:bg-[#0098ba] relative">
              <Link href={item.link}
                className="w-full flex items-center p-3 gap-3"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
            <hr className="border-border-gray" />
          </div>
        ))}
      </ul>
    </div>
  )
}
