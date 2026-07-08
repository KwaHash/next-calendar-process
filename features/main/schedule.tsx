'use client'

import Calendar from '@/components/schedule/calendar'

const SchedulePage = () => {
  return (
    <div className="w-full px-10 py-8">
      <h2 className="border-l-[6px] border-blue-600 pl-2 text-xl font-bold">スケジュール管理</h2>
      <p className="mt-3 text-sm text-gray-600">
        「＋」を押すと、その日をスケジュールとして登録できます。時刻を押すと編集、×で削除できます。
      </p>
      <Calendar />
    </div>
  )
}

export default SchedulePage
