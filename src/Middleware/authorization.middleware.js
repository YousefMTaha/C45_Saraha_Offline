import { ForbiddenException } from "../Common/Response/response.js";

export function authorization(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return ForbiddenException("Cannot access this API");
    }
    next();
  };
}
