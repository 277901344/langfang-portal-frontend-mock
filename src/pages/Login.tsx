import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Image as ImageIcon, Lock, MessageSquare, RefreshCw, User } from 'lucide-react';
import { getCaptcha, login, sendSmsCode, smsLogin, type CaptchaData } from '../lib/auth';
import { md5 } from '../lib/crypto';
import { useAuth } from '../context/AuthContext';
import {
  normalizeReturnTo,
  resolveProtectedAction,
  resolveProtectedDestination,
} from '../lib/protectedActions';
// import { getRuntimeFrontendConfig, getRuntimeNumber } from '../lib/runtimeConfig';
import { readStoredUsername, writeStoredUsername } from '../lib/session';
import { AuthShell } from '../components/AuthShell';

function buildCaptchaSrc(imageBase64: string) {
  return imageBase64.startsWith('data:image')
    ? imageBase64
    : `data:image/svg+xml;base64,${imageBase64}`;
}

export default function Login() {
  const [username, setUsername] = useState(readStoredUsername);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingSmsCode, setIsSendingSmsCode] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState('');
  const handledRedirectRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setAuthenticatedUser } = useAuth();
  // const runtimeFrontendConfig = getRuntimeFrontendConfig();
  // const loginModeValue = getRuntimeNumber(runtimeFrontendConfig, 'auth.loginMode', 0);
  // const isSmsLoginMode = loginModeValue === 1;
  // const isPasswordMode = !isSmsLoginMode;
  
  // 暂时强制使用图片验证码模式，短信服务待接入
  const isPasswordMode = true;
  const loadCaptcha = async () => {
    setIsLoadingCaptcha(true);

    try {
      const nextCaptcha = await getCaptcha();
      setCaptcha(nextCaptcha);
      setCaptchaCode('');
    } catch (error) {
      setCaptcha(null);
      setSubmitError(error instanceof Error ? error.message : '验证码加载失败，请稍后重试');
    } finally {
      setIsLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && isPasswordMode) {
      void loadCaptcha();
      return;
    }
    setCaptcha(null);
    setCaptchaCode('');
  }, [isAuthenticated, isPasswordMode]);

  useEffect(() => {
    if (!isAuthenticated || handledRedirectRef.current) {
      return;
    }

    handledRedirectRef.current = true;

    const params = new URLSearchParams(location.search);
    const action = resolveProtectedAction(params.get('action'));
    const returnTo = normalizeReturnTo(params.get('returnTo'));
    navigate(resolveProtectedDestination(action, returnTo), { replace: true });
  }, [isAuthenticated, location.search, navigate]);

  useEffect(() => {
    if (countdownSeconds <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setCountdownSeconds((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [countdownSeconds]);

  const handleSendSmsCode = async () => {
    const trimmedUsername = username.trim();
    setSubmitError('');
    setSuccessMessage('');

    if (!trimmedUsername) {
      setSubmitError('请输入用户名');
      return;
    }
    if (!password.trim()) {
      setSubmitError('请输入密码');
      return;
    }

    setIsSendingSmsCode(true);
    try {
      const response = await sendSmsCode({
        username: trimmedUsername,
        password: md5(password),
      });
      setMaskedPhone(response.phoneMasked || '');
      setCountdownSeconds(Math.max(1, response.resendIntervalSeconds || 60));
      setSuccessMessage(response.phoneMasked ? `验证码已发送至 ${response.phoneMasked}` : '验证码发送成功');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '验证码发送失败，请稍后重试');
    } finally {
      setIsSendingSmsCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    setSubmitError('');
    setSuccessMessage('');

    if (!trimmedUsername) {
      setSubmitError('请输入用户名');
      return;
    }

    if (!password.trim()) {
      setSubmitError('请输入密码');
      return;
    }

    if (isPasswordMode) {
      if (!captchaCode.trim()) {
        setSubmitError('请输入验证码');
        return;
      }

      if (!captcha?.captchaId) {
        setSubmitError('验证码尚未准备好，请刷新后重试');
        return;
      }
    } else if (!smsCode.trim()) {
      setSubmitError('请输入短信验证码');
      return;
    }

    setIsSubmitting(true);

    try {
      const encryptedPassword = md5(password);
      const user = isPasswordMode
        ? await login({
          username: trimmedUsername,
          password: encryptedPassword,
          captcha: captchaCode.trim(),
          captchaId: captcha!.captchaId,
        })
        : await smsLogin({
          username: trimmedUsername,
          password: encryptedPassword,
          smsCode: smsCode.trim(),
        });

      writeStoredUsername(trimmedUsername);
      setAuthenticatedUser(user);
      setSuccessMessage('登录成功，正在跳转');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '登录失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
      if (isPasswordMode) {
        void loadCaptcha();
      }
    }
  };

  return (
    <AuthShell title="账号登录">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* 用户名 */}
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-700 mb-1.5">
                用户名
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="block h-10 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-shadow"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5">
                密码
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="w-4 h-4 text-blue-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block h-10 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-shadow"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-blue-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 验证码模式切换 */}
            {isPasswordMode ? (
              <div>
                <label htmlFor="captcha" className="block text-xs font-bold text-slate-700 mb-1.5">
                  验证码
                </label>
                <div className="grid grid-cols-[1fr_132px] gap-3">
                  <input
                    id="captcha"
                    name="captcha"
                    type="text"
                    required
                    className="block h-10 w-full rounded-xl border border-slate-200/80 bg-white px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-shadow"
                    placeholder="请输入验证码"
                    value={captchaCode}
                    onChange={(event) => setCaptchaCode(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => void loadCaptcha()}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isLoadingCaptcha}
                  >
                    {captcha?.imageBase64 ? (
                      <img
                        src={buildCaptchaSrc(captcha.imageBase64)}
                        alt="验证码"
                        className="h-7 w-full rounded-md object-cover"
                      />
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span>加载中</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void loadCaptcha()}
                  className="mt-2 inline-flex items-center text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  disabled={isLoadingCaptcha}
                >
                  <RefreshCw className={`mr-1 w-3.5 h-3.5 ${isLoadingCaptcha ? 'animate-spin' : ''}`} />
                  看不清？换一张
                </button>
              </div>
            ) : (
              <div>
                <label htmlFor="smsCode" className="block text-xs font-bold text-slate-700 mb-1.5">
                  短信验证码
                </label>
                <div className="grid grid-cols-[1fr_132px] gap-3">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                    </div>
                    <input
                      id="smsCode"
                      name="smsCode"
                      type="text"
                      required
                      className="block h-10 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-shadow"
                      placeholder="请输入短信验证码"
                      value={smsCode}
                      onChange={(event) => setSmsCode(event.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSendSmsCode()}
                    className="flex h-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSendingSmsCode || countdownSeconds > 0}
                  >
                    {countdownSeconds > 0 ? `${countdownSeconds}s后重发` : isSendingSmsCode ? '发送中...' : '获取验证码'}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {maskedPhone ? `验证码已发送至 ${maskedPhone}` : '验证码将发送到账号已绑定手机号'}
                </p>
              </div>
            )}

            {/* 错误/成功提示 */}
            {(submitError || successMessage) && (
              <div
                className={`rounded-xl border px-4 py-3 text-xs ${
                  submitError
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                }`}
              >
                {submitError || successMessage}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isSubmitting || isLoadingCaptcha || isSendingSmsCode}
              className="flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? '提交中...' : '登 录'}
            </button>
          </form>

          {/* 注册链接 */}
          <div className="mt-4 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            还没有账号？{' '}
            <Link to="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700">
              注册新账号
            </Link>
          </div>
    </AuthShell>
  );
}
