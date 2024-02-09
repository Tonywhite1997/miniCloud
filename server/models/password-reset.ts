import { Schema, Document, model } from "mongoose";

interface RESET_PASSWORD extends Document {
  resetToken: string;
  expiredAt: Date;
}

const passwordResetSchema: Schema<RESET_PASSWORD> = new Schema<RESET_PASSWORD>({
  email: {
    type: String,
    required: true,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
});

const PasswordReset = model("passwordReset", passwordResetSchema);
module.exports = PasswordReset;
