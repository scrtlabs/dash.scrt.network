import toast from 'react-hot-toast'
import { NotificationType } from 'types/NotificationType'

function notify(notification: string, type: NotificationType, toastId: string = null) {
  // Define an options object for toast, if toastId is provided
  const options = toastId
    ? {
        id: toastId,
        duration: Infinity,
        onClick: () => {
          toast.dismiss()
        },
        style: {
          maxWidth: '90vw',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        },
        position: 'bottom-right'
      }
    : {
        duration: Infinity,
        onClick: () => {
          toast.dismiss()
        },
        style: {
          maxWidth: '90vw',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        },
        position: 'bottom-right'
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
