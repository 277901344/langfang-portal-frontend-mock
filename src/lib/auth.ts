export interface CaptchaData {
  captchaId: string;
  imageBase64: string;
}

export interface AuthUser {
  id?: number;
  username?: string;
  createTime?: string;
  updateTime?: string;
  authStatus?: number;
  authType?: number;
  displayName?: string;
  accountRole?: string;
  accountStatus?: string;
  lastLoginTime?: string;
  avatarUrl?: string;
  accountType?: number;
  roleLevel?: number;
}

export interface RuntimeConfigResponse {
  customerCode?: string;
  profile?: string;
  config?: Record<string, unknown>;
}

export interface LoginPayload {
  username: string;
  password: string;
  captcha: string;
  captchaId: string;
}

export interface SmsSendCodePayload {
  username: string;
  password: string;
}

export interface SmsLoginPayload {
  username: string;
  password: string;
  smsCode: string;
}

export interface SmsSendCodeResponse {
  requestId?: string;
  phoneMasked?: string;
  expireSeconds?: number;
  resendIntervalSeconds?: number;
}

export interface RegisterPayload {
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  captchaCode: string;
  captchaId: string;
}

export interface UsernameCheckResponse {
  exists: boolean;
  available?: boolean;
}

const MOCK_USER: AuthUser = {
  id: 10001,
  username: 'demo',
  displayName: '演示用户',
  authStatus: 1,
  authType: 1,
  accountRole: 'portal-user',
  accountStatus: 'ACTIVE',
  accountType: 1,
  roleLevel: 1,
  createTime: '2026-07-01 09:00:00',
  updateTime: '2026-08-01 18:00:00',
  lastLoginTime: '2026-08-02 21:00:00',
};

const REGISTERED_USERNAMES = new Set(['admin', 'demo', 'test']);
const REGISTERED_PHONES = new Set(['13800000000', '13900000000']);

function delay<T>(data: T, ms = 180) {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(data), ms);
  });
}

function buildCaptchaSvg(code: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="132" height="40" viewBox="0 0 132 40">
      <rect width="132" height="40" rx="8" fill="#ecfeff"/>
      <path d="M8 30 C34 6, 65 42, 124 12" fill="none" stroke="#67e8f9" stroke-width="2"/>
      <path d="M12 12 L120 30" stroke="#99f6e4" stroke-width="1.5" opacity="0.8"/>
      <text x="66" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0f766e" letter-spacing="5">${code}</text>
    </svg>
  `;
  return window.btoa(unescape(encodeURIComponent(svg)));
}

export async function getCaptcha() {
  return delay<CaptchaData>({
    captchaId: `mock-captcha-${Date.now()}`,
    imageBase64: buildCaptchaSvg('1234'),
  });
}

export async function getRuntimeConfig() {
  return delay<RuntimeConfigResponse>({
    customerCode: 'langfang-mock',
    profile: 'mock',
    config: {
      auth: {
        loginMode: 0,
      },
    },
  });
}

export async function login(payload: LoginPayload) {
  if (!payload.username.trim()) {
    throw new Error('请输入用户名');
  }
  if (!payload.password.trim()) {
    throw new Error('请输入密码');
  }
  if (!payload.captcha.trim()) {
    throw new Error('请输入验证码');
  }
  return delay<AuthUser>({
    ...MOCK_USER,
    username: payload.username.trim(),
    displayName: payload.username.trim() === 'demo' ? '演示用户' : payload.username.trim(),
    lastLoginTime: new Date().toISOString(),
  });
}

export async function sendSmsCode(_payload: SmsSendCodePayload) {
  return delay<SmsSendCodeResponse>({
    requestId: `mock-sms-${Date.now()}`,
    phoneMasked: '138****0000',
    expireSeconds: 300,
    resendIntervalSeconds: 60,
  });
}

export async function smsLogin(payload: SmsLoginPayload) {
  if (!payload.smsCode.trim()) {
    throw new Error('请输入短信验证码');
  }
  return delay<AuthUser>({
    ...MOCK_USER,
    username: payload.username.trim() || 'demo',
    lastLoginTime: new Date().toISOString(),
  });
}

export async function logout() {
  return delay<void>(undefined, 80);
}

export async function getCurrentUser() {
  return delay<AuthUser>(MOCK_USER, 120);
}

export async function getSpSsoLaunchUrl(target?: string) {
  return delay<{ launchUrl: string }>({
    launchUrl: target || '/',
  });
}

export async function register(payload: RegisterPayload) {
  const username = payload.username.trim();
  if (!username) {
    throw new Error('请输入用户名');
  }
  REGISTERED_USERNAMES.add(username.toLowerCase());
  REGISTERED_PHONES.add(payload.phone.trim());
  return delay<{ userId: number; username: string }>({
    userId: Date.now(),
    username,
  });
}

export async function checkUsername(username: string) {
  const exists = REGISTERED_USERNAMES.has(username.trim().toLowerCase());
  return delay<UsernameCheckResponse>({
    exists,
    available: !exists,
  }, 120);
}

export async function checkPhone(phone: string) {
  const exists = REGISTERED_PHONES.has(phone.trim());
  return delay<UsernameCheckResponse>({
    exists,
    available: !exists,
  }, 120);
}
