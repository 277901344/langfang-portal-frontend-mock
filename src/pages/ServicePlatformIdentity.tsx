import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Grid,
  IdCard,
  Menu,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  Users,
  Search,
  X,
  LogOut,
  Home,
  Clock,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

type FormType = 'personal' | 'enterprise' | 'agent' | null;

interface CirculationRoleMultiSelectProps {
  value: string[];
  onChange: (roles: string[]) => void;
  required?: boolean;
}

function CirculationRoleMultiSelect({ value, onChange, required = false }: CirculationRoleMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = ['提供方', '使用方', '服务方'];

  const toggleRole = (role: string) => {
    if (value.includes(role)) {
      onChange(value.filter((r) => r !== role));
    } else {
      onChange([...value, role]);
    }
  };

  const removeRole = (role: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((r) => r !== role));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {required && <span className="text-red-500 mr-1">*</span>}流通角色
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[36px] px-2.5 py-1 text-xs bg-white border ${
          isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'
        } rounded-lg flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors gap-2`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 py-0.5">
          {value.length === 0 ? (
            <span className="text-slate-300">请选择流通角色（支持多选）</span>
          ) : (
            value.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-200/70"
              >
                {role}
                <button
                  type="button"
                  onClick={(e) => removeRole(role, e)}
                  className="hover:text-blue-800 focus:outline-none cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 p-2 space-y-1 animate-in fade-in-50 zoom-in-95 duration-100">
          {options.map((option) => {
            const isSelected = value.includes(option);
            return (
              <div
                key={option}
                onClick={() => toggleRole(option)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50/80 text-blue-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>{option}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ServicePlatformIdentity() {
  const navigate = useNavigate();
  const { user, setAuthenticatedUser } = useAuth();

  // 全生命周期认证状态控制 (0: 未认证, 1: 已认证, 2: 审核中, 3: 审核未通过)
  const [localStatus, setLocalStatus] = useState<number>(() => user?.authStatus ?? 0);

  // 未认证状态下的步骤 ('prompt': 尚未完成主体身份认证页面; 'select_type': 选择身份类型页面)
  const [unverifiedStep, setUnverifiedStep] = useState<'prompt' | 'select_type'>('prompt');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinKeyword, setJoinKeyword] = useState('');
  const [selectedOrgToJoin, setSelectedOrgToJoin] = useState<string | null>(null);
  const [joinRole, setJoinRole] = useState('法人经办人');
  const [joinReason, setJoinReason] = useState('');
  const [joinSubmitted, setJoinSubmitted] = useState(false);

  useEffect(() => {
    if (user?.authStatus !== undefined) {
      setLocalStatus(user.authStatus);
    }
  }, [user?.authStatus]);

  const authStatus = localStatus;
  const isCertified = authStatus === 1;
  const isAuditing = authStatus === 2;
  const isRejected = authStatus === 3;
  const isUnverified = authStatus === 0;

  // 菜单展开控制
  const [isIdentityMenuOpen, setIsIdentityMenuOpen] = useState(true);
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);

  // 表单视角选择 (null: 选择身份类型页面, 'personal' | 'enterprise' | 'agent': 提交认证资料页面)
  const [formType, setFormType] = useState<FormType>(null);

  // 表单数据绑定
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 快捷切换全生命周期状态 handler
  const handleSetStatus = (status: number) => {
    setLocalStatus(status);
    if (user) {
      setAuthenticatedUser({
        ...user,
        authStatus: status,
      });
    }
    setSubmitSuccess(false);
    if (status === 0) {
      setUnverifiedStep('prompt');
      setFormType(null);
    }
  };

  const handleWithdraw = () => {
    setLocalStatus(0);
    if (user) {
      setAuthenticatedUser({
        ...user,
        authStatus: 0,
      });
    }
    setUnverifiedStep('prompt');
    setFormType(null);
  };

  const handleReEdit = () => {
    if (!formType) {
      setFormType('enterprise');
    }
    setLocalStatus(0);
    setUnverifiedStep('select_type');
    if (user) {
      setAuthenticatedUser({
        ...user,
        authStatus: 0,
      });
    }
  };

  // 个人用户表单项
  const [personalForm, setPersonalForm] = useState({
    name: '',
    circulationRoles: ['提供方'],
    certMethod: '公安部、人社部等国家权威部门实名服务',
    idType: '中华人民共和国居民身份证',
    idNumber: '',
    startDate: '',
    endDate: '',
    phone: '',
    nationality: '',
    gender: '',
    birthDate: '',
    socialCardNo: '',
    socialCardIssuer: '',
    alipayAccount: '',
    wechatAccount: '',
    email: '',
    address: '',
    otherInfo: '',
  });

  // 法人或其它组织表单项
  const [enterpriseForm, setEnterpriseForm] = useState({
    orgName: '',
    creditCode: '',
    circulationRoles: ['提供方', '使用方'],
    orgType: '企业事业单位法人',
    startDate: '',
    endDate: '',
    isPermanent: false,
    certMethod: '实名认证方式',
    repName: '',
    repIdNumber: '',
    repLevel: '',
    repCertMethod: '',
    regAddress: '',
    regCapital: '',
    regDate: '',
    scope: '',
    industry: '',
    repPhone: '',
    repEmail: '',
    serviceRole: '',
    serviceType: '',
    autoDesc: '',
    boundaryDesc: '',
    department: '',
    serviceContact: '',
  });

  // 法人经办人表单项
  const [agentForm, setAgentForm] = useState({
    trusteeType: '自然人',
    trusteeName: '',
    circulationRoles: ['服务方'],
    trusteeIdType: '居民身份证',
    trusteeIdNumber: '',
    trusteeLevel: '',
    trusteeCertMethod: '',
    authMethod: '管理员确认',
    entityType: '法人或其他组织',
    entityName: '',
    entityCode: '',
    startDate: '',
    endDate: '',
    department: '',
    trusteeTaskDesc: '',
    purposeDesc: '',
    autoMode: '',
    serviceVersion: '',
    serviceProvider: '',
    boundaryDesc: '',
    contactPhone: '',
    contactEmail: '',
  });

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setLocalStatus(2); // 进入审核中状态
      const updatedDisplayName =
        personalForm.name.trim() ||
        enterpriseForm.orgName.trim() ||
        agentForm.trusteeName.trim() ||
        user?.displayName ||
        '认证主体';

      if (user) {
        setAuthenticatedUser({
          ...user,
          authStatus: 2, // 进入审核中状态
          displayName: updatedDisplayName,
        });
      }
    }, 800);
  };

  return (
    <div className="w-full bg-[#f0f2f5] font-sans text-slate-800 antialiased select-none p-3 md:p-6 rounded-xl flex justify-center">
      <div className="w-full max-w-5xl space-y-4">
        {/* 页面头部标题区 */}
        <div className="flex items-center justify-between pb-1">
          {isAuditing ? (
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                认证审核中
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                您提交的个人认证申请正在处理中
              </p>
            </div>
          ) : isRejected ? (
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                审核未通过
              </h1>
            </div>
          ) : isCertified ? (
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                我的身份
              </h1>
            </div>
          ) : isUnverified && unverifiedStep === 'prompt' ? (
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                主体身份认证
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                完成主体身份认证后，即可获取数据空间凭证并开展数据流通业务。
              </p>
            </div>
          ) : formType === null ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUnverifiedStep('prompt')}
                className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-200/60"
                title="返回"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  选择身份类型
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  不同身份类型需提交的认证材料不同，请根据实际情况选择。
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormType(null)}
                className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-200/60"
                title="返回选择身份类型"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  提交认证资料
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  当前身份类型：
                  {formType === 'personal' && '个人用户'}
                  {formType === 'enterprise' && '法人或其他组织'}
                  {formType === 'agent' && '法人经办人'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 身份认证状态切换页签 (页签形式，方便查看) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-1.5 flex items-center gap-1 shadow-2xs">
          {[
            { status: 0, label: '未认证' },
            { status: 2, label: '审核中' },
            { status: 1, label: '已认证' },
            { status: 3, label: '审核未通过' },
          ].map((tab) => {
            const isActive = authStatus === tab.status;
            return (
              <button
                key={tab.status}
                type="button"
                onClick={() => handleSetStatus(tab.status)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.01]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <span>{tab.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>

            {/* 提交成功提示 */}
            {submitSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in shadow-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-emerald-900">认证资料提交成功！</div>
                    <div className="text-xs text-emerald-700 mt-0.5">
                      资料已成功录入国家可信空间认证库，已自动为您同步完成身份认证。
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>完成认证，返回首页</span>
                  </button>
                </div>
              </div>
            )}

            {/* 1. 认证审核中状态展示 (Status: 2 / Auditing) */}
            {isAuditing && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 md:p-12 shadow-xs mt-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-8">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">资料审核中</h2>
                    <p className="text-xs text-slate-400 mt-1">请耐心等待审核完成</p>
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-[#fff7e6] text-[#ff9300] text-xs font-medium border border-[#ffe58f]/60">
                    资料审核
                  </span>
                </div>

                {/* 3 步骤流程 */}
                <div className="max-w-xl mx-auto my-12 px-4">
                  <div className="flex items-center justify-between relative">
                    {/* 步骤 1 */}
                    <div className="flex flex-col items-center z-10 w-24">
                      <div className="w-8 h-8 rounded-full bg-[#1677ff] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        1
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-3 text-center">提交资料</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 text-center">已完成</div>
                    </div>

                    {/* 连接线 1 */}
                    <div className="flex-1 h-[1px] bg-slate-200 mx-2 -mt-8" />

                    {/* 步骤 2 */}
                    <div className="flex flex-col items-center z-10 w-24">
                      <div className="w-8 h-8 rounded-full border border-slate-300 bg-white text-slate-500 flex items-center justify-center text-xs font-medium shadow-2xs">
                        2
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-3 text-center">人工审核</div>
                      <div className="text-[11px] text-[#1677ff] font-medium mt-0.5 text-center">进行中</div>
                    </div>

                    {/* 连接线 2 */}
                    <div className="flex-1 h-[1px] bg-slate-200 mx-2 -mt-8" />

                    {/* 步骤 3 */}
                    <div className="flex flex-col items-center z-10 w-24">
                      <div className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-300 flex items-center justify-center text-xs font-medium">
                        3
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-3 text-center">认证完成</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 text-center">等待中</div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    className="px-5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  >
                    撤回申请
                  </button>
                </div>
              </div>
            )}

            {/* 2. 审核未通过状态展示 (Status: 3 / Rejected) */}
            {isRejected && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 md:p-10 shadow-xs mt-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100/80 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                      <X className="w-5 h-5 text-white stroke-[2.5]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">审核未通过</h2>
                      <p className="text-xs text-slate-400 mt-0.5">您的认证申请已被驳回</p>
                    </div>
                  </div>
                  <span className="px-3 py-0.5 rounded-md bg-[#fff2f0] text-[#ff4d4f] border border-[#ffccc7] text-[11px] font-medium">
                    Rejected
                  </span>
                </div>

                {/* 驳回原因 */}
                <div className="bg-[#fff2f0] border border-[#ffccc7]/80 rounded-xl p-5 mb-8">
                  <p className="text-xs font-bold text-slate-800 mb-2">驳回原因：</p>
                  <p className="text-xs text-slate-700 font-mono">qqq</p>
                </div>

                {/* 操作按钮组 */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(2)}
                    className="px-5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  >
                    重新提交审核
                  </button>
                  <button
                    type="button"
                    onClick={handleReEdit}
                    className="px-5 py-2 rounded-lg bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>修改并重新提交</span>
                  </button>
                </div>
              </div>
            )}

            {/* 未认证第一步：尚未完成主体身份认证 (Image 1) */}
            {isUnverified && unverifiedStep === 'prompt' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-10 md:p-16 text-center flex flex-col items-center justify-center min-h-[400px] mt-4">
                <div className="w-16 h-16 rounded-full bg-[#EBF3FF] text-[#1677FF] flex items-center justify-center mb-6 shadow-xs">
                  <ShieldCheck className="w-9 h-9 stroke-[2]" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 mb-2">
                  尚未完成主体身份认证
                </h2>
                <p className="text-xs md:text-sm text-slate-500 max-w-lg mb-8 leading-relaxed">
                  您可以申请认证新主体，也可以申请加入已经存在的认证主体。
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setUnverifiedStep('select_type')}
                    className="px-6 py-2.5 rounded-lg bg-[#1677ff] hover:bg-blue-600 active:scale-[0.98] text-white text-xs md:text-sm font-medium flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>立即申请认证</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrgToJoin(null);
                      setJoinSubmitted(false);
                      setIsJoinModalOpen(true);
                    }}
                    className="px-6 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs md:text-sm font-medium flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>加入已有主体</span>
                  </button>
                </div>
              </div>
            )}

            {/* 未认证第二步：选择身份类型 (Image 2) */}
            {isUnverified && unverifiedStep === 'select_type' && formType === null && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 md:p-12 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 卡片 1: 个人用户 */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 p-6 md:p-8 flex flex-col items-center text-center hover:border-blue-200 hover:shadow-md transition-all group bg-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/60 via-blue-50/30 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#f0f7ff] group-hover:bg-blue-100/80 text-slate-800 group-hover:text-blue-600 flex items-center justify-center mb-6 transition-colors">
                      <User className="w-8 h-8 stroke-[1.75]" />
                    </div>
                    <h3 className="relative z-10 text-base font-bold text-slate-900 mb-2">个人用户</h3>
                    <p className="relative z-10 text-xs text-slate-500 leading-relaxed mb-8 h-10 flex items-center justify-center max-w-[220px]">
                      以自然人身份参与数据流通活动的个体。
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormType('personal')}
                      className="relative z-10 w-full bg-[#1677ff] hover:bg-blue-600 active:scale-[0.98] text-white font-medium py-2.5 px-4 rounded-xl text-xs md:text-sm shadow-xs transition-all cursor-pointer"
                    >
                      选择此类型
                    </button>
                  </div>

                  {/* 卡片 2: 法人或其他组织 */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 p-6 md:p-8 flex flex-col items-center text-center hover:border-purple-200 hover:shadow-md transition-all group bg-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/50 via-pink-50/20 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#faf0f5] group-hover:bg-purple-100/80 text-slate-800 group-hover:text-purple-600 flex items-center justify-center mb-6 transition-colors">
                      <Building2 className="w-8 h-8 stroke-[1.75]" />
                    </div>
                    <h3 className="relative z-10 text-base font-bold text-slate-900 mb-2">法人或其他组织</h3>
                    <p className="relative z-10 text-xs text-slate-500 leading-relaxed mb-8 h-10 flex items-center justify-center max-w-[220px]">
                      政府机关、事业单位、社会团体等。
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormType('enterprise')}
                      className="relative z-10 w-full bg-[#1677ff] hover:bg-blue-600 active:scale-[0.98] text-white font-medium py-2.5 px-4 rounded-xl text-xs md:text-sm shadow-xs transition-all cursor-pointer"
                    >
                      选择此类型
                    </button>
                  </div>

                  {/* 卡片 3: 法人经办人 */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 p-6 md:p-8 flex flex-col items-center text-center hover:border-emerald-200 hover:shadow-md transition-all group bg-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/50 via-teal-50/20 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#f0f9f5] group-hover:bg-emerald-100/80 text-slate-800 group-hover:text-emerald-600 flex items-center justify-center mb-6 transition-colors">
                      <FileText className="w-8 h-8 stroke-[1.75]" />
                    </div>
                    <h3 className="relative z-10 text-base font-bold text-slate-900 mb-2">法人经办人</h3>
                    <p className="relative z-10 text-xs text-slate-500 leading-relaxed mb-8 h-10 flex items-center justify-center max-w-[220px]">
                      受法人委托办理数据服务的人员。
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormType('agent')}
                      className="relative z-10 w-full bg-[#1677ff] hover:bg-blue-600 active:scale-[0.98] text-white font-medium py-2.5 px-4 rounded-xl text-xs md:text-sm shadow-xs transition-all cursor-pointer"
                    >
                      选择此类型
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FORM VIEW 1: 个人用户 提交认证资料 (1:1 Matching Screenshot 1) */}
            {!isAuditing && !isCertified && formType === 'personal' && (
              <form onSubmit={handleSubmitAudit} className="space-y-6">
                {/* 1. 个人用户基础信息 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                    <h2 className="text-sm font-bold text-slate-900">个人用户基础信息</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>姓名
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="请输入姓名"
                        value={personalForm.name}
                        onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <CirculationRoleMultiSelect
                      value={personalForm.circulationRoles}
                      onChange={(roles) => setPersonalForm({ ...personalForm, circulationRoles: roles })}
                      required
                    />

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>个人认证方式
                      </label>
                      <select
                        value={personalForm.certMethod}
                        onChange={(e) => setPersonalForm({ ...personalForm, certMethod: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="公安部、人社部等国家权威部门实名服务">公安部、人社部等国家权威部门实名服务</option>
                        <option value="人脸识别实名服务">人脸识别实名服务</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>证件类型
                      </label>
                      <select
                        value={personalForm.idType}
                        onChange={(e) => setPersonalForm({ ...personalForm, idType: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="中华人民共和国居民身份证">中华人民共和国居民身份证</option>
                        <option value="港澳居民来往内地通行证">港澳居民来往内地通行证</option>
                        <option value="台湾居民来往大陆通行证">台湾居民来往大陆通行证</option>
                        <option value="外国人永久居留身份证">外国人永久居留身份证</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>证件号码
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="请输入证件号码"
                        value={personalForm.idNumber}
                        onChange={(e) => setPersonalForm({ ...personalForm, idNumber: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>证件有效期起始日期
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={personalForm.startDate}
                          onChange={(e) => setPersonalForm({ ...personalForm, startDate: e.target.value })}
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>证件有效期截止日期
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={personalForm.endDate}
                          onChange={(e) => setPersonalForm({ ...personalForm, endDate: e.target.value })}
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>手机号
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="请输入手机号"
                        value={personalForm.phone}
                        onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* 证件照片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>证件照片-正
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer text-center group min-h-[130px]">
                        <Upload className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-slate-700">点击上传 或 拖拽文件</span>
                        <span className="text-[11px] text-slate-400 mt-1">支持 JPG/PNG/PDF 格式 (Max 10MB)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>证件照片-反
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer text-center group min-h-[130px]">
                        <Upload className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-slate-700">点击上传 或 拖拽文件</span>
                        <span className="text-[11px] text-slate-400 mt-1">支持 JPG/PNG/PDF 格式 (Max 10MB)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 个人用户附属信息 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                    <h2 className="text-sm font-bold text-slate-900">个人用户附属信息</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">国籍</label>
                      <input
                        type="text"
                        placeholder="请输入国籍"
                        value={personalForm.nationality}
                        onChange={(e) => setPersonalForm({ ...personalForm, nationality: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">性别</label>
                      <select
                        value={personalForm.gender}
                        onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="">请选择</option>
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">出生年月</label>
                      <input
                        type="month"
                        value={personalForm.birthDate}
                        onChange={(e) => setPersonalForm({ ...personalForm, birthDate: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">社保卡卡号</label>
                      <input
                        type="text"
                        placeholder="请输入社保卡卡号"
                        value={personalForm.socialCardNo}
                        onChange={(e) => setPersonalForm({ ...personalForm, socialCardNo: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">社保卡发放地</label>
                      <input
                        type="text"
                        placeholder="请输入社保卡发放地"
                        value={personalForm.socialCardIssuer}
                        onChange={(e) => setPersonalForm({ ...personalForm, socialCardIssuer: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">支付宝账号</label>
                      <input
                        type="text"
                        placeholder="请输入支付宝账号"
                        value={personalForm.alipayAccount}
                        onChange={(e) => setPersonalForm({ ...personalForm, alipayAccount: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">微信账号</label>
                      <input
                        type="text"
                        placeholder="请输入微信账号"
                        value={personalForm.wechatAccount}
                        onChange={(e) => setPersonalForm({ ...personalForm, wechatAccount: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">邮箱</label>
                      <input
                        type="email"
                        placeholder="请输入邮箱"
                        value={personalForm.email}
                        onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">联系地址</label>
                      <input
                        type="text"
                        placeholder="请输入联系地址"
                        value={personalForm.address}
                        onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">其它</label>
                      <textarea
                        rows={3}
                        placeholder="请输入其它信息"
                        value={personalForm.otherInfo}
                        onChange={(e) => setPersonalForm({ ...personalForm, otherInfo: e.target.value })}
                        className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 底部提交控制按钮 */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-lg bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? '提交核验中...' : '提交审核'}
                  </button>
                </div>
              </form>
            )}

            {/* FORM VIEW 2: 法人或其他组织 提交认证资料 (1:1 Matching Screenshot 2) */}
            {!isAuditing && !isCertified && formType === 'enterprise' && (
              <form onSubmit={handleSubmitAudit} className="space-y-6">
                {/* 1. 法人或其他组织用户基础信息 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                    <h2 className="text-sm font-bold text-slate-900">法人或其他组织用户基础信息</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>法人或其他组织名称
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="请输入法人或其他组织名称"
                        value={enterpriseForm.orgName}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, orgName: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>统一社会信用代码
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="请输入统一社会信用代码"
                        value={enterpriseForm.creditCode}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, creditCode: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <CirculationRoleMultiSelect
                      value={enterpriseForm.circulationRoles}
                      onChange={(roles) => setEnterpriseForm({ ...enterpriseForm, circulationRoles: roles })}
                      required
                    />

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>法人或其他组织类型
                      </label>
                      <select
                        value={enterpriseForm.orgType}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, orgType: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="企业事业单位法人">企业事业单位法人</option>
                        <option value="机关法人">机关法人</option>
                        <option value="社会团体法人">社会团体法人</option>
                        <option value="其他组织">其他组织</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>经营期限起始
                      </label>
                      <input
                        type="date"
                        value={enterpriseForm.startDate}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, startDate: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>经营期限截止
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="date"
                          disabled={enterpriseForm.isPermanent}
                          value={enterpriseForm.endDate}
                          onChange={(e) => setEnterpriseForm({ ...enterpriseForm, endDate: e.target.value })}
                          className="flex-1 h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 disabled:bg-slate-100"
                        />
                        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enterpriseForm.isPermanent}
                            onChange={(e) => setEnterpriseForm({ ...enterpriseForm, isPermanent: e.target.checked })}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>无固定期限</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>实名认证方式
                      </label>
                      <select
                        value={enterpriseForm.certMethod}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, certMethod: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="实名认证方式">实名认证方式</option>
                        <option value="电子营业执照核验">电子营业执照核验</option>
                        <option value="法人对公打款认证">法人对公打款认证</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>法定代表人或负责人姓名
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="请输入法定代表人或负责人姓名"
                        value={enterpriseForm.repName}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, repName: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>法定代表人或负责人证件号
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="请输入证件号"
                        value={enterpriseForm.repIdNumber}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, repIdNumber: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>法定代表人或负责人实名等级
                      </label>
                      <select
                        value={enterpriseForm.repLevel}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, repLevel: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="">请选择</option>
                        <option value="L3权威核验">L3权威核验</option>
                        <option value="L4人脸+公安核验">L4人脸+公安核验</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>法定代表人或负责人实名认证方式
                      </label>
                      <select
                        value={enterpriseForm.repCertMethod}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, repCertMethod: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="">请选择</option>
                        <option value="身份证原件人脸服务">身份证原件人脸服务</option>
                        <option value="国家政务服务平台对调">国家政务服务平台对调</option>
                      </select>
                    </div>
                  </div>

                  {/* 证件照片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        法定代表人或负责人身份证-正面
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer text-center group min-h-[130px]">
                        <Upload className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-slate-700">点击上传 或 拖拽文件</span>
                        <span className="text-[11px] text-slate-400 mt-1">支持 JPG/PNG/PDF 格式 (Max 10MB)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        法定代表人或负责人身份证-反面
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer text-center group min-h-[130px]">
                        <Upload className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-slate-700">点击上传 或 拖拽文件</span>
                        <span className="text-[11px] text-slate-400 mt-1">支持 JPG/PNG/PDF 格式 (Max 10MB)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 法人或其他组织用户附属信息 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                    <h2 className="text-sm font-bold text-slate-900">法人或其他组织用户附属信息</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">注册地址</label>
                      <input
                        type="text"
                        placeholder="请输入注册地址"
                        value={enterpriseForm.regAddress}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, regAddress: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">注册金额</label>
                      <input
                        type="text"
                        placeholder="请输入注册金额"
                        value={enterpriseForm.regCapital}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, regCapital: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">注册日期</label>
                      <input
                        type="date"
                        value={enterpriseForm.regDate}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, regDate: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">经营范围</label>
                      <textarea
                        rows={3}
                        placeholder="请输入经营范围"
                        value={enterpriseForm.scope}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, scope: e.target.value })}
                        className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">行业类型</label>
                      <input
                        type="text"
                        placeholder="请输入行业类型"
                        value={enterpriseForm.industry}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, industry: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">法定代表人或负责人手机号</label>
                      <input
                        type="tel"
                        placeholder="请输入手机号"
                        value={enterpriseForm.repPhone}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, repPhone: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">法定代表人或负责人邮箱</label>
                      <input
                        type="email"
                        placeholder="请输入邮箱"
                        value={enterpriseForm.repEmail}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, repEmail: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">服务角色</label>
                      <input
                        type="text"
                        placeholder="请输入服务角色"
                        value={enterpriseForm.serviceRole}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, serviceRole: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">服务类型</label>
                      <input
                        type="text"
                        placeholder="请输入服务类型"
                        value={enterpriseForm.serviceType}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, serviceType: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">自动化调用说明</label>
                      <input
                        type="text"
                        placeholder="请输入自动化调用说明"
                        value={enterpriseForm.autoDesc}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, autoDesc: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">调用边界说明</label>
                      <input
                        type="text"
                        placeholder="请输入调用边界说明"
                        value={enterpriseForm.boundaryDesc}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, boundaryDesc: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">责任部门</label>
                      <input
                        type="text"
                        placeholder="请输入责任部门"
                        value={enterpriseForm.department}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, department: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">服务联系人</label>
                      <input
                        type="text"
                        placeholder="请输入服务联系人"
                        value={enterpriseForm.serviceContact}
                        onChange={(e) => setEnterpriseForm({ ...enterpriseForm, serviceContact: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>电子营业执照或其他组织机构证书
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer text-center group min-h-[140px]">
                        <Upload className="w-7 h-7 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-slate-700">点击上传 或 拖拽文件</span>
                        <span className="text-[11px] text-slate-400 mt-1">支持 JPG/PNG/PDF 格式 (Max 10MB)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 底部提交控制按钮 */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-lg bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? '提交核验中...' : '提交审核'}
                  </button>
                </div>
              </form>
            )}

            {/* FORM VIEW 3: 法人经办人 提交认证资料 (1:1 Matching Screenshot 3) */}
            {!isAuditing && !isCertified && formType === 'agent' && (
              <form onSubmit={handleSubmitAudit} className="space-y-6">
                {/* 1. 法人或其他组织经办人基础信息 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                    <h2 className="text-sm font-bold text-slate-900">法人或其他组织经办人基础信息</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>受托执行者类型
                      </label>
                      <select
                        value={agentForm.trusteeType}
                        onChange={(e) => setAgentForm({ ...agentForm, trusteeType: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="自然人">自然人</option>
                        <option value="机构单位">机构单位</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>受托执行者姓名或名称
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="请输入受托执行者姓名或名称"
                        value={agentForm.trusteeName}
                        onChange={(e) => setAgentForm({ ...agentForm, trusteeName: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <CirculationRoleMultiSelect
                      value={agentForm.circulationRoles}
                      onChange={(roles) => setAgentForm({ ...agentForm, circulationRoles: roles })}
                      required
                    />

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>受托执行者证件或标识类型
                      </label>
                      <select
                        value={agentForm.trusteeIdType}
                        onChange={(e) => setAgentForm({ ...agentForm, trusteeIdType: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="居民身份证">居民身份证</option>
                        <option value="统一社会信用代码">统一社会信用代码</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>受托执行者证件或标识号码
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="请输入证件或标识号码"
                        value={agentForm.trusteeIdNumber}
                        onChange={(e) => setAgentForm({ ...agentForm, trusteeIdNumber: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>受托执行者实名认证等级
                      </label>
                      <select
                        value={agentForm.trusteeLevel}
                        onChange={(e) => setAgentForm({ ...agentForm, trusteeLevel: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="">请选择</option>
                        <option value="L3级认证">L3级认证</option>
                        <option value="L4级强核验">L4级强核验</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>受托执行者实名认证方式
                      </label>
                      <select
                        value={agentForm.trusteeCertMethod}
                        onChange={(e) => setAgentForm({ ...agentForm, trusteeCertMethod: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="">请选择</option>
                        <option value="国家身份证人脸对比">国家身份证人脸对比</option>
                        <option value="企业法定授权书">企业法定授权书</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>授权方式
                      </label>
                      <select
                        value={agentForm.authMethod}
                        onChange={(e) => setAgentForm({ ...agentForm, authMethod: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="管理员确认">管理员确认</option>
                        <option value="法定代表人直接授权">法定代表人直接授权</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>责任主体类型
                      </label>
                      <select
                        value={agentForm.entityType}
                        onChange={(e) => setAgentForm({ ...agentForm, entityType: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      >
                        <option value="法人或其他组织">法人或其他组织</option>
                        <option value="政府部门">政府部门</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>责任主体姓名或名称
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="请输入责任主体姓名或名称"
                        value={agentForm.entityName}
                        onChange={(e) => setAgentForm({ ...agentForm, entityName: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        <span className="text-red-500 mr-1">*</span>责任主体证件号码或统一社会信用代码
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="请输入责任主体证件号码或统一社会信用代码"
                        value={agentForm.entityCode}
                        onChange={(e) => setAgentForm({ ...agentForm, entityCode: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">授权起始日期</label>
                      <input
                        type="date"
                        value={agentForm.startDate}
                        onChange={(e) => setAgentForm({ ...agentForm, startDate: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">授权截止日期</label>
                      <input
                        type="date"
                        value={agentForm.endDate}
                        onChange={(e) => setAgentForm({ ...agentForm, endDate: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. 法人或其他组织经办人附属信息 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
                    <h2 className="text-sm font-bold text-slate-900">法人或其他组织经办人附属信息</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">责任主体所属部门</label>
                      <input
                        type="text"
                        placeholder="请输入责任主体所属部门"
                        value={agentForm.department}
                        onChange={(e) => setAgentForm({ ...agentForm, department: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">受托执行事项说明</label>
                      <input
                        type="text"
                        placeholder="请输入受托执行事项说明"
                        value={agentForm.trusteeTaskDesc}
                        onChange={(e) => setAgentForm({ ...agentForm, trusteeTaskDesc: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">调用用途说明</label>
                      <input
                        type="text"
                        placeholder="请输入调用用途说明"
                        value={agentForm.purposeDesc}
                        onChange={(e) => setAgentForm({ ...agentForm, purposeDesc: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">自动化运行方式</label>
                      <input
                        type="text"
                        placeholder="人工、半自动、自动"
                        value={agentForm.autoMode}
                        onChange={(e) => setAgentForm({ ...agentForm, autoMode: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">服务或智能体版本</label>
                      <input
                        type="text"
                        placeholder="请输入服务或智能体版本"
                        value={agentForm.serviceVersion}
                        onChange={(e) => setAgentForm({ ...agentForm, serviceVersion: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">服务提供方</label>
                      <input
                        type="text"
                        placeholder="请输入服务提供方"
                        value={agentForm.serviceProvider}
                        onChange={(e) => setAgentForm({ ...agentForm, serviceProvider: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">调用边界说明</label>
                      <input
                        type="text"
                        placeholder="请输入调用边界说明"
                        value={agentForm.boundaryDesc}
                        onChange={(e) => setAgentForm({ ...agentForm, boundaryDesc: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">联系手机号</label>
                      <input
                        type="tel"
                        placeholder="请输入联系手机号"
                        value={agentForm.contactPhone}
                        onChange={(e) => setAgentForm({ ...agentForm, contactPhone: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">联系邮箱</label>
                      <input
                        type="email"
                        placeholder="请输入联系邮箱"
                        value={agentForm.contactEmail}
                        onChange={(e) => setAgentForm({ ...agentForm, contactEmail: e.target.value })}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-300"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-2">授权文件</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer text-center group min-h-[140px]">
                        <Upload className="w-7 h-7 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-slate-700">点击上传 或 拖拽文件</span>
                        <span className="text-[11px] text-slate-400 mt-1">支持 JPG/PNG/PDF 格式 (Max 10MB)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 底部提交控制按钮 */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-lg bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? '提交核验中...' : '提交审核'}
                  </button>
                </div>
              </form>
            )}

            {/* 3. 已完成身份认证状态列表展示 (Status: 1 / Certified) */}
            {isCertified && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs mt-4 space-y-6">
                {/* 头部个人概要卡片 */}
                <div className="bg-slate-100/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-300 text-slate-500 flex items-center justify-center shrink-0">
                      <User className="w-7 h-7 text-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{user?.displayName || '王鹭'}</span>
                        <span className="text-[10px] font-bold text-[#52c41a]">INDIVIDUAL VERIFIED</span>
                      </div>
                      <p className="text-xs text-slate-500">ID: 371***********2229</p>
                      <p className="text-[11px] text-slate-400">上次更新时间: 2026-08-10</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReEdit}
                    className="self-start md:self-auto px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-500" />
                    <span>变更信息 / 重新认证</span>
                  </button>
                </div>

                {/* 个人用户基础信息 */}
                <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-[#1677ff] rounded-full" />
                    <h3 className="text-xs font-bold text-slate-900">个人用户基础信息</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                    <div>
                      <p className="text-slate-400 mb-1">姓名</p>
                      <p className="font-bold text-slate-800">{user?.displayName || '王鹭'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">个人认证方式</p>
                      <p className="font-bold text-slate-800">公安部、人社部等国家权威部门实名服务</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">证件类型</p>
                      <p className="font-bold text-slate-800">中华人民共和国居民身份证</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">证件号码</p>
                      <p className="font-bold text-slate-800">371***********2229</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">证件有效期起始日期</p>
                      <p className="font-bold text-slate-800">2026-08-12</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">证件有效期截止日期</p>
                      <p className="font-bold text-slate-800">2026-08-08</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">手机号码</p>
                      <p className="font-bold text-slate-800">173****2231</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">证件照片-正</p>
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-[#1677ff] hover:underline font-medium">查看已上传文件</a>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">证件照片-反</p>
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-[#1677ff] hover:underline font-medium">查看已上传文件</a>
                    </div>
                  </div>
                </div>

                {/* 个人用户附属信息 */}
                <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-[#1677ff] rounded-full" />
                    <h3 className="text-xs font-bold text-slate-900">个人用户附属信息</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                    <div>
                      <p className="text-slate-400 mb-1">国籍</p>
                      <p className="font-bold text-slate-800">中国</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">性别</p>
                      <p className="font-bold text-slate-800">女</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">出生年月</p>
                      <p className="font-bold text-slate-800">2026-11</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">社保卡号</p>
                      <p className="font-bold text-slate-800">110***********4578</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">社保卡发放地</p>
                      <p className="font-bold text-slate-800">11</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">支付宝账号</p>
                      <p className="font-bold text-slate-800">173******331</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">微信账号</p>
                      <p className="font-bold text-slate-800">173*****331</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">邮箱</p>
                      <p className="font-bold text-slate-800">未填写</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">联系地址</p>
                      <p className="font-bold text-slate-800">****</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">其它</p>
                      <p className="font-bold text-slate-800">未填写</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 加入已有主体弹窗 */}
            {isJoinModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">加入已有认证主体</h3>
                        <p className="text-[11px] text-slate-400">申请加入已完成认证的机构或企业</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsJoinModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {joinSubmitted ? (
                    <div className="p-8 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">加入申请已提交</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                          已向所选主体的管理员发送加入审批通知，管理员通过后您即可共享主体凭证开展业务。
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsJoinModalOpen(false);
                          setJoinSubmitted(false);
                        }}
                        className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        我知道了
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          <span className="text-red-500 mr-1">*</span>搜索目标主体
                        </label>
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="输入企业/机构名称或统一社会信用代码"
                            value={joinKeyword}
                            onChange={(e) => setJoinKeyword(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors placeholder:text-slate-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {[
                          {
                            id: 'org-1',
                            name: '廊坊市数城科技集团有限公司',
                            code: '91131000MA0GJFCJ8N',
                            type: '企业法人',
                          },
                          {
                            id: 'org-2',
                            name: '廊坊临空经济区大数据管理中心',
                            code: '11131000MB1294820P',
                            type: '事业单位',
                          },
                          {
                            id: 'org-3',
                            name: '河北可信数据流通与隐私计算实验室',
                            code: '91130100MA7N89211D',
                            type: '科研机构',
                          },
                        ]
                          .filter(
                            (item) =>
                              !joinKeyword ||
                              item.name.includes(joinKeyword) ||
                              item.code.includes(joinKeyword)
                          )
                          .map((item) => {
                            const isSelected = selectedOrgToJoin === item.id;
                            return (
                              <div
                                key={item.id}
                                onClick={() => setSelectedOrgToJoin(item.id)}
                                className={cn(
                                  'p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between',
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                                )}
                              >
                                <div>
                                  <div className="font-semibold">{item.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    代码：{item.code} · {item.type}
                                  </div>
                                </div>
                                {isSelected ? (
                                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                ) : (
                                  <span className="text-[11px] text-blue-600 font-medium hover:underline">选择</span>
                                )}
                              </div>
                            );
                          })}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            申请职务/角色
                          </label>
                          <select
                            value={joinRole}
                            onChange={(e) => setJoinRole(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
                          >
                            <option value="法人经办人">法人经办人</option>
                            <option value="数据运营专员">数据运营专员</option>
                            <option value="系统开发工程师">系统开发工程师</option>
                            <option value="合规审计员">合规审计员</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            联系手机号
                          </label>
                          <input
                            type="text"
                            placeholder="请输入手机号"
                            defaultValue="13800138000"
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          申请说明
                        </label>
                        <textarea
                          rows={2}
                          value={joinReason}
                          onChange={(e) => setJoinReason(e.target.value)}
                          placeholder="请简要说明加入事由，便于管理员快速审批"
                          className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none placeholder:text-slate-300"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsJoinModalOpen(false)}
                          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          disabled={!selectedOrgToJoin}
                          onClick={() => setJoinSubmitted(true)}
                          className={cn(
                            'px-5 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-all cursor-pointer',
                            selectedOrgToJoin
                              ? 'bg-blue-600 hover:bg-blue-700 active:scale-98'
                              : 'bg-slate-300 cursor-not-allowed'
                          )}
                        >
                          提交加入申请
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
    </div>
  );
}
