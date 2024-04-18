import { faDiscord, faGithub, faInstagram, faTelegram, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { faComments } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { trackMixPanelEvent } from 'utils/commons'

const Footer = () => {
  return (
    <>
      <div className="grid grid-cols-12 items-center px-6 py-8 mt-12 text-center gap-4">
        <div className="col-span-12 text-sm text-neutral-600 dark:text-neutral-400 font-medium">
          {'⚡️ Powered by '}
          <a
            href="https://scrt.network/"
            target="_blank"
            className="transition-colors hover:text-black dark:hover:text-white font-semibold"
          >
            Secret Network
          </a>
        </div>
        <div className="col-span-12 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {'Developed by '}
          <a
            href="https://x.com/secretjupiter_"
            target="_blank"
            className="transition-colors hover:text-black dark:hover:text-white"
          >
            Secret Jupiter
          </a>
          {', '}
          <a
            href="https://x.com/Secret_Saturn_"
            target="_blank"
            className="transition-colors hover:text-black dark:hover:text-white"
          >
            Secret Saturn
          </a>
        </div>
        <div className="col-span-12 space-x-4 text-xl text-center">
          <a
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            href="https://forum.scrt.network/"
            target="_blank"
            onClick={() => {
              trackMixPanelEvent('Clicked Forum link on Footer')
            }}
          >
            <FontAwesomeIcon icon={faComments} />
          </a>
          <a
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            href="https://github.com/SecretFoundation"
            target="_blank"
            onClick={() => {
              trackMixPanelEvent('Clicked Github link on Footer')
            }}
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>
          <a
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            href="https://discord.com/invite/SJK32GY"
            target="_blank"
            onClick={() => {
              trackMixPanelEvent('Clicked Discord link on Footer')
            }}
          >
            <FontAwesomeIcon icon={faDiscord} />
          </a>
          <a
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            href="https://t.me/SCRTcommunity"
            target="_blank"
            onClick={() => {
              trackMixPanelEvent('Clicked Telegram link on Footer')
            }}
          >
            <FontAwesomeIcon icon={faTelegram} />
          </a>
          <a
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            href="https://twitter.com/SecretNetwork"
            target="_blank"
            onClick={() => {
              trackMixPanelEvent('Clicked Twitter link on Footer')
            }}
          >
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            href="https://www.instagram.com/scrtnetwork/"
            target="_blank"
            onClick={() => {
              trackMixPanelEvent('Clicked Instagram link on Footer')
            }}
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            href="https://www.youtube.com/channel/UCZPqj7h7mzjwuSfw_UWxQPw"
            target="_blank"
            onClick={() => {
              trackMixPanelEvent('Clicked Youtube link on Footer')
            }}
          >
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        </div>
      </div>
    </>
  )
}

export default Footer
