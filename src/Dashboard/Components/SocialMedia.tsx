import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

class SocialMedia extends React.Component {
  render() {
    return (
      <>
        <div className='bg-neutral-800 rounded-xl h-full flex items-center px-8 py-4'>
          <div className='flex-1 text-right pr-4 border-r border-neutral-700'>
            <a
              href='https://twitter.com/SecretNetwork'
              target='_blank'
              className='text-neutral-300 hover:text-white transition-colors'
            >
              <FontAwesomeIcon icon={faTwitter} size='xl' className='mr-2' />
              <span className='text-md font-medium'>Twitter</span>
            </a>
          </div>
          <div className='flex-1 pl-4'>
            <a
              href='https://discord.com/invite/SJK32GY'
              target='_blank'
              className='text-neutral-300 hover:text-white transition-colors'
            >
              <FontAwesomeIcon icon={faDiscord} size='xl' className='mr-2' />
              <span className='text-md font-medium'>Discord</span>
            </a>
          </div>
        </div>
      </>
    );
  }
}

export default SocialMedia;
