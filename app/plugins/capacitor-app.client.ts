import { App, type URLOpenListenerEvent } from '@capacitor/app'

export default defineNuxtPlugin(() => {
  // Hanya jalankan di browser / mobile device
  if (!import.meta.client) return

  const config = useRuntimeConfig()
  const currentScheme = (config.public.appScheme as string) || 'myfinance'

  // Listener saat aplikasi dibuka dari Deep Link (URL Scheme)
  App.addListener('appUrlOpen', async (data: URLOpenListenerEvent) => {
    try {
      const url = new URL(data.url)
      
      // Memeriksa apakah URL sesuai dengan scheme di .env
      if (url.protocol.replace(':', '') === currentScheme) {
        const pathname = url.pathname
        const hash = url.hash
        const search = url.search
        
        const router = useRouter()
        await router.push(`${pathname}${search}${hash}`)
      }
    } catch (error) {
      console.error('Error handling deep link:', error)
    }
  })
})