interface IProps {
  imgSrc: string
  altText: string
  optionName: string
}

export default function IbcSelect(props: IProps) {
  return (
    <div className="flex items-center">
      <img
        src={props.imgSrc}
        alt={props.altText}
        className="w-6 h-6 mr-2 rounded-full"
      />
      <span className="font-semibold text-sm">{props.optionName}</span>
    </div>
  )
}
