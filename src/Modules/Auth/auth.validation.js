import joi from "joi";
import { commonValidationFields } from "../../Middleware/validation.middleware.js";

export const signupSchema = {
  body: joi
    .object({})
    .keys({
      userName: commonValidationFields.userName.required(),
      email: commonValidationFields.email.required(),
      password: commonValidationFields.password.required(),
      confirmPassword: commonValidationFields.confirmPassword.required(),
      phone: commonValidationFields.phone,
      gender: commonValidationFields.gender,
      DOB: commonValidationFields.DOB,
    })
    .required(),

  query: joi.object({}).keys({ ln: joi.string() }).required(),
};

export const loginSchema = {
  body: joi
    .object({})
    .keys({
      email: commonValidationFields.email.required(),
      password: commonValidationFields.password.required(),
    })
    .required(),
};

export const confirmEmailSchema = {
  body: joi
    .object()
    .keys({
      email: commonValidationFields.email.required(),
      otp: commonValidationFields.OTP.required(),
    })
    .required(),
};

export const resendConfirmEmailOTPSchema = {
  body: joi
    .object()
    .keys({
      email: commonValidationFields.email.required(),
    })
    .required(),
};

export const resendForgetPasswordOTPSchema = {
  body: joi
    .object()
    .keys({
      email: commonValidationFields.email.required(),
    })
    .required(),
};

export const sendForgetPasswordEmailOTPSchema = {
  body: joi
    .object()
    .keys({
      email: commonValidationFields.email.required(),
    })
    .required(),
};

export const verifyForgetPasswordSchema = {
  body: joi
    .object()
    .keys({
      email: commonValidationFields.email.required(),
      otp: commonValidationFields.OTP.required(),
    })
    .required(),
};

export const resetForgetPasswordSchema = {
  body: joi
    .object()
    .keys({
      email: commonValidationFields.email.required(),
      otp: commonValidationFields.OTP.required(),
      password: commonValidationFields.password.required(),
      confirmPassword: joi.string().valid(joi.ref("password")).required(),
    })
    .required(),
};
