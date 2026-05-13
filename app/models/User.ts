import { Schema, models, model } from "mongoose";

export interface IUser {
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

  },
  {
    timestamps: true,
  }
);

/**
 * Prevent model overwrite error in Next.js (hot reload)
 */
const User = models.User || model<IUser>("User", UserSchema);

export default User;
