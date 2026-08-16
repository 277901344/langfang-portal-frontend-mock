import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Image as ImageIcon, Lock, Phone, RefreshCw, User, X } from 'lucide-react';
import {
  checkPhone,
  checkUsername,
  getCaptcha,
  register,
  type CaptchaData,
} from '../lib/auth';
import { md5 } from '../lib/crypto';
import { useAuth } from '../context/AuthContext';
import { writeStoredUsername } from '../lib/session';
import { AuthShell } from '../components/AuthShell';

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;
const PHONE_REGEX = /^1[3-9]\d{9}$/;

type FieldErrors = Partial<Record<'username' | 'phone' | 'password' | 'confirmPassword' | 'captchaCode', string>>;

function buildCaptchaSrc(imageBase64: string) {
  return imageBase64.startsWith('data:image')
    ? imageBase64
    : `data:image/svg+xml;base64,${imageBase64}`;
}

export default function Register() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const usernameCheckSeqRef = useRef(0);
  const phoneCheckSeqRef = useRef(0);
  const redirectTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, setAuthenticatedUser } = useAuth();

  const loginRegisteredUser = () => {
    const currentUsername = username.trim() || 'demotest';
    const registeredUser = {
      id: Date.now(),
      username: currentUsername,
      displayName: currentUsername,
      authStatus: 0,
      accountRole: 'portal-user',
      accountStatus: 'ACTIVE',
      lastLoginTime: new Date().toISOString(),
    };
    setAuthenticatedUser(registeredUser);
  };

  const loadCaptcha = async () => {
    setIsLoadingCaptcha(true);
    try {
      const nextCaptcha = await getCaptcha();
      setCaptcha(nextCaptcha);
      setCaptchaCode('');
      setErrors((current) => ({ ...current, captchaCode: '' }));
    } catch (error) {
      setCaptcha(null);
      setSubmitError(error instanceof Error ? error.message : '验证码加载失败，请稍后重试');
    } finally {
      setIsLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isRegisterSuccess) {
      navigate('/', { replace: true });
      return;
    }
    if (!isAuthenticated) {
      void loadCaptcha();
    }
  }, [isAuthenticated, isRegisterSuccess, navigate]);

  useEffect(() => () => {
    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current);
    }
  }, []);

  const setFieldError = (field: keyof FieldErrors, message: string) => {
    setErrors((current) => ({ ...current, [field]: message }));
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }
      return { ...current, [field]: '' };
    });
  };

  const validateUsername = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setFieldError('username', '请输入用户名');
      return false;
    }
    if (trimmedUsername.length < 4 || trimmedUsername.length > 20) {
      setFieldError('username', '用户名长度必须在4到20个字符之间');
      return false;
    }

    const currentSeq = ++usernameCheckSeqRef.current;
    setIsCheckingUsername(true);
    try {
      const result = await checkUsername(trimmedUsername);
      if (currentSeq !== usernameCheckSeqRef.current) {
        return false;
      }
      if (result.exists) {
        setFieldError('username', '账号名称已存在');
        return false;
      }
      clearFieldError('username');
      return true;
    } catch {
      if (currentSeq === usernameCheckSeqRef.current) {
        setFieldError('username', '用户名校验失败，请稍后重试');
      }
      return false;
    } finally {
      if (currentSeq === usernameCheckSeqRef.current) {
        setIsCheckingUsername(false);
      }
    }
  };

  const validatePhone = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setFieldError('phone', '请输入手机号');
      return false;
    }
    if (!PHONE_REGEX.test(trimmedPhone)) {
      setFieldError('phone', '请输入合法的手机号');
      return false;
    }

    const currentSeq = ++phoneCheckSeqRef.current;
    setIsCheckingPhone(true);
    try {
      const result = await checkPhone(trimmedPhone);
      if (currentSeq !== phoneCheckSeqRef.current) {
        return false;
      }
      if (result.exists) {
        setFieldError('phone', '手机号已被其他账号绑定');
        return false;
      }
      clearFieldError('phone');
      return true;
    } catch {
      if (currentSeq === phoneCheckSeqRef.current) {
        setFieldError('phone', '手机号校验失败，请稍后重试');
      }
      return false;
    } finally {
      if (currentSeq === phoneCheckSeqRef.current) {
        setIsCheckingPhone(false);
      }
    }
  };

  const validatePasswords = () => {
    let valid = true;
    if (!password) {
      setFieldError('password', '请输入密码');
      valid = false;
    } else if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
      setFieldError('password', '密码需为8-20位，且包含大写字母、小写字母、数字、特殊字符');
      valid = false;
    } else {
      clearFieldError('password');
    }

    if (!confirmPassword) {
      setFieldError('confirmPassword', '请确认密码');
      valid = false;
    } else if (confirmPassword !== password) {
      setFieldError('confirmPassword', '两次输入的密码不一致');
      valid = false;
    } else {
      clearFieldError('confirmPassword');
    }
    return valid;
  };

  const validateConfirmPasswordValue = (
    nextPassword: string,
    nextConfirmPassword: string,
    shouldShowError = confirmPasswordTouched,
  ) => {
    if (!shouldShowError) {
      return;
    }

    if (!nextConfirmPassword) {
      clearFieldError('confirmPassword');
      return;
    }

    if (nextConfirmPassword !== nextPassword) {
      setFieldError('confirmPassword', '两次输入的密码不一致');
      return;
    }

    clearFieldError('confirmPassword');
  };

  const validateCaptcha = () => {
    if (!captchaCode.trim()) {
      setFieldError('captchaCode', '请输入验证码');
      return false;
    }
    clearFieldError('captchaCode');
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');

    if (!captcha?.captchaId) {
      setSubmitError('验证码尚未准备好，请刷新后重试');
      return;
    }

    const [usernameValid, phoneValid] = await Promise.all([
      validateUsername(),
      validatePhone(),
    ]);
    const passwordValid = validatePasswords();
    const captchaValid = validateCaptcha();
    if (!usernameValid || !phoneValid || !passwordValid || !captchaValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        username: username.trim(),
        phone: phone.trim(),
        password: md5(password),
        confirmPassword: md5(confirmPassword),
        captchaCode: captchaCode.trim(),
        captchaId: captcha.captchaId,
      });
      writeStoredUsername(username.trim());
      setIsRegisterSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '注册失败，请稍后重试');
      void loadCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthShell title="注册账号">
        <form className="space-y-3" onSubmit={handleSubmit}>
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
                className="block h-10 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-16 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-shadow"
                placeholder="请输入用户名"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  clearFieldError('username');
                }}
                onBlur={() => void validateUsername()}
              />
              {isCheckingUsername ? (
                <span className="absolute inset-y-0 right-3 flex items-center text-[11px] text-slate-400">检测中</span>
              ) : null}
            </div>
            {errors.username ? <p className="mt-1 text-[11px] text-red-500">{errors.username}</p> : null}
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
                className="block h-10 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-shadow"
                placeholder="设置登录密码"
                value={password}
                onChange={(event) => {
                  const nextPassword = event.target.value;
                  setPassword(nextPassword);
                  clearFieldError('password');
                  validateConfirmPasswordValue(nextPassword, confirmPassword);
                }}
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
            {errors.password ? <p className="mt-1 text-[11px] text-red-500">{errors.password}</p> : null}
          </div>

          {/* 确认密码 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 mb-1.5">
              确认密码
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-4 h-4 text-blue-500" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="block h-10 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-shadow"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(event) => {
                  const nextConfirmPassword = event.target.value;
                  setConfirmPassword(nextConfirmPassword);
                  validateConfirmPasswordValue(password, nextConfirmPassword, false);
                }}
                onBlur={() => {
                  setConfirmPasswordTouched(true);
                  validateConfirmPasswordValue(password, confirmPassword, true);
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-blue-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword ? <p className="mt-1 text-[11px] text-red-500">{errors.confirmPassword}</p> : null}
          </div>

          {/* 手机号 */}
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1.5">
              手机号
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="w-4 h-4 text-blue-500" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="block h-10 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-16 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-shadow"
                placeholder="请输入手机号"
                value={phone}
                maxLength={11}
                onChange={(event) => {
                  setPhone(event.target.value);
                  clearFieldError('phone');
                }}
                onBlur={() => void validatePhone()}
              />
              {isCheckingPhone ? (
                <span className="absolute inset-y-0 right-3 flex items-center text-[11px] text-slate-400">检测中</span>
              ) : null}
            </div>
            {errors.phone ? <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p> : null}
          </div>

          {/* 验证码 */}
          <div>
            <label htmlFor="captcha" className="block text-xs font-bold text-slate-700 mb-1.5">
              验证码
            </label>
            <div className="grid grid-cols-[1fr_132px] gap-3">
              <input
                id="captcha"
                name="captcha"
                type="text"
                className="block h-10 w-full rounded-xl border border-slate-200/80 bg-white px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-shadow"
                placeholder="请输入验证码"
                value={captchaCode}
                onChange={(event) => {
                  setCaptchaCode(event.target.value);
                  clearFieldError('captchaCode');
                }}
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
            {errors.captchaCode ? <p className="mt-1 text-[11px] text-red-500">{errors.captchaCode}</p> : null}
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

          {/* 错误提示 */}
          {submitError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600"
            >
              {submitError}
            </div>
          ) : null}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCaptcha || isCheckingUsername || isCheckingPhone}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '提交中...' : '注 册'}
          </button>
        </form>

        {/* 登录链接 */}
        <div className="mt-4 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          已有账号？{' '}
          <Link to="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
            立即登录
          </Link>
        </div>
      </AuthShell>

      {/* 注册成功 - 实名认证合规引导 Modal */}
      {isRegisterSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            {/* 允许暂时退出 X 按钮 */}
            <button
              type="button"
              onClick={() => {
                loginRegisteredUser();
                navigate('/', { replace: true });
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              title="暂不认证，返回首页"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 图标 */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 border border-emerald-200 mb-4 shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            {/* 提示主标题 */}
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              注册成功！请完成实名认证
            </h3>

            {/* 副标题 */}
            <p className="mt-2.5 text-xs md:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              根据国家合规要求，使用核心功能前需完成实名身份核验。
            </p>

            {/* 按钮区域 */}
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  loginRegisteredUser();
                  navigate('/platform/service/identity');
                }}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                立即实名认证
              </button>

              <button
                type="button"
                onClick={() => {
                  loginRegisteredUser();
                  navigate('/', { replace: true });
                }}
                className="flex h-10 w-full items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-medium text-xs transition-all cursor-pointer"
              >
                暂不认证，稍后处理
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
