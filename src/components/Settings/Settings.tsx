import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '@mui/material/Tooltip'
import Modal from 'components/UI/Modal/Modal'
import React, { useState } from 'react'

function Settings() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  return (
    <>
      <Modal
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        title="Settings"
        subTitle="Settings are saved in the local storage in your browser."
      >
        <label htmlFor="theme">Theme</label>
        <select id="theme">
          <option value="dark">Dark Mode</option>
          <option value="light">Light Mode</option>
        </select>
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
