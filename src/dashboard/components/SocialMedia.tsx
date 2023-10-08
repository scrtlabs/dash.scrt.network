import {
  faDiscord,
  faTelegram,
  faTwitter
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { trackMixPanelEvent } from 'shared/utils/commons'

const SocialMedia = () => {
  return (
    <>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl h-full flex items-center px-4 py-4">
        <div className="flex-1 text-center border-r border-neutral-300 dark:border-neutral-700">
          <a
            href="https://twitter.com/SecretNetwork"
            target="_blank"
            className="group text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
            onClick={() => {
              trackMixPanelEvent('Clicked Twitter on dashboard')
            }}
          >
            <FontAwesomeIcon
              icon={faTwitter}
              size="xl"
              className="fa-fw sm:mb-1"
            />
            <br />
            <span className="group-hover:text-black dark:group-hover:text-white transition-colors text-sm font-semibold text-neutral-500 dark:text-neutral-500 hidden sm:inline-block">
              Twitter
            </span>
          </a>
        </div>

        <div className="flex-1 text-center border-r border-neutral-300 dark:border-neutral-700">
          <a
            href="https://discord.com/invite/SJK32GY"
            target="_blank"
            className="group text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
            onClick={() => {
              trackMixPanelEvent('Clicked Discord on dashboard')
            }}
          >
            <FontAwesomeIcon
              icon={faDiscord}
              size="xl"
              className="fa-fw sm:mb-1"
            />
            <br />
            <span className="group-hover:text-black dark:group-hover:text-white transition-colors text-sm font-semibold text-neutral-500 dark:text-neutral-500 hidden sm:inline-block">
              Discord
            </span>
          </a>
        </div>

        <div className="flex-1 text-center">
          <a
            href="https://t.me/SCRTCommunity"
            target="_blank"
            className="group text-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
            onClick={() => {
              trackMixPanelEvent('Clicked Telegram on dashboard')
            }}
          >
            <FontAwesomeIcon
              icon={faTelegram}
              size="xl"
              className="fa-fw sm:mb-1"
            />
            <br />
            <span className="group-hover:text-black dark:group-hover:text-white transition-colors text-sm font-semibold text-neutral-500 dark:text-neutral-500 hidden sm:inline-block">
              Telegram
            </span>
          </a>
        </div>
      </div>
    </>
  )
}

export default SocialMedia
