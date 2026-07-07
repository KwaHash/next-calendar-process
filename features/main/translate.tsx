'use client'

import { Thread } from '@/components/thread'
import { TranslateRuntimeProvider } from '@/providers/translate-runtime-provider'

const TranslatePage = () => {
  return (
    <TranslateRuntimeProvider>
      <div className='flex w-full h-screen pr-0.5 overflow-hidden'>
        <div className='absolute inset-0 opacity-[0.04]'
          style={{
            backgroundImage: 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
            backgroundSize: '35px 35px'
          }}
        />
        <div className='flex-1 overflow-hidden'>
          <Thread />
        </div>
      </div>
    </TranslateRuntimeProvider>
  )
}

export default TranslatePage