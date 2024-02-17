import React, { useState } from 'react'
import { faBug, faGear, faSave } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '@mui/material/Tooltip'
import Button from 'components/UI/Button/Button'
import Modal from 'components/UI/Modal/Modal'
import { useFormik } from 'formik'
import { settingsSchema } from './settingsSchema'
import { NotificationService } from 'services/notification.service'

function Settings() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  type Option = {
    label: string
    value: any
  }

  const themeOptions: Option[] = [
    {
      label: 'Dark Mode',
      value: 'dark'
    },
    {
      label: 'Light Mode',
      value: 'light'
    }
  ]

  const currencyOptions: Option[] = [
    {
      label: 'USD',
      value: 'usd'
    },
    {
      label: 'EUR',
      value: 'eur'
    },
    {
      label: 'JPY',
      value: 'jpy'
    },
    {
      label: 'GBP',
      value: 'gbp'
    },
    {
      label: 'AUD',
      value: 'aud'
    },
    {
      label: 'CAD',
      value: 'cad'
    },
    {
      label: 'CHF',
      value: 'chf'
    }
  ]

  type TFormValues = {
    theme: string
    currency: string
    debugMode: boolean
  }

  const formik = useFormik<TFormValues>({
    initialValues: {
      theme: themeOptions[0].value,
      currency: currencyOptions[0].value,
      debugMode: false
    },
    // validationSchema: settingsSchema,
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
      } catch (error: any) {
        console.error(error)
        NotificationService.notify(`An error occured while saving user settings!`, 'error')
      }
    }
  })

  return (
    <>
      <Modal
        onClose={() => setIsModalOpen(false)}
        isOpen={true || isModalOpen}
        title="Settings"
        subTitle="Settings are saved in the local storage in your browser."
      >
        <form>
          <div className="flex flex-col gap-4">
            {/* Theme */}
            <div className="flex flex-col gap-2">
              <label htmlFor="themeSelect" className="font-bold text-sm">
                Theme
              </label>
              <select id="themeSelect" className="dark:bg-neutral-800 border dark:border-neutral-700 p-2 rounded-lg">
                {themeOptions.map((theme: any, index: number) => {
                  return (
                    <option key={index} value={theme.value}>
                      {theme.label}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Currency */}
            <div className="flex flex-col gap-2">
              <label htmlFor="currencySelect" className="font-bold text-sm">
                Currency
              </label>
              <select id="currencySelect" className="dark:bg-neutral-800 border dark:border-neutral-700 p-2 rounded-lg">
                {currencyOptions.map((currency: any, index: number) => {
                  return (
                    <option key={index} value={currency.value}>
                      {currency.label}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Debug Mode */}
            <div className="flex items-center gap-3 mt-3 mb-2">
              <input
                id="default-checkbox"
                type="checkbox"
                value=""
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="default-checkbox" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                <FontAwesomeIcon icon={faBug} className="mr-2 text-green-700 dark:text-green-600" />
                Debug Mode
              </label>
            </div>

            <div>
              <Button className="mt-2 px-6" color="emerald">
                Save
              </Button>
            </div>
          </div>
        </form>
      </Modal>
      <Tooltip title={`Settings`} placement="bottom" arrow>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
        >
          <FontAwesomeIcon icon={faGear} />
        </button>
      </Tooltip>
    </>
  )
}

export default Settings
