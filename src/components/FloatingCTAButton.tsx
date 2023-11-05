import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import './FloatingCTAButton.scss'

interface Props {
  url: string
  text: string
}

const FloatingCTAButton = (props: Props) => {
  return (
    <a href={props.url} target="_blank" className="hidden md:block">
      <div className="floatingCTAButton bg-violet-600 select-none text-white">
        <FontAwesomeIcon icon={faComment} className="icon-circle bg-violet-600" />
        <span className="cta-text text-xs font-light">{props.text}</span>
      </div>
    </a>
  )
}

export default FloatingCTAButton
