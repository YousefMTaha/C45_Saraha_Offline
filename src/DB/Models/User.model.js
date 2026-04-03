import mongoose from "mongoose";
import { Provider, UserEnum, UserRole } from "../../Common/Enums/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider == Provider.system;
      },
    },
    gender: {
      type: String,
      enum: Object.values(UserEnum),
      default: UserEnum.male,
    },
    DOB: Date,

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.user,
    },

    phone: String,

    provider: {
      type: String,
      enum: Object.values(Provider),
      default: Provider.system,
    },

    profilePic: String,
    coverPics: [String],
    confirmEmail: {
      type: Boolean,
      default: false,
    },

    changeCreditTime: Date,
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
