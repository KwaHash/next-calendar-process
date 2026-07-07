import Sidebar from '@/components/sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex'>
      <Sidebar />
      <main className='flex flex-col w-full grow bg-[#eee]'>
        {children}
      </main>
    </div>
  )
}
