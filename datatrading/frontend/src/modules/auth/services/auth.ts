import { get, post } from '@/shared/utils/request';

export interface CaptchaResponse {
    captchaId: string;
    imageBase64: string;
}

export interface LoginPayload {
    username: string;
    password: string;
    captcha: string;
    captchaId: string;
}

export const getCaptcha = async () => {
    return get<CaptchaResponse>(`auth/captcha?t=${new Date().getTime()}`, { silentError: true })
        .then((res) => ({
            captchaId: res.captchaId,
            image: `data:image/png;base64,${res.imageBase64}`,
        }));
};

export const login = async (data: LoginPayload) => {
    return post<Record<string, unknown>>('auth/login', {
        username: data.username,
        password: data.password,
        captcha: data.captcha,
        captchaId: data.captchaId,
    });
};

export const logout = async () => {
    return post<void>('auth/logout');
};
