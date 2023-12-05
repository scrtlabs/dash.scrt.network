import './FloatingCTAButton.scss'

interface Props {
  url: string
}

function FeedbackButton(props: Props) {
  return (
    <div className="z-10 fixed rotate-90 top-3/4 left-0 -translate-x-[30px] translate-y-[29px]">
      <a
        href={props.url}
        target="_blank"
        className="bg-purple-100 text-purple-800 text-sm font-medium me-2 dark:bg-purple-900 dark:text-purple-300 transition-colors px-1.5 py-1.5 rounded-t"
      >
        Feedback
      </a>
    </div>
  )
}

export default FeedbackButton
