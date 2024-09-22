import * as yup from 'yup'
import { validateAddress } from 'secretjs'

export const sendSchema = yup.object().shape({
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
  recipient: yup
    .string()
    .required('Add a recipient')
    .test('isValidAddress', 'Please enter a valid recipient', (value) => {
      if (!value) return false
      return validateAddress(value).isValid
    }),
  memo: yup.string().max(255, 'Memo too long')
})
