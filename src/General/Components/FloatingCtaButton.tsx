import { faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export function FloatingCtaButton() {
  return (
    <a href="https://linktr.ee/SCRTSupport" target="_blank" className="hidden md:block">
      <div className="floating-cta-button select-none text-white">
          <FontAwesomeIcon icon={faComment} className="icon-circle" />
          <span className="cta-text text-xs font-light">Need some help?</span>
      </div>
    </a>
  )
}