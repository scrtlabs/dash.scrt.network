import * as yup from 'yup'
import { tokens } from 'shared/utils/config'
import { validateAddress } from 'secretjs'

export const sendSchema = yup.object().shape({
  amount: yup
    .number()
    .min(0.00001, 'Please enter a valid amount')
    .typeError('Please enter a valid amount')
    .transform((_value, originalValue) =>
      Number(originalValue.replace(/,/, '.'))
    ) // transforms comma to dot
    .required('Please enter a valid amount'),
  tokenName: yup.string().oneOf(
    tokens.map((token) => token.name),
    'Please select a valid token'
  ),
  recipient: yup
    .string()
    .required('Add a recipient')
    .test('isValidAddress', 'Please enter a valid recipient', (value) => {
      if (!value) return false
      return validateAddress(value).isValid
    }),
  memo: yup.string().max(255, 'Memo too long')
})
