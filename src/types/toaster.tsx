import { toast, Toaster, ToastBar } from 'react-hot-toast'

;<Toaster>
  {(t) => (
    <ToastBar toast={t}>
      {({ icon, message }) => (
        <>
          {icon}
          {message}
          {t.type !== 'loading' && <button onClick={() => toast.dismiss(t.id)}>X</button>}
        </>
      )}
    </ToastBar>
  )}
</Toaster>
