import * as yup from 'yup'
import { isWrappingMode } from 'types/WrappingMode'
import { tokens } from 'utils/config'

export const wrapSchema = yup.object().shape({
  amount: yup
    .number()
    .min(0.00001, 'Please enter a valid amount')
    .typeError('Please enter a valid amount')
    .transform((_value, originalValue) => Number(originalValue.replace(/,/, '.'))) // transforms comma to dot
    .required('Please enter a valid amount'),
  token: yup
    .mixed()
    .oneOf(tokens, 'Invalid token') // 'tokens' should be an array of valid tokens
    .required('Token is required'),
  wrappingMode: yup
    .string()
    .test('isWrappingMode', 'Invalid Wrapping Mode', (value) => isWrappingMode(value))
    .required('Please pick a Wrapping Mode')
})
