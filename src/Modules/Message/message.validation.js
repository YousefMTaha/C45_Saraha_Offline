import joi from "joi";
import { commonValidationFields } from "../../Middleware/validation.middleware.js";

export const sendMsgSchema = {
  params: joi
    .object({})
    .keys({
      receiverId: commonValidationFields.id.required(),
    })
    .required(),
  body: joi.object({}).keys({
    content: joi.string().min(3).max(1000),
  }),
};

export const getMsgByIdSchema = {
  params: joi
    .object({})
    .keys({
      messageId: commonValidationFields.id.required(),
    })
    .required(),
};
export const deleteMsgSchema = {
  params: joi
    .object({})
    .keys({
      messageId: commonValidationFields.id.required(),
    })
    .required(),
};
