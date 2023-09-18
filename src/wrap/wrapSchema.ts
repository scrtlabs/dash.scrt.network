import * as yup from 'yup'

export const wrapSchema = yup.object().shape({
  amount: yup.number().required("Can't be blank!")
})
