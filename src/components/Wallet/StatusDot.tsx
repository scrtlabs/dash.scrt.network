type Status = 'connected' | 'disconnected'

type Props = {
  status: Status
}

function StatusDot(props: Props) {
  if (props.status === 'connected') {
    return (
      <span className="flex relative h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-1/2"></span>
        <span className="relative inline-flex rounded-full size-2 h-2 w-2 bg-emerald-500"></span>
      </span>
    )
  }

  return <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
}

export default StatusDot
