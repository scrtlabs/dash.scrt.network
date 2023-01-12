import {
  faDiscord,
  faGithub,
  faInstagram,
  faTelegram,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faComments } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

class Footer extends React.Component {
  render() {
    return (
      <>
        <div className='grid grid-cols-12 items-center px-6 py-8 mt-12 text-center gap-4'>
          <div className='col-span-12 text-sm text-neutral-400'>
            ⚡️ Powered by{" "}
            <a
              href='https://scrt.network/'
              target='_blank'
              className='transition-colors hover:text-white'
            >
              Secret Network
            </a>{" "}
            &amp;{" "}
            <a
              href='https://secretsaturn.net/'
              target='_blank'
              className='transition-colors hover:text-white'
            >
              🪐 𝕊ecret 𝕊aturn
            </a>
          </div>
          <div className='col-span-12 space-x-4 text-xl text-center'>
            <a
              className='text-neutral-400 hover:text-neutral-200 transition-colors'
              href='https://forum.scrt.network/'
              target='_blank'
            >
              <FontAwesomeIcon icon={faComments} />
            </a>
            <a
              className='text-neutral-400 hover:text-neutral-200 transition-colors'
              href='https://github.com/SecretFoundation'
              target='_blank'
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
            <a
              className='text-neutral-400 hover:text-neutral-200 transition-colors'
              href='https://discord.com/invite/SJK32GY'
              target='_blank'
            >
              <FontAwesomeIcon icon={faDiscord} />
            </a>
            <a
              className='text-neutral-400 hover:text-neutral-200 transition-colors'
              href='https://t.me/SCRTcommunity'
              target='_blank'
            >
              <FontAwesomeIcon icon={faTelegram} />
            </a>
            <a
              className='text-neutral-400 hover:text-neutral-200 transition-colors'
              href='https://twitter.com/SecretNetwork'
              target='_blank'
            >
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a
              className='text-neutral-400 hover:text-neutral-200 transition-colors'
              href='https://www.instagram.com/scrtnetwork/'
              target='_blank'
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              className='text-neutral-400 hover:text-neutral-200 transition-colors'
              href='https://www.youtube.com/channel/UCZPqj7h7mzjwuSfw_UWxQPw'
              target='_blank'
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>
      </>
    );
  }
}

export default Footer;
