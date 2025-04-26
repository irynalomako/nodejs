//для відновлення пароля користувач надсилає імейл, який потрібно провалідувати
import joi from "joi";

export class RecoveryValidator {
    private static emailField = joi.string().email();
    public static emailSchema = joi.object({
        email: this.emailField.required(),
    });
}
