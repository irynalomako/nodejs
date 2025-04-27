import { model, Schema } from "mongoose";

import { RoleEnum } from "../enum/role.enum";
import { IUser } from "../interfaces/user.interface";
//також потрібно присвоїти ролі, для цього потрібно створити enum, який буде їх характеризувати
const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, unique: true },
        role: {
            enum: RoleEnum,
            type: String,
            required: true,
            default: RoleEnum.USER,
        },
        name: { type: String, required: true },
        surname: { type: String, required: true },
        age: { type: Number, required: true },
        isActive: { type: Boolean, default: false },
        //створюємо 2 додаткових поля (юзера не видаляють із бази, а тільки помічають на видалення)
        isDeleted: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false },
);
export const User = model<IUser>("user", userSchema);
