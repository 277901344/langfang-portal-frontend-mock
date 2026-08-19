import React from 'react';
import { Button, Checkbox, Form, Input, message, Modal } from 'antd';
import { KeyOutlined, LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { getAppConfig } from '@/config';
import { useQuery } from '@/shared/hooks/useQuery';
import { getCurrentAuthz } from '@/shared/services/authz';
import { useUserStore } from '@/store/useUserStore';
import { md5 } from '@/shared/utils/crypto';
import { resolveFirstAccessiblePath } from '@/shared/utils/navigation';
import { getCaptcha, login } from '../services/auth';

interface LoginFormValues {
    username: string;
    password: string;
    captcha: string;
    remember?: boolean;
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { setToken, setUserInfo, setAuthz } = useUserStore();
    const [form] = Form.useForm<LoginFormValues>();
    const [loginLoading, setLoginLoading] = React.useState(false);
    const { VITE_SPACE_NAME } = getAppConfig();
    const {
        data: captchaData,
        isLoading: captchaLoading,
        isError: captchaLoadError,
        refetch: refetchCaptcha,
    } = useQuery({
        queryKey: ['auth-captcha'],
        queryFn: getCaptcha,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
        retry: false,
    });

    React.useEffect(() => {
        const savedAuth = localStorage.getItem('loginParams');
        if (savedAuth) {
            try {
                const { username, password } = JSON.parse(decodeURIComponent(atob(savedAuth)));
                form.setFieldsValue({
                    username,
                    password,
                    remember: true,
                });
            } catch {
                localStorage.removeItem('loginParams');
            }
        }
    }, [form]);

    React.useEffect(() => {
        form.setFieldValue('captcha', '');
    }, [captchaData?.captchaId, form]);

    const handleFinish = async (values: LoginFormValues) => {
        setLoginLoading(true);
        try {
            const tokenKey = getAppConfig().VITE_AUTH_TOKEN_KEY || 'token';
            const response = await login({
                username: values.username,
                password: md5(values.password),
                captcha: values.captcha?.trim(),
                captchaId: captchaData?.captchaId || '',
            });
            const token = localStorage.getItem(tokenKey);

            if (token) {
                setToken(token);
            }

            const nextUserInfo = {
                id: Number(response?.id ?? response?.userId ?? 0),
                username: String(response?.username ?? values.username),
                displayName: response?.displayName ? String(response.displayName) : undefined,
                userIdentityCode: response?.userIdentityCode ? String(response.userIdentityCode) : undefined,
                subjectName: response?.subjectName ? String(response.subjectName) : undefined,
                accountType: Number(response?.accountType ?? 0),
                authStatus: Number(response?.authStatus ?? 0),
                authType: Number(response?.authType ?? 0),
            };
            setUserInfo(nextUserInfo);

            if (values.remember) {
                const authString = btoa(
                    encodeURIComponent(
                        JSON.stringify({
                            username: values.username,
                            password: values.password,
                        }),
                    ),
                );
                localStorage.setItem('loginParams', authString);
            } else {
                localStorage.removeItem('loginParams');
            }

            try {
                const authz = await getCurrentAuthz();
                setAuthz(authz.permissions || [], authz.menuModules || [], authz.roleCodes || []);
                if (authz.accountType != null || authz.subjectName || authz.userIdentityCode) {
                    setUserInfo({
                        ...nextUserInfo,
                        accountType: authz.accountType ?? nextUserInfo.accountType,
                        subjectName: authz.subjectName || nextUserInfo.subjectName,
                        userIdentityCode: authz.userIdentityCode || nextUserInfo.userIdentityCode,
                    });
                }
                const defaultPath = resolveFirstAccessiblePath(authz.menuModules || []);
                message.success('登录成功');
                navigate(defaultPath, { replace: true });
            } catch {
                setAuthz([], [], []);
                message.success('登录成功');
                navigate('/', { replace: true });
            }
        } catch {
            form.setFieldValue('captcha', '');
            refetchCaptcha();
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f3f7ff] text-slate-900">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_52%,_#f7f9fe_100%)]" />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 lg:px-10">
                <div className="w-full max-w-[500px]">
                    <section className="overflow-hidden rounded-[20px] border border-white/85 bg-white shadow-[0_28px_72px_rgba(15,23,42,0.14)]">
                        <div className="border-b border-slate-100 bg-[linear-gradient(180deg,_rgba(249,251,255,0.98)_0%,_rgba(255,255,255,1)_100%)] px-10 py-7 text-center">
                            <div className="flex items-center justify-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100/80 bg-[linear-gradient(180deg,_#3a86ff_0%,_#165dff_100%)] shadow-[0_10px_22px_rgba(22,93,255,0.26)]">
                                    <SafetyCertificateOutlined style={{ color: '#ffffff', fontSize: 20 }} />
                                </div>
                                <div className="text-left">
                                    <div className="text-[28px] font-semibold tracking-[0.03em] text-slate-950">
                                        {VITE_SPACE_NAME}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 py-7">
                            <Form<LoginFormValues>
                                form={form}
                                name="login"
                                layout="vertical"
                                size="large"
                                initialValues={{ remember: true }}
                                onFinish={handleFinish}
                            >
                                <Form.Item
                                    name="username"
                                    rules={[{ required: true, message: '请输入用户名' }]}
                                    className="mb-5"
                                >
                                    <Input
                                        prefix={<UserOutlined className="text-slate-400" />}
                                        placeholder="请输入用户名"
                                        className="!rounded-lg !border-slate-200 !bg-slate-50/55 !px-4 hover:!border-blue-300 focus-within:!border-blue-400"
                                        style={{ height: 40 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: '请输入密码' }]}
                                    className="mb-5"
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="text-slate-400" />}
                                        placeholder="请输入密码"
                                        className="!rounded-lg !border-slate-200 !bg-slate-50/55 !px-4 hover:!border-blue-300 focus-within:!border-blue-400"
                                        style={{ height: 40 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="captcha"
                                    rules={[{ required: true, message: '请输入验证码' }]}
                                    className="mb-5"
                                >
                                    <div className="flex items-center gap-3">
                                        <Input
                                            prefix={<KeyOutlined className="text-slate-400" />}
                                            placeholder="请输入验证码"
                                            className="flex-1 !rounded-lg !border-slate-200 !bg-slate-50/55 !px-4 hover:!border-blue-300 focus-within:!border-blue-400"
                                            style={{ height: 40 }}
                                            maxLength={4}
                                            autoComplete="off"
                                        />
                                        <div
                                            className="flex h-[40px] w-[150px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition hover:border-blue-200 hover:bg-blue-50/30"
                                            onClick={() => {
                                                refetchCaptcha();
                                            }}
                                            title="点击刷新验证码"
                                        >
                                            {captchaLoading ? (
                                                <span className="text-xs text-slate-400">加载中...</span>
                                            ) : captchaData?.image ? (
                                                <img
                                                    src={captchaData.image}
                                                    alt="验证码"
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                    {captchaLoadError ? '点击重试' : '点击获取'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Form.Item>

                                <Form.Item name="captchaId" hidden>
                                    <Input />
                                </Form.Item>

                                <Form.Item className="mb-6">
                                    <div className="flex items-center justify-between">
                                        <Form.Item name="remember" valuePropName="checked" noStyle>
                                            <Checkbox className="text-slate-500">记住我</Checkbox>
                                        </Form.Item>
                                        <a
                                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                            onClick={() => {
                                                Modal.info({
                                                    title: '提示',
                                                    content: '请联系平台管理员重置密码',
                                                    okText: '确定',
                                                    centered: true,
                                                });
                                            }}
                                        >
                                            忘记密码
                                        </a>
                                    </div>
                                </Form.Item>

                                <Form.Item className="mb-0">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="!h-[40px] !w-full !rounded-lg !border-0 !bg-[linear-gradient(135deg,_#2a7dff_0%,_#165dff_100%)] !text-base !font-semibold shadow-[0_18px_32px_rgba(22,93,255,0.28)] hover:!bg-[linear-gradient(135deg,_#4b90ff_0%,_#2a7dff_100%)]"
                                        loading={loginLoading}
                                    >
                                        立即登录
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
