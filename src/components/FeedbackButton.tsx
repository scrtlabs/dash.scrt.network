import './FloatingCTAButton.scss'

interface Props {
  url: string
}

export default function FeedbackButton(props: Props) {
  return (
    <div className="z-10 fixed rotate-90 top-3/4 left-0 -translate-x-[26px] translate-y-[29px]">
      <a
        href={props.url}
        target="_blank"
        className="text-white dark:text-white bg-purple-600 dark:bg-purple-500 hover:bg-purple-500 dark:hover:bg-purple-600 transition-colors px-1.5 py-1.5 text-sm rounded-t"
      >
        Feedback
      </a>
    </div>
  )
}
