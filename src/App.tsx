import React from 'react'
import { Window as KeplrWindow } from '@keplr-wallet/types'
import { BreakpointProvider } from 'react-socks'
import 'shared/assets/scss/index.scss'
// import "animate.css";
import { Buffer } from 'buffer'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { Helmet, HelmetProvider } from 'react-helmet-async'

// Pages
import { Ibc } from 'ibc/Ibc'
import { Wrap } from 'wrap/Wrap'
import DefaultLayout from 'shared/layouts/DefaultLayout'
import Bridge from 'bridge/Bridge'
import Apps from 'apps/Apps'
import { Staking } from 'staking/Staking'
import { Send } from 'send/Send'
import GetSCRT from 'get-scrt/GetScrt'

// Contexts
import { ThemeContextProvider } from 'shared/context/ThemeContext'
import { APIContextProvider } from 'shared/context/APIContext'

// mixpanel
import mixpanel from 'mixpanel-browser'
import Dashboard from 'dashboard/Dashboard'

if (import.meta.env.VITE_MIXPANEL_ENABLED === 'true') {
  mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, { debug: true })
  mixpanel.identify('Dashboard-App')

  mixpanel.track('Dashboard has been opened', {})
  console.debug('[Mixpanel] Enabled')
} else {
  console.debug('[Mixpanel] Disabled')
}

export const websiteName = 'Secret Dashboard'

globalThis.Buffer = Buffer
declare global {
  interface Window extends KeplrWindow {}
}
window.addEventListener('keplr_keystorechange', () => {
  console.log('Key store in Keplr is changed. Refreshing page.')
  location.reload()
})

class ErrorBoundary extends React.Component<
  { children: any },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    console.error(error)
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <BreakpointProvider>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeContextProvider>
          <APIContextProvider>
            <DefaultLayout>
              <App />
            </DefaultLayout>
          </APIContextProvider>
        </ThemeContextProvider>
      </BrowserRouter>
    </HelmetProvider>
  </BreakpointProvider>
)

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ibc" element={<Ibc />} />
        <Route path="/wrap" element={<Wrap />} />
        <Route path="/bridge" element={<Bridge />} />
        <Route path="/get-scrt" element={<GetSCRT />} />
        <Route path="/staking" element={<Staking />} />
        <Route path="/send" element={<Send />} />
        <Route path="/apps" element={<Apps />} />
      </Routes>
    </>
  )
}
