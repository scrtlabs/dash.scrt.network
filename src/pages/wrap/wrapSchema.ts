import * as yup from 'yup'
import { isWrappingMode } from 'types/WrappingMode'
import { tokens } from 'utils/config'

export const wrapSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError('Please enter a valid amount')
    .required('Please enter a valid amount')
    .test('min-amount', 'Please enter a valid amount', function (value) {
      const { token } = this.parent
      if (token && typeof token.decimals === 'number') {
        const minAmount = Math.pow(10, -token.decimals)
        if (value < minAmount) {
          return this.createError({
            message: `Please enter an amount of at least ${minAmount}`
          })
        }
      }
      return true
    }),
  token: yup.mixed().required('Token is required'),
  wrappingMode: yup
    .string()
    .test('isWrappingMode', 'Invalid Wrapping Mode', (value) => isWrappingMode(value))
    .required('Please pick a Wrapping Mode')
})
