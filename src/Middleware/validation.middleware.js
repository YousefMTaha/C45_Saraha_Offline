import joi from "joi";
import { BadRequestException } from "../Common/Response/response.js";
import { UserEnum } from "../Common/Enums/user.enum.js";
import { Types } from "mongoose";

export function validation(schema) {
  return (req, res, next) => {
    let validationErrs = [];

    for (const key of Object.keys(schema)) {
      const validateResult = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (validateResult.error?.details.length > 0) {
        validationErrs.push(validateResult.error);
      }

      console.log({ "validateResult.value": validateResult.value });

      req["v" + key] = validateResult.value;
    }

    if (validationErrs.length > 0) {
      return BadRequestException("validation Err:", validationErrs);
    }

    next();
  };
}

export const commonValidationFields = {
  userName: joi
    .string()
    .pattern(new RegExp(/^[A-Z][a-z]{2,24}\s[A-Z][a-z]{2,24}$/))
    .messages({
      "any.required": "username is required",
    }),
  // email: joi
  //   .string()
  //   .pattern(
  //     new RegExp(
  //       /^[a-zA-Z]\w{1,20}@(gmail|outlook|icloud)(.com|.eg|.edu){1,3}$/,
  //     ),
  //   )
  //   .trim()
  //   .messages({
  //     "string.pattern.base":
  //       "Email must be start with letter / allowed domain(gmail|outlook|icloud) / tls(.com|.eg|.edu)(max 3 partitions)",
  //   }),
  email: joi.string().trim(),
  password: joi
    .string()
    .pattern(new RegExp(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{8,16}/)),
  confirmPassword: joi.string().valid(joi.ref("password")),
  gender: joi.string().valid(...Object.values(UserEnum)),
  DOB: joi.date(),
  phone: joi
    .string()
    .pattern(new RegExp(/^(01|00201|\+201)(0|1|2|5)[0-9]{8}$/)),

  OTP: joi.number().min(100000).max(999999),
  id: joi.string().custom(validateObjectId),
  // OTP: joi.string().pattern(new RegExp(/\d{6}/)),
};

export function validateObjectId(value, helpers) {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.message("invalid objectId format");
  }
}
