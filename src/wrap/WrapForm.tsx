import React, { useState } from 'react'
import { useFormik } from 'formik'
import { wrapSchema } from './wrapSchema'

function WrapForm() {
  const [generalErrorMessage, setGeneralErrorMessage] = useState<String>('')

  const formik = useFormik({
    initialValues: {
      amount: '12'
    },
    validationSchema: wrapSchema,
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        setGeneralErrorMessage('')
        const response: any = null
        if (response.error) {
          setGeneralErrorMessage(response.error)
          return
        }

        if (response.data) {
          alert('Login Successful!')
          console.log('Login Successful!', response.data)
        }
      } catch (error: any) {
        console.error(error)
        setGeneralErrorMessage('An error occurred.')
      }
    }
  })

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="grid grid-cols-12 gap-x-4 gap-y-6"
    >
      {/* Source */}
      <div className="col-span-12">
        <input
          name="amount"
          type="text"
          className="text-black bg-red-500"
          value={formik.values.amount}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
      {/* Dist */}
      <div className="col-span-12">
        <input
          name="amount"
          type="text"
          className="text-black"
          value={formik.values.amount}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  )
}
export default WrapForm
