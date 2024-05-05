import { useState } from 'react'
import { faBug, faChevronDown, faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from 'components/UI/Button/Button'
import Modal from 'components/UI/Modal/Modal'
import { useFormik } from 'formik'
import { NotificationService } from 'services/notification.service'
import { Theme } from 'types/Theme'
import { Currency } from 'types/Currency'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { debugModeOverride } from 'utils/commons'

function Settings() {
  const { theme, setTheme, debugMode, setDebugMode, currency, setCurrency } = useUserPreferencesStore()

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  type ThemeOption = {
    label: string
    value: Theme
  }

  const themeOptions: ThemeOption[] = [
    {
      label: 'Dark Theme',
      value: 'dark'
    },
    {
      label: 'Light Theme',
      value: 'light'
    }
  ]

  type CurrencyOption = {
    label: string
    value: Currency
  }

  const currencyOptions: CurrencyOption[] = [
    {
      label: 'USD',
      value: 'USD'
    },
    {
      label: 'EUR',
      value: 'EUR'
    },
    {
      label: 'JPY',
      value: 'JPY'
    },
    {
      label: 'GBP',
      value: 'GBP'
    },
    {
      label: 'AUD',
      value: 'AUD'
    },
    {
      label: 'CAD',
      value: 'CAD'
    },
    {
      label: 'CHF',
      value: 'CHF'
    }
  ]

  type TFormValues = {
    theme: string
    currency: string
    debugMode: boolean
  }

  const formik = useFormik<TFormValues>({
    initialValues: {
      theme: theme,
      currency: currency,
      debugMode: debugMode
    },
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        if (values.theme !== theme || values.debugMode !== debugMode) {
          setTheme(values.theme as Theme)
          setDebugMode(values.debugMode)
          setIsModalOpen(false)
        }

        if (values.currency !== currency) {
          setCurrency(values.currency as Currency)
          window.location.reload()
        }
      } catch (error: any) {
        console.error('error after submitting settings:', error)
        NotificationService.notify(`An error occured while saving user settings!`, 'error')
      }
    }
  })

  return (
    <>
      <Modal
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        title="Settings"
        subTitle="Settings are saved in the local storage in your browser."
      >
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-4">
            {/* Theme */}
            <div className="flex flex-col gap-2">
              <label htmlFor="theme" className="font-bold text-sm">
                Theme
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center">
                  <FontAwesomeIcon icon={faChevronDown} className="text-xs mr-4" />
                </span>
                <select
                  id="theme"
                  value={formik.values.theme}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  className="w-full appearance-none dark:bg-neutral-800 border dark:border-neutral-700 py-2 px-4 rounded-lg focus:outline-none focus-visible:ring-4 enabled:ring-sky-500/40 dark:enabled:ring-sky-600/40"
                >
                  {themeOptions.map((theme: any, index: number) => {
                    return (
                      <option key={index} value={theme.value}>
                        {theme.label}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            {/* Currency */}
            <div className="flex flex-col gap-2">
              <label htmlFor="currency" className="font-bold text-sm">
                Currency
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center">
                  <FontAwesomeIcon icon={faChevronDown} className="text-xs mr-4" />
                </span>
                <select
                  id="currency"
                  className="w-full appearance-none dark:bg-neutral-800 border dark:border-neutral-700 py-2 px-4 rounded-lg focus:outline-none focus-visible:ring-4 enabled:ring-sky-500/40 dark:enabled:ring-sky-600/40"
                  value={formik.values.currency}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                >
                  {currencyOptions.map((currency: any, index: number) => {
                    return (
                      <option key={index} value={currency.value}>
                        {currency.label}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            {/* Debug Mode */}
            <label htmlFor="debugMode" className="mt-2 inline-flex items-center cursor-pointer">
              <input
                id="debugMode"
                checked={formik.values.debugMode}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="checkbox"
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-neutral-600 peer-checked:bg-purple-600"></div>
              <span className="ms-3 text-sm font-medium text-neutral-900 dark:text-neutral-300">
                <FontAwesomeIcon icon={faBug} className="mr-2 text-green-700 dark:text-green-600" />
                Debug Mode
              </span>
            </label>

            <div className="flex justify-end items-center gap-4">
              <Button onClick={() => setIsModalOpen(false)} className="mt-2 px-6" color="secondary" type="button">
                Cancel
              </Button>
              <Button className="mt-2 px-6" color="primary" type="submit">
                Save
              </Button>
            </div>

            {/* Debug Info */}
            {debugMode ||
              (debugModeOverride && (
                <div className="text-sky-500 text-xs p-2 bg-blue-500/20 rounded">
                  <div className="mb-4 font-semibold">Debug Info</div>
                  <div className="flex flex-col gap-2">
                    <span> formik.values: {JSON.stringify(formik.values)}</span>
                    <span>formik.errors: {JSON.stringify(formik.errors)}</span>
                  </div>
                </div>
              ))}
          </div>
        </form>
      </Modal>
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
        >
          <FontAwesomeIcon icon={faGear} />
        </button>
      </div>
    </>
  )
}

export default Settings
