import { EmailEnum } from "../enum/email.enum";

type IEmailData = {
    subject: string;
    template: string;
};
type IEmailConstants<T extends Record<string, string>> = {
    [K in keyof T]: IEmailData;
};

export const emailConstants: IEmailConstants<typeof EmailEnum> = {
    [EmailEnum.WELCOME]: {
        subject: "Welcome",
        template: "welcome",
    },
    [EmailEnum.ACTIVATE]: {
        subject: "Activate account",
        template: "activate",
    },
    [EmailEnum.RECOVERY]: {
        subject: "Recovery",
        template: "recovery",
    },
};

export type { IEmailConstants, IEmailData };
