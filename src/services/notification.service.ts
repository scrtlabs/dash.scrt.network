import toast from 'react-hot-toast'
import { NotificationType } from 'types/NotificationType'

function notify(notification: string, type: NotificationType, toastId: string = null) {
  // Define an options object for toast, if toastId is provided
  const options = {
    id: toastId || undefined,
    duration: Infinity,
    onClick: () => {
      toast.dismiss()
    },
    style: {
      maxWidth: '35vw',
      whiteSpace: 'pre-wrap' as any,
      wordBreak: 'break-word' as any
    },
    position: 'bottom-right' as any
  }

  switch (type) {
    case 'error':
      return toast.error(notification, options)

    case 'loading':
      return toast.loading(notification, options)

    case 'success':
      return toast.success(notification, options)

    default:
      return null
  }
}

export const NotificationService = {
  notify
}
