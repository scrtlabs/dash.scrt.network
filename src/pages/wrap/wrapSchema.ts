import * as yup from 'yup'
import { isWrappingMode } from 'types/WrappingMode'
import { tokens } from 'utils/config'
import { isFeeGrantStatus } from 'types/FeeGrantStatus'

export const wrapSchema = yup.object().shape({
  amount: yup
    .number()
    .min(0.00001, 'Please enter a valid amount')
    .typeError('Please enter a valid amount')
    .transform((_value, originalValue) => Number(originalValue.replace(/,/, '.'))) // transforms comma to dot
    .required('Please enter a valid amount'),
  token: yup.mixed().oneOf(tokens, 'Invalid token').required('Token is required'),
  wrappingMode: yup
    .string()
    .test('isWrappingMode', 'Invalid Wrapping Mode', (value) => isWrappingMode(value))
    .required('Please pick a Wrapping Mode'),
  feeGrantStatus: yup
    .mixed()
    .test('is-fee-grant-status', 'Invalid fee grant status', (value: any) => isFeeGrantStatus(value))
    .required('Fee grant status is required')
})
