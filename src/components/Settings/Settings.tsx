import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '@mui/material/Tooltip'
import Modal from 'components/UI/Modal/Modal'
import React, { useState } from 'react'

function Settings() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const themes = [
    {
      label: 'Dark Mode',
      value: 'dark'
    },
    {
      label: 'Light Mode',
      value: 'light'
    }
  ]

  const currencies = [
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
  return (
    <>
      <Modal
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        title="Settings"
        subTitle="Settings are saved in the local storage in your browser."
      >
        <div>
          <label htmlFor="theme">Theme</label>
          <select id="theme">
            {themes.map((theme: any, index: number) => {
              return (
                <option key={index} value={theme.value}>
                  {theme.label}
                </option>
              )
            })}
          </select>
        </div>

        <div>
          <label htmlFor="currency">Currency</label>
          <select id="currency">
            {currencies.map((currency: any, index: number) => {
              return (
                <option key={index} value={currency.value}>
                  {currency.label}
                </option>
              )
            })}
          </select>
        </div>
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
