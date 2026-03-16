import { validateAddress } from "secretjs";
import { mixed, number, object, string } from "yup";

export const sendSchema = object().shape({
  amount: number()
    .typeError("Please enter a valid amount")
    .required("Please enter a valid amount")
    .test("min-amount", "Please enter a valid amount", function (value) {
      const { token } = this.parent;
      if (token && typeof token.decimals === "number") {
        const minAmount = 10 ** -token.decimals;
        if (value < minAmount) {
          return this.createError({
            message: `Please enter an amount of at least ${minAmount}`,
          });
        }
      }
      return true;
    }),
  token: mixed().required("Token is required"),
  recipient: string()
    .required("Add a recipient")
    .test("isValidAddress", "Please enter a valid recipient", (value) => {
      if (!value) return false;
      return validateAddress(value).isValid;
    }),
  memo: string().max(255, "Memo too long"),
});
