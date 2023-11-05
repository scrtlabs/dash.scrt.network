import * as yup from 'yup'
import { validateAddress } from 'secretjs'
import { isFeeGrantStatus } from 'types/FeeGrantStatus'

export const sendSchema = yup.object().shape({
  amount: yup
    .number()
    .min(0.00001, 'Please enter a valid amount')
    .typeError('Please enter a valid amount')
    .transform((_value, originalValue) => Number(originalValue.replace(/,/, '.'))) // transforms comma to dot
    .required('Please enter a valid amount'),
  token: yup.mixed().required('Token is required'), // TODO: (low prio) add check with SendService.getSupportedTokens()
  recipient: yup
    .string()
    .required('Add a recipient')
    .test('isValidAddress', 'Please enter a valid recipient', (value) => {
      if (!value) return false
      return validateAddress(value).isValid
    }),
  memo: yup.string().max(255, 'Memo too long'),
  feeGrantStatus: yup
    .mixed()
    .test('is-fee-grant-status', 'Invalid fee grant status', (value: any) => isFeeGrantStatus(value))
    .required('Fee grant status is required')
})
