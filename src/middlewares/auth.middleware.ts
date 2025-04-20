import { NextFunction, Request, Response } from "express";

import { StatusCodesEnum } from "../enum/status-codes.enum";
import { ApiError } from "../error/api.error";
import { IRefresh } from "../interfaces/token.interface";
import { tokenService } from "../services/token.service";
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
                "access",
            );
            const isTokenExist = await tokenService.isTokenExists(
                accessToken,
                "accessToken",
            );
            if (!isTokenExist) {
                throw new ApiError(
                    "Invalid Token",
                    StatusCodesEnum.UNAUTHORIZED,
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
                "refresh",
            );
            const isTokenExist = tokenService.isTokenExists(
                refreshToken,
                "refreshToken",
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
}
export const authMiddleware = new AuthMiddleware();
