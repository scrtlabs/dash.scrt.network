import React from 'react'
import { Window as KeplrWindow } from '@keplr-wallet/types'
import 'assets/scss/index.scss'
import { Buffer } from 'buffer'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { Helmet, HelmetProvider } from 'react-helmet-async'

// Pages
import { Ibc } from 'pages/ibc/Ibc'
import { Wrap } from 'pages/wrap/Wrap'
import Apps from 'pages/apps/Apps'
import { Staking } from 'pages/staking/Staking'
import { Send } from 'pages/send/Send'
import Portfolio from 'pages/portfolio/Portfolio'

// Contexts
import { ThemeContextProvider } from 'context/ThemeContext'
import { APIContextProvider } from 'context/APIContext'

// mixpanel
import mixpanel from 'mixpanel-browser'
import Bridge from 'pages/bridge/Bridge'
import GetSCRT from 'pages/get-scrt/GetScrt'
import Dashboard from 'pages/dashboard/Dashboard'
import DefaultLayout from 'layouts/DefaultLayout'
import Powertools from 'pages/powertools/Powertools'

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

class ErrorBoundary extends React.Component<{ children: any }, { hasError: boolean }> {
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
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/send" element={<Send />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/powertools" element={<Powertools />} />
      </Routes>
    </>
  )
}
