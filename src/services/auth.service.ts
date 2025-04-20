import { StatusCodesEnum } from "../enum/status-codes.enum";
import { ApiError } from "../error/api.error";
import { IAuth } from "../interfaces/auth.interface";
import { ITokenPair } from "../interfaces/token.interface";
import { IUser, IUserCreateDTO } from "../interfaces/user.interface";
import { tokenRepository } from "../repository/token.repository";
import { userRepository } from "../repository/user.repository";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";
import { userService } from "./user.service";

class AuthService {
    public async signUp(
        user: IUserCreateDTO,
    ): Promise<{ user: IUser; tokens: ITokenPair }> {
        await userService.isEmailUnique(user.email); //перевіряємо щоб в бд не існувало користувача з таким імейлом
        const password = await passwordService.hashPassword(user.password); //якщо користувача з таким імейл
        // не існує - хешуємо його пароль
        //створюємо нового користувача: передаємо все, що є в юзера і перезаписуємо пароль:
        const newUser = await userRepository.create({ ...user, password });
        // генеруємо токени для користувача, кладемо туди пейлоад
        const tokens = tokenService.generateTokens({
            userId: newUser._id,
            role: newUser.role,
        });
        //зберігаємо токени в бд
        await tokenRepository.create({ ...tokens, _userId: newUser._id });
        return { user: newUser, tokens };
    }
    public async singIn(
        dto: IAuth,
    ): Promise<{ user: IUser; tokens: ITokenPair }> {
        const user = await userRepository.getByEmail(dto.email);
        const isValidPassword = await passwordService.comparePassword(
            dto.password,
            user.password,
        );
        if (!isValidPassword) {
            throw new ApiError(
                "Invalid email or password",
                StatusCodesEnum.UNAUTHORIZED,
            );
        }
        const tokens = tokenService.generateTokens({
            userId: user._id,
            role: user.role,
        });
        await tokenRepository.create({ ...tokens, _userId: user._id });
        return { user, tokens };
    }
}
export const authService = new AuthService();
