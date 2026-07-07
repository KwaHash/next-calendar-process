export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='flex flex-col w-full md:max-w-[700px] mx-auto items-center justify-center min-h-screen'>
      {children}
    </main>
  )
}
