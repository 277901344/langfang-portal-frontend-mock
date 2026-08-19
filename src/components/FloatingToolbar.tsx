import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquarePlus, MessageCircle, HelpCircle, ArrowUp, X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FloatingToolbar: React.FC = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('数据需求');
  const [feedbackText, setFeedbackText] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsFeedbackOpen(false);
      setFeedbackText('');
      setContactInfo('');
    }, 2000);
  };

  return (
    <>
      {/* 悬浮工具栏 (遵照设计规范 2.10 节：固定右侧悬浮，最多 4 项，48-56px 方形，圆角 8px，hover brand-600) */}
      <aside className="fixed right-4 sm:right-6 bottom-8 sm:bottom-12 z-40 flex flex-col items-center gap-2 pointer-events-auto">
        {/* 工具项 1: 需求发布 */}
        <div className="relative group">
          <Link
            to="/demands"
            className="w-12 h-12 rounded-[8px] bg-[#1459EB] hover:bg-[#0E43B5] text-white shadow-[0_4px_16px_rgba(20,89,235,0.24)] flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
            aria-label="发布数据需求"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </Link>
          <div className="absolute right-14 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1F2937] text-white text-[12px] font-medium rounded-[6px] shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            发布数据需求
          </div>
        </div>

        {/* 工具项 2: 建言反馈 */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="w-12 h-12 rounded-[8px] bg-white hover:bg-[#F7F9FC] text-[#5B6472] hover:text-[#1459EB] border border-[#DDE3EC] hover:border-[#1459EB] shadow-[0_2px_8px_rgba(31,41,55,0.06)] flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
            aria-label="建言反馈"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <div className="absolute right-14 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1F2937] text-white text-[12px] font-medium rounded-[6px] shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            建言反馈
          </div>
        </div>

        {/* 工具项 3: 帮助中心 */}
        <div className="relative group">
          <Link
            to="/docs"
            className="w-12 h-12 rounded-[8px] bg-white hover:bg-[#F7F9FC] text-[#5B6472] hover:text-[#1459EB] border border-[#DDE3EC] hover:border-[#1459EB] shadow-[0_2px_8px_rgba(31,41,55,0.06)] flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
            aria-label="帮助中心"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>
          <div className="absolute right-14 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1F2937] text-white text-[12px] font-medium rounded-[6px] shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            文档与帮助
          </div>
        </div>

        {/* 工具项 4: 回到顶部 */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <button
                type="button"
                onClick={scrollToTop}
                className="w-12 h-12 rounded-[8px] bg-[#1F2937] hover:bg-[#071937] text-white shadow-md flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
                aria-label="回到顶部"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <div className="absolute right-14 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1F2937] text-white text-[12px] font-medium rounded-[6px] shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                回到顶部
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* 建言反馈弹窗 Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2937]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-[12px] bg-white p-6 shadow-[0_4px_16px_rgba(31,41,55,0.12)] border border-[#DDE3EC] text-[#1F2937] space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#DDE3EC] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#E0E8F8] text-[#1459EB] rounded-[8px]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[18px] leading-[26px] font-semibold text-[#1F2937]">廊坊城市可信数据空间 · 建言反馈</h3>
                    <p className="text-[12px] leading-[18px] text-[#5B6472]">倾听您的宝贵意见，助力城市数据要素价值释放</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="p-1.5 text-[#8A94A6] hover:text-[#1F2937] rounded-[6px] hover:bg-[#F7F9FC] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#E8F6EE] text-[#159447] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-[16px] font-semibold text-[#1F2937]">反馈已成功提交！</h4>
                  <p className="text-[14px] text-[#5B6472] max-w-xs mx-auto">
                    感谢您对京畿数港·廊坊城市可信数据空间的关切与支持，我们将尽快核实处理。
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[14px] leading-[22px] font-medium text-[#1F2937] mb-1.5">
                      反馈分类
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['数据需求', '平台建议', '接口对接', '合规咨询', '其他问题'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFeedbackType(t)}
                          className={`h-[32px] px-3 rounded-[6px] text-[13px] font-medium border transition-all ${
                            feedbackType === t
                              ? 'bg-[#1459EB] text-white border-[#1459EB]'
                              : 'bg-[#F7F9FC] text-[#5B6472] border-[#DDE3EC] hover:bg-[#E0E8F8]/60 hover:text-[#1459EB]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[22px] font-medium text-[#1F2937] mb-1.5">
                      详细说明 <span className="text-[#D14343]">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="请具体描述您在数据接入、检索、授权或方案对接中的建议与遇到问题..."
                      className="w-full p-3 rounded-[6px] border border-[#DDE3EC] text-[14px] leading-[22px] text-[#1F2937] placeholder-[#8A94A6] focus:outline-none focus:border-[#1459EB] focus:ring-2 focus:ring-[#1459EB]/20 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[22px] font-medium text-[#1F2937] mb-1.5">
                      联系方式（手机或邮箱，选填）
                    </label>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="方便运营团队与您进一步沟通"
                      className="w-full h-[40px] px-3 rounded-[6px] border border-[#DDE3EC] text-[14px] text-[#1F2937] placeholder-[#8A94A6] focus:outline-none focus:border-[#1459EB] focus:ring-2 focus:ring-[#1459EB]/20 bg-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFeedbackOpen(false)}
                      className="h-[36px] px-4 bg-[#F7F9FC] hover:bg-[#E0E8F8] text-[#5B6472] hover:text-[#1459EB] text-[14px] font-medium rounded-[6px] transition-all border border-[#DDE3EC]"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="h-[36px] px-5 bg-[#1459EB] hover:bg-[#0E43B5] text-white text-[14px] font-medium rounded-[6px] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>提交建言</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
