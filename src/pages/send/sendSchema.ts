import * as yup from 'yup'
import { validateAddress } from 'secretjs'

export const sendSchema = yup.object().shape({
  amount: yup
    .number()
    .min(0.000001, 'Please enter a valid amount')
    .typeError('Please enter a valid amount')
    .required('Please enter a valid amount'),
  token: yup.mixed().required('Token is required'),
  recipient: yup
    .string()
    .required('Add a recipient')
    .test('isValidAddress', 'Please enter a valid recipient', (value) => {
      if (!value) return false
      return validateAddress(value).isValid
    }),
  memo: yup.string().max(255, 'Memo too long')
})
