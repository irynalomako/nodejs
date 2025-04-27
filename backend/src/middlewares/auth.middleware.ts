import { NextFunction, Request, Response } from "express";

import { RoleEnum } from "../enum/role.enum";
import { StatusCodesEnum } from "../enum/status-codes.enum";
import { TokenTypeEnum } from "../enum/token-type.enum";
import { ApiError } from "../error/api.error";
import { IRefresh, ITokenPayload } from "../interfaces/token.interface";
import { tokenService } from "../services/token.service";
import { userService } from "../services/user.service";

class AuthMiddleware {
    public async checkAccessToken(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const authorizationHeader = req.headers.authorization;
            //перевіряємо, чи в хедері є токен
            if (!authorizationHeader) {
                throw new ApiError(
                    "No token provided",
                    StatusCodesEnum.UNAUTHORIZED,
                );
            }
            //токен найчастіше передають зі словом Bearer dkfjvndkjfh(наш токен),
            //тому звертаємось до authorizationHeader, сплітуємо по пробілу і забираємо
            //останній елемент
            const accessToken = authorizationHeader.split(" ")[1];

            if (!accessToken) {
                throw new ApiError(
                    "No token provided",
                    StatusCodesEnum.UNAUTHORIZED,
                );
            }
            //верифікуємо токен і повертаємо пейлоад
            const tokenPayload = tokenService.verifyToken(
                accessToken,
                TokenTypeEnum.ACCESS,
            );
            const isTokenExist = await tokenService.isTokenExists(
                accessToken,
                TokenTypeEnum.ACCESS,
            );
            if (!isTokenExist) {
                throw new ApiError(
                    "Invalid Token",
                    StatusCodesEnum.UNAUTHORIZED,
                );
            }
            //перевіряємо чи користувач є активним, в противному випадку забороняється логінація
            const isActive = await userService.isActive(tokenPayload.userId);

            if (!isActive) {
                throw new ApiError(
                    "Account is not active",
                    StatusCodesEnum.FORBIDDEN,
                );
            }
            //зберігаємо токенпейлоад, щоб він був доступний не тільки в цій мідлварі
            //щоб зберегти дані, які будуть вжиті тільки один запит, використовуємо сховище:
            req.res.locals.tokenPayload = tokenPayload;

            next();
        } catch (e) {
            next(e);
        }
    }
    public async checkRefreshToken(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { refreshToken } = req.body as IRefresh;

            if (!refreshToken) {
                throw new ApiError(
                    "No refresh token provided",
                    StatusCodesEnum.FORBIDDEN,
                );
            }
            const tokenPayload = tokenService.verifyToken(
                refreshToken,
                TokenTypeEnum.REFRESH,
            );
            const isTokenExist = tokenService.isTokenExists(
                refreshToken,
                TokenTypeEnum.REFRESH,
            );
            if (!isTokenExist) {
                throw new ApiError("Invalid token", StatusCodesEnum.FORBIDDEN);
            }
            res.locals.tokenPayload = tokenPayload;
            next();
        } catch (e) {
            next(e);
        }
    }
    public isAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { role } = req.res.locals.tokenPayload as ITokenPayload;

            if (role !== RoleEnum.ADMIN) {
                throw new ApiError(
                    "Has no permission",
                    StatusCodesEnum.FORBIDDEN,
                );
            }
            next();
        } catch (e) {
            next(e);
        }
    }
}
export const authMiddleware = new AuthMiddleware();
