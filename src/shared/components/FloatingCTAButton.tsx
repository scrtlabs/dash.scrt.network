import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import "./FloatingCTAButton.scss";

interface IFloatingCTAButtonProps {
  url: string;
  text: string;
}

class FloatingCTAButton extends React.Component<IFloatingCTAButtonProps> {
  render() {
    return (
      <a href={this.props.url} target='_blank' className='hidden md:block'>
        <div className='floatingCTAButton bg-violet-600 select-none text-white'>
          <FontAwesomeIcon
            icon={faComment}
            className='icon-circle bg-violet-600'
          />
          <span className='cta-text text-xs font-light'>{this.props.text}</span>
        </div>
      </a>
    );
  }
}

export default FloatingCTAButton;
