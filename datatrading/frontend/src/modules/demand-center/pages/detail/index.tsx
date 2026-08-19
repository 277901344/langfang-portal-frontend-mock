import React, { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Descriptions,
    Empty,
    List,
    Popconfirm,
    Space,
    Tag,
    Typography,
    message,
} from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';
import { FormSection } from '@/shared/components/FormSection';
import { LoginRequiredModal } from '@/shared/components/LoginRequiredModal';
import { UI_CONFIG } from '@/shared/constants/ui';
import {
    formatApplicationCategoryLabel,
    formatDeliveryTypeLabel,
    formatPricingModelLabel,
    formatTopicCategoryLabel,
    formatUpdateFrequencyLabel,
    getDemandResponseStatusMeta,
    getDemandStatusMeta,
} from '@/shared/utils/tradingLabels';
import { RejectModal } from '../../components/RejectModal';
import { RespondModal } from '../../components/RespondModal';
import { useUserStore } from '@/store/useUserStore';
import * as demandService from '../../services/demand';
import type { DemandDetailResponse, DemandResponseItem } from '../../types/api';

const { Title, Text } = Typography;

const DemandDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = useUserStore((state) => state.token);
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<DemandDetailResponse | null>(null);
    const [respondVisible, setRespondVisible] = useState(false);
    const [rejectVisible, setRejectVisible] = useState(false);
    const [selectedResponseId, setSelectedResponseId] = useState('');
    const [acceptingResponseId, setAcceptingResponseId] = useState('');
    const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);

    const contentBlockClassName = `${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding} ${UI_CONFIG.block.searchAreaShadow}`;

    const requireLogin = () => {
        if (token) {
            return false;
        }
        setLoginRequiredOpen(true);
        return true;
    };

    const fetchDetail = async () => {
        if (!id) {
            return;
        }
        setLoading(true);
        try {
            const data = await demandService.getDemandDetail(id);
            setDetail(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handlePublish = async () => {
        if (!id || requireLogin()) {
            return;
        }
        await demandService.publishDemand(id);
        message.success('需求发布成功');
        fetchDetail();
    };

    const handleClose = async () => {
        if (!id || requireLogin()) {
            return;
        }
        await demandService.closeDemand(id);
        message.success('需求关闭成功');
        fetchDetail();
    };

    const handleAcceptResponse = async (responseId: string) => {
        if (requireLogin()) {
            return;
        }
        setAcceptingResponseId(responseId);
        try {
            const result = await demandService.acceptResponse(responseId);
            message.success(`已接受响应，订单 ${result.orderNo} 已创建`);
            await fetchDetail();
        } finally {
            setAcceptingResponseId('');
        }
    };

    const detailStatus = useMemo(() => {
        if (!detail) {
            return null;
        }
        return getDemandStatusMeta(detail.status);
    }, [detail]);

    const responseSectionTitle = useMemo(() => {
        if (!detail) {
            return '响应';
        }
        if (detail.canReviewResponses) {
            return `收到的响应（${detail.responseCount || 0}）`;
        }
        return `我的响应（${detail.responses?.length || 0}）`;
    }, [detail]);

    const extraButtons: React.ReactNode[] = [];
    if (detail) {
        if (detail.orderId) {
            extraButtons.push(
                <Button
                    key="view-order"
                    onClick={() => {
                        if (!requireLogin()) {
                            navigate(`/console/trade-order/${detail.orderId}`);
                        }
                    }}
                >
                    查看订单
                </Button>
            );
        }
        if (detail.canEdit) {
            extraButtons.push(
                <Button
                    key="edit"
                    onClick={() => {
                        if (!requireLogin()) {
                            navigate(`/demand-center/${id}/edit`);
                        }
                    }}
                >
                    编辑需求
                </Button>
            );
            if (detail.status === 'DRAFT') {
                extraButtons.push(
                    <Button key="publish" type="primary" onClick={handlePublish}>
                        发布需求
                    </Button>
                );
            }
        }
        if (detail.canClose) {
            extraButtons.push(
                token ? (
                    <Popconfirm key="close" title="确定要关闭该需求吗？" onConfirm={handleClose}>
                        <Button danger>关闭需求</Button>
                    </Popconfirm>
                ) : (
                    <Button key="close" danger onClick={requireLogin}>关闭需求</Button>
                )
            );
        }
        if (detail.canRespond) {
            extraButtons.push(
                <Button
                    key="respond"
                    type="primary"
                    onClick={() => {
                        if (!requireLogin()) {
                            setRespondVisible(true);
                        }
                    }}
                >
                    响应需求
                </Button>
            );
        }
    }

    const renderResponseActions = (item: DemandResponseItem) => {
        const actions: React.ReactNode[] = [];
        if (item.canAccept) {
            actions.push(
                <Button
                    key="accept"
                    type="primary"
                    size="small"
                    loading={acceptingResponseId === item.id}
                    onClick={() => handleAcceptResponse(item.id)}
                >
                    接受
                </Button>
            );
        }
        if (item.canReject) {
            actions.push(
                <Button
                    key="reject"
                    danger
                    size="small"
                    onClick={() => {
                        if (!requireLogin()) {
                            setSelectedResponseId(item.id);
                            setRejectVisible(true);
                        }
                    }}
                >
                    拒绝
                </Button>
            );
        }
        return actions;
    };

    return (
        <PageContainer
            title="需求详情"
            layout="narrow"
            onBack={() => navigate(-1)}
            loading={loading}
            contentClassName="pb-5"
        >
            {detail ? (
                <div className={contentBlockClassName}>
                    <div className="flex flex-col gap-5">
                        <FormSection
                            title="需求概览"
                            variant="shaded"
                            headerExtra={detailStatus ? <Tag color={detailStatus.color}>{detailStatus.text}</Tag> : null}
                        >
                            <div className="flex flex-col gap-5">
                                <Title level={4} style={{ margin: 0 }}>
                                    {detail.title}
                                </Title>
                                <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                                    <Descriptions.Item label="需求编号">{detail.demandNo}</Descriptions.Item>
                                    <Descriptions.Item label="发布方">{detail.publisherName}</Descriptions.Item>
                                    <Descriptions.Item label="发布时间">
                                        {detail.publishedAt ? dayjs(detail.publishedAt).format('YYYY-MM-DD HH:mm') : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="主题分类">
                                        {formatTopicCategoryLabel(undefined, detail.topicCategory)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="应用场景">
                                        {formatApplicationCategoryLabel(undefined, detail.applicationCategory)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="截止日期">
                                        {detail.deadline ? dayjs(detail.deadline).format('YYYY-MM-DD') : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="更新频次">
                                        {formatUpdateFrequencyLabel(undefined, detail.updateFrequency)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </FormSection>

                        <FormSection title="详细说明" variant="shaded">
                            <div className="flex flex-col gap-5">
                                <div>
                                    <div className="mb-2 text-sm font-medium text-slate-700">需求描述</div>
                                    <Text className="whitespace-pre-wrap text-gray-600">
                                        {detail.description || '暂无详细描述'}
                                    </Text>
                                </div>

                                {detail.expectedFields && detail.expectedFields.length > 0 ? (
                                    <div>
                                        <div className="mb-3 text-sm font-medium text-slate-700">期望字段</div>
                                        <Space size={[0, 8]} wrap>
                                            {detail.expectedFields.map((field) => (
                                                <Tag key={field}>{field}</Tag>
                                            ))}
                                        </Space>
                                    </div>
                                ) : null}
                            </div>
                        </FormSection>

                        <FormSection title="商务与交付要求" variant="shaded">
                            <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                                <Descriptions.Item label="预算类型">
                                    {formatPricingModelLabel(detail.budgetType)}
                                </Descriptions.Item>
                                <Descriptions.Item label="预算金额">
                                    {detail.budgetAmount != null ? `${detail.budgetAmount} 元` : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="使用目的" span={3}>
                                    {detail.usagePurpose || '-'}
                                </Descriptions.Item>
                            </Descriptions>
                        </FormSection>

                        {detail.canReviewResponses || (detail.responses && detail.responses.length > 0) ? (
                            <FormSection title={responseSectionTitle} variant="shaded">
                                <List
                                    dataSource={detail.responses}
                                    renderItem={(item) => {
                                        const statusConfig = getDemandResponseStatusMeta(item.status);
                                        return (
                                            <List.Item actions={renderResponseActions(item)}>
                                                <List.Item.Meta
                                                    title={(
                                                        <Space>
                                                            <span>{detail.canReviewResponses ? item.responderName : '我的响应'}</span>
                                                            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                                                        </Space>
                                                    )}
                                                    description={(
                                                        <div className="mt-2 space-y-1">
                                                            <div>
                                                                <span className="text-gray-400">方案说明：</span>
                                                                {item.proposal}
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400">报价：</span>
                                                                {item.quotedPrice != null
                                                                    ? `${item.quotedPrice} 元`
                                                                    : formatPricingModelLabel(item.pricingModel)}
                                                                <span className="mx-2 text-gray-300">|</span>
                                                                <span className="text-gray-400">交付：</span>
                                                                {formatDeliveryTypeLabel(item.deliveryType)}
                                                            </div>
                                                            {item.productId ? (
                                                                <div>
                                                                    <span className="text-gray-400">关联商品：</span>
                                                                    {item.versionId ? `${item.productId} / ${item.versionId}` : item.productId}
                                                                </div>
                                                            ) : null}
                                                            {item.rejectReason ? (
                                                                <div className="text-red-500">
                                                                    拒绝理由：{item.rejectReason}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                />
                                            </List.Item>
                                        );
                                    }}
                                />
                            </FormSection>
                        ) : detail.canReviewResponses ? (
                            <FormSection title="收到的响应" variant="shaded">
                                <Empty description="暂无响应" />
                            </FormSection>
                        ) : null}

                        {extraButtons.length > 0 ? (
                            <div className="flex justify-end border-t border-slate-200 pt-5">
                                <Space size={UI_CONFIG.spacing.buttonGapNum}>{extraButtons}</Space>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : (
                <div className={contentBlockClassName}>
                    <Empty description="未找到需求详情" />
                </div>
            )}

            {id ? (
                <RespondModal
                    visible={respondVisible}
                    demandId={id}
                    onClose={() => setRespondVisible(false)}
                    onSuccess={() => {
                        setRespondVisible(false);
                        fetchDetail();
                    }}
                />
            ) : null}

            <RejectModal
                visible={rejectVisible}
                responseId={selectedResponseId}
                onClose={() => setRejectVisible(false)}
                onSuccess={() => {
                    setRejectVisible(false);
                    fetchDetail();
                }}
            />
            <LoginRequiredModal
                open={loginRequiredOpen}
                onCancel={() => setLoginRequiredOpen(false)}
            />
        </PageContainer>
    );
};

export default DemandDetailPage;
