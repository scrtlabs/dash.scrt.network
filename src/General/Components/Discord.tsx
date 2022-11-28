import { faArrowTurnDown } from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export function Discord() {
  return (
    <a href="https://chat.scrt.network/" target="_blank" className="hidden md:block">
      <div className="floating-cta-button select-none text-white">
          <FontAwesomeIcon icon={faDiscord} className="icon-circle" />
          <span className="cta-text text-xs font-light">Meet our Community <br/>on <span className="font-medium">Discord</span></span>
      </div>
    </a>
  )
}