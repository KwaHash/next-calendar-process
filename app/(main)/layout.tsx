import Sidebar from '@/components/sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex'>
      <Sidebar />
      <main className='flex min-h-screen grow ml-[250px] bg-[#eee]'>
        {children}
      </main>
    </div>
  )
}
