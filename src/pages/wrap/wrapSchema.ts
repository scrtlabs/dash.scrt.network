import * as yup from 'yup'
import { isWrappingMode } from 'types/WrappingMode'
import { tokens } from 'utils/config'

export const wrapSchema = yup.object().shape({
  amount: yup
    .number()
    .min(0.000001, 'Please enter a valid amount')
    .typeError('Please enter a valid amount')
    .required('Please enter a valid amount'),
  token: yup.mixed().required('Token is required'),
  wrappingMode: yup
    .string()
    .test('isWrappingMode', 'Invalid Wrapping Mode', (value) => isWrappingMode(value))
    .required('Please pick a Wrapping Mode')
})
