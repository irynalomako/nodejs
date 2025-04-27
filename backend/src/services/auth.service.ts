import { config } from "../configs/config";
import { emailConstants } from "../constants/email.constants";
import { ActionTokenTypeEnum } from "../enum/action-token-type.enum";
import { EmailEnum } from "../enum/email.enum";
import { StatusCodesEnum } from "../enum/status-codes.enum";
import { ApiError } from "../error/api.error";
import { IAuth } from "../interfaces/auth.interface";
import { ITokenPair } from "../interfaces/token.interface";
import { IUser, IUserCreateDTO } from "../interfaces/user.interface";
import { tokenRepository } from "../repository/token.repository";
import { userRepository } from "../repository/user.repository";
import { emailService } from "./email.service";
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
        const token = tokenService.generateActionToken(
            { userId: newUser._id, role: newUser.role },
            ActionTokenTypeEnum.ACTIVATE,
        );
        await emailService.sendMail(
            newUser.email,
            emailConstants[EmailEnum.ACTIVATE],
            {
                name: newUser.name,
                url: `${config.FRONTEND_URL}/activate/${token}`,
            },
        );
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
        if (!user.isActive) {
            throw new ApiError(
                "Account is not active",
                StatusCodesEnum.FORBIDDEN,
            );
        }
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
    public async activate(token: string): Promise<IUser> {
        const { userId } = tokenService.verifyToken(
            token,
            ActionTokenTypeEnum.ACTIVATE,
        );
        //після перевірки токена повертаємо користувача з оновленою частинкою isActive
        return await userService.updateById(userId, { isActive: true });
    }
    public async recoveryPasswordRequest(user: IUser): Promise<void> {
        const token = tokenService.generateActionToken(
            {
                userId: user._id,
                role: user.role,
            },
            ActionTokenTypeEnum.RECOVERY,
        );
        const url = `${config.FRONTEND_URL}/recovery/${token}`;
        await emailService.sendMail(
            user.email,
            emailConstants[EmailEnum.RECOVERY],
            {
                url,
            },
        );
    }
    public async recoveryPassword(
        token: string,
        password: string,
    ): Promise<IUser> {
        const { userId } = tokenService.verifyToken(
            token,
            ActionTokenTypeEnum.RECOVERY,
        );
        const hashedPassword = await passwordService.hashPassword(password);
        return await userService.updateById(userId, {
            password: hashedPassword,
        });
    }
}
export const authService = new AuthService();
