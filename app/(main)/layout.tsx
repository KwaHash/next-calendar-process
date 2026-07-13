import Sidebar from '@/components/sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex'>
      <Sidebar />
      <main className='flex min-h-screen min-w-0 grow bg-[#eee] pt-14 md:ml-[250px] md:pt-0'>
        {children}
      </main>
    </div>
  )
}
