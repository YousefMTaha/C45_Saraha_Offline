import joi from "joi";
import {
  commonValidationFields,
  validateObjectId,
} from "../../Middleware/validation.middleware.js";

export const profilePicSchema = {
  file: joi
    .object({})
    .keys({
      fieldname: joi.string().required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi.string().required(),
      finalDist: joi.string().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().required(),
    })
    .required(),
};

export const coverPicsSchema = {
  files: joi
    .array()
    .items(
      joi
        .object({})
        .keys({
          fieldname: joi.string().required(),
          originalname: joi.string().required(),
          encoding: joi.string().required(),
          mimetype: joi.string().required(),
          finalDist: joi.string().required(),
          destination: joi.string().required(),
          filename: joi.string().required(),
          path: joi.string().required(),
          size: joi.number().required(),
        })
        .required(),
    )
    .required(),
};

export const getAnotherProfileSchema = {
  params: joi
    .object({})
    .keys({
      profileId: joi.string().custom(validateObjectId).required(),
    })
    .required(),
};

export const updatePasswordSchema = {
  body: joi
    .object({})
    .keys({
      oldPassword: commonValidationFields.password.required(),
      newPassword: commonValidationFields.password.required(),
      confirmNewPassword: joi.string().valid(joi.ref("newPassword")).required(),
    })
    .required(),
};
