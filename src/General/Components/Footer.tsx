import { faDiscord, faGithub, faInstagram, faTelegram, faTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faComments } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export function Footer() {
  return (
    <>
      <div className="flex items-center px-6 py-4 mt-12">
        <div className="flex-1 text-sm text-zinc-400">
          &copy; <a href="https://scrt.network/" target="_blank" className="transition-colors hover:text-white">Secret Network</a> &amp; <a href="https://secretsaturn.net/" target="_blank" className="transition-colors hover:text-white">𝕊ecret 𝕊aturn</a>. All rights reserved.
        </div>
        <div className="flex-initial space-x-3 text-xl">
          <a href="https://forum.scrt.network/" target="_blank"><FontAwesomeIcon icon={faComments} /></a>
          <a href="https://github.com/SecretFoundation" target="_blank"><FontAwesomeIcon icon={faGithub} /></a>
          <a href="https://discord.com/invite/SJK32GY" target="_blank"><FontAwesomeIcon icon={faDiscord} /></a>
          <a href="https://t.me/SCRTcommunity" target="_blank"><FontAwesomeIcon icon={faTelegram} /></a>
          <a href="https://twitter.com/SecretNetwork" target="_blank"><FontAwesomeIcon icon={faTwitter} /></a>
          <a href="https://www.instagram.com/scrtnetwork" target="_blank"><FontAwesomeIcon icon={faInstagram} /></a>
          <a href="https://www.youtube.com/channel/UCZPqj7h7mzjwuSfw_UWxQPw" target="_blank"><FontAwesomeIcon icon={faYoutube} /></a>
        </div>
      </div>
      
      {/* <div className="text-center text-zinc-600 text-sm mt-8 mb-16">
        ⚡ Powered by <a href="https://scrt.network/" target="_blank">Secret Network</a> and <a href="https://scrt.network/" target="_blank">🪐 𝕊ecret 𝕊aturn</a>
      </div> */}
    </>
  )
}