import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  X,
  Building2,
  Cpu,
  ArrowRight,
  Loader2,
  Check,
  ExternalLink,
  Lock,
  FileSignature,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessWizard } from '../context/AccessWizardContext';
import { getSpSsoLaunchUrl } from '../lib/auth';
import { platformLinks } from '../lib/platformLinks';

export function AccessWizardModal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isOpen,
    targetProduct,
    closeWizard,
    deployConnector,
    applyAuthorization,
    getStepStatuses,
  } = useAccessWizard();

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStepMsg, setDeployStepMsg] = useState('');

  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStepMsg, setAuthStepMsg] = useState('');

  if (!isOpen || !targetProduct) return null;

  // Real or product-preset statuses
  const {
    isAuth,
    isConnector,
    hasAuthMgmt,
    isAuthorized,
  } = getStepStatuses(targetProduct.productId);

  const totalSteps = 2 + (hasAuthMgmt ? 1 : 0);
  const readyCount =
    (isAuth ? 1 : 0) +
    (isConnector ? 1 : 0) +
    (hasAuthMgmt ? (isAuthorized ? 1 : 0) : 0);

  const handleProceedApply = async () => {
    closeWizard();
    if (targetProduct.mode === 'launch_connector') {
      try {
        const result = await getSpSsoLaunchUrl(platformLinks.service);
        const url = result?.launchUrl || platformLinks.service;
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch {
        window.open(platformLinks.service, '_blank', 'noopener,noreferrer');
      }
    } else {
      navigate(`/products/${targetProduct.productId}/apply`);
    }
  };

  const handleGoIdentity = () => {
    closeWizard();
    navigate('/portal-management?tab=institution');
  };

  const handleDeployConnectorClick = async () => {
    setIsDeploying(true);
    setDeployStepMsg('正在初始化边缘数据连接器节点...');

    setTimeout(() => {
      setDeployStepMsg('与廊坊数据空间安全审计引擎绑定信任密钥...');
    }, 600);

    setTimeout(async () => {
      setDeployStepMsg('数据通道链路在线连通测试通过！');
      await deployConnector(targetProduct.productId);
      setIsDeploying(false);
    }, 1200);
  };

  const handleApplyAuthClick = async () => {
    setIsAuthorizing(true);
    setAuthStepMsg('正在对接廊坊数据授权运营平台...');

    setTimeout(() => {
      setAuthStepMsg('正在向核验引擎提交合规受托凭证及数据安全承诺...');
    }, 600);

    setTimeout(async () => {
      setAuthStepMsg('授权运营申请审核通过！生成凭证 Auth-2026-88092');
      await applyAuthorization(targetProduct.productId);
      setIsAuthorizing(false);
    }, 1200);
  };

  // Step indices for uncompleted steps
  let pendingStepCounter = 1;
  const showAuthStep = !isAuth;
  const authPendingIndex = showAuthStep ? pendingStepCounter++ : 0;

  const showConnectorStep = !isConnector;
  const connectorPendingIndex = showConnectorStep ? pendingStepCounter++ : 0;

  const showAuthMgmtStep = hasAuthMgmt && !isAuthorized;
  const authMgmtPendingIndex = showAuthMgmtStep ? pendingStepCounter++ : 0;

  const pendingCount = (showAuthStep ? 1 : 0) + (showConnectorStep ? 1 : 0) + (showAuthMgmtStep ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2937]/50 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-[12px] border border-[#DDE3EC] shadow-[0_4px_16px_rgba(31,41,55,0.12)] w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 顶部标题栏 */}
        <div className="p-5 border-b border-[#DDE3EC] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-[8px] bg-[#1459EB] text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[16px] leading-[24px] font-semibold text-[#1F2937] truncate" title={targetProduct.productName}>
                {targetProduct.productName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[12px] leading-[18px] text-[#5B6472] font-normal">
                  申请准入检测向导
                </p>
                {pendingCount > 0 ? (
                  <span className="inline-flex items-center text-[11px] font-medium text-[#D97706] bg-[#FEF5E7] px-1.5 py-0.5 rounded">
                    待完成 {pendingCount} 项
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] font-medium text-[#159447] bg-[#E8F6EE] px-1.5 py-0.5 rounded">
                    准入已全部就绪
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeWizard}
            className="text-[#8A94A6] hover:text-[#1F2937] p-1.5 rounded-[6px] hover:bg-[#F7F9FC] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 弹窗内容主体 */}
        <div className="p-5 space-y-3.5 overflow-y-auto">

          {/* 当所有准入步骤均已完成时 */}
          {pendingCount === 0 && (
            <div className="p-6 rounded-[8px] bg-[#E8F6EE]/40 border border-[#159447]/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#E8F6EE] text-[#159447] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-[15px] font-semibold text-[#1F2937]">准入条件检测已全部通过</h4>
              <p className="text-[13px] text-[#5B6472] max-w-md mx-auto">
                您的主体身份、数据连接器及相关授权条件均已满足，可直接点击下方按钮继续申请使用。
              </p>
            </div>
          )}

          {/* 步骤: 身份认证 (仅在未完成时展示) */}
          {showAuthStep && (
            <div className="p-3.5 rounded-[8px] border border-[#DDE3EC] bg-white shadow-[0_2px_8px_rgba(31,41,55,0.04)] hover:border-[#1459EB] transition-all flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[6px] bg-[#F7F9FC] text-[#5B6472] flex items-center justify-center shrink-0 font-medium text-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] leading-[22px] font-medium text-[#1F2937]">Step {authPendingIndex}: 身份认证</span>
                    <span className="inline-flex items-center h-[22px] px-2 rounded-[6px] bg-[#FEF5E7] text-[#D97706] text-[12px] font-medium">
                      未完成
                    </span>
                  </div>
                  <p className="text-[12px] leading-[18px] text-[#5B6472] truncate mt-0.5">
                    需提交企业/机构统一社会信用代码及法定代表人授权
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoIdentity}
                className="shrink-0 bg-[#1459EB] hover:bg-[#0E43B5] text-white text-[13px] font-medium px-3 h-[32px] rounded-[6px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>前往身份认证</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* 步骤: 连接器部署 (仅在未部署时展示，依赖身份认证) */}
          {showConnectorStep && (
            <div
              className={`p-3.5 rounded-[8px] border transition-all flex items-center justify-between gap-3 ${
                !isAuth
                  ? 'bg-[#F7F9FC]/70 border-[#DDE3EC] opacity-75'
                  : 'bg-white border-[#DDE3EC] shadow-[0_2px_8px_rgba(31,41,55,0.04)] hover:border-[#1459EB]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-[6px] flex items-center justify-center shrink-0 font-medium text-sm ${
                    !isAuth ? 'bg-[#F7F9FC] text-[#8A94A6]' : 'bg-[#F7F9FC] text-[#5B6472]'
                  }`}
                >
                  {!isAuth ? (
                    <Lock className="w-4 h-4 text-[#8A94A6]" />
                  ) : (
                    <Cpu className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] leading-[22px] font-medium text-[#1F2937]">Step {connectorPendingIndex}: 连接器部署/关联</span>
                    <span className="inline-flex items-center h-[22px] px-2 rounded-[6px] bg-[#FEF5E7] text-[#D97706] text-[12px] font-medium">
                      未部署
                    </span>
                  </div>
                  <p className="text-[12px] leading-[18px] text-[#5B6472] truncate mt-0.5">
                    {!isAuth
                      ? '需先完成前置身份认证，方可关联部署连接器'
                      : `需将数据节点连接器关联绑定至「${targetProduct.connectorName || '数据提供方节点'}」`}
                  </p>
                </div>
              </div>

              {isAuth ? (
                <button
                  type="button"
                  onClick={() => {
                    closeWizard();
                    navigate(`/platform/service?tab=connector_register&productId=${targetProduct.productId}&name=${encodeURIComponent(targetProduct.connectorName || targetProduct.productName)}`);
                  }}
                  className="shrink-0 bg-[#1459EB] hover:bg-[#0E43B5] text-white text-[13px] font-medium px-3 h-[32px] rounded-[6px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>前往部署/关联</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="shrink-0 bg-[#F7F9FC] text-[#8A94A6] border border-[#DDE3EC] text-[13px] font-medium px-3 h-[32px] rounded-[6px] cursor-not-allowed flex items-center gap-1"
                  title="请先完成身份认证"
                >
                  <Lock className="w-3 h-3" />
                  <span>需先完成前置步骤</span>
                </button>
              )}
            </div>
          )}

          {/* 部署提示过程消息 */}
          {isDeploying && (
            <div className="p-3 bg-[#E0E8F8] border border-[#1459EB]/20 rounded-[6px] text-[13px] text-[#1459EB] flex items-center gap-2 animate-in fade-in">
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#1459EB]" />
              <span className="font-medium">{deployStepMsg}</span>
            </div>
          )}

          {/* 步骤: 数据授权运营平台申请 (仅在开启授权管理且未授权时展示) */}
          {showAuthMgmtStep && (
            <div
              className={`p-3.5 rounded-[8px] border transition-all flex items-center justify-between gap-3 ${
                !isConnector
                  ? 'bg-[#F7F9FC]/70 border-[#DDE3EC] opacity-75'
                  : 'bg-white border-[#1459EB]/40 shadow-[0_2px_8px_rgba(31,41,55,0.04)] ring-1 ring-[#1459EB]/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-[6px] flex items-center justify-center shrink-0 font-medium text-sm ${
                    !isConnector ? 'bg-[#F7F9FC] text-[#8A94A6]' : 'bg-[#E0E8F8] text-[#1459EB]'
                  }`}
                >
                  {!isConnector ? (
                    <Lock className="w-4 h-4 text-[#8A94A6]" />
                  ) : (
                    <FileSignature className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] leading-[22px] font-medium text-[#1F2937]">Step {authMgmtPendingIndex}: 授权运营平台申请</span>
                    <span className="inline-flex items-center h-[22px] px-2 rounded-[6px] bg-[#FEF5E7] text-[#D97706] text-[12px] font-medium">
                      待前往平台申请
                    </span>
                  </div>
                  <p className="text-[12px] leading-[18px] text-[#5B6472] truncate mt-0.5">
                    {!isConnector
                      ? '需先完成连接器部署/关联，方可前往授权平台申请'
                      : '产品已开启授权管理，需前往授权运营平台提交合规使用申请'}
                  </p>
                </div>
              </div>

              {isConnector ? (
                <button
                  type="button"
                  disabled={isAuthorizing}
                  onClick={handleApplyAuthClick}
                  className="shrink-0 bg-[#1459EB] hover:bg-[#0E43B5] text-white text-[13px] font-medium px-3 h-[32px] rounded-[6px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  {isAuthorizing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>跳转申请中...</span>
                    </>
                  ) : (
                    <>
                      <span>前往授权平台申请</span>
                      <ExternalLink className="w-3 h-3" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="shrink-0 bg-[#F7F9FC] text-[#8A94A6] border border-[#DDE3EC] text-[13px] font-medium px-3 h-[32px] rounded-[6px] cursor-not-allowed flex items-center gap-1"
                  title="请先完成连接器部署/关联"
                >
                  <Lock className="w-3 h-3" />
                  <span>需先完成前置步骤</span>
                </button>
              )}
            </div>
          )}

          {/* 授权过程提示消息 */}
          {isAuthorizing && (
            <div className="p-3 bg-[#E0E8F8] border border-[#1459EB]/20 rounded-[6px] text-[13px] text-[#1459EB] flex items-center gap-2 animate-in fade-in">
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#1459EB]" />
              <span className="font-medium">{authStepMsg}</span>
            </div>
          )}

        </div>

        {/* 底部操作按钮 */}
        <div className="p-4 bg-[#F7F9FC] border-t border-[#DDE3EC] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={closeWizard}
            className="h-[36px] px-4 rounded-[6px] text-[14px] font-medium text-[#5B6472] hover:bg-[#E0E8F8] hover:text-[#1459EB] transition-colors cursor-pointer"
          >
            取消
          </button>

          {readyCount === totalSteps ? (
            <button
              type="button"
              onClick={handleProceedApply}
              className="h-[36px] bg-[#1459EB] hover:bg-[#0E43B5] text-white font-medium px-5 rounded-[6px] text-[14px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span>
                {targetProduct.mode === 'launch_connector'
                  ? '准备就绪，进入连接器节点'
                  : '准备就绪，继续申请使用'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="h-[36px] bg-[#DDE3EC] text-[#8A94A6] font-medium px-5 rounded-[6px] text-[14px] cursor-not-allowed"
            >
              按顺序完成上述步骤后可继续
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
