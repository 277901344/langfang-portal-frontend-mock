import { useState } from 'react';
import { Button, message, Table, Tabs, Tag, Typography } from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';

import { downloadCommoditySampleFile } from '../services/commodityManagement';
import type { CommodityProductItem } from '../types/api';
import {
    formatSampleSize,
    getApiAuthTypeLabel,
    getBlobErrorMessage,
    getMessageQueueInitialOffsetText,
    getNestedRecord,
    getPaginationSummaryText,
    getProductSampleData,
    getProductUsageExample,
    getSampleFiles,
    isCustomSignatureCredentialItem,
    maskTokenUrl,
    normalizeAuthConfig,
    normalizeOssIncrementalConfig,
    normalizePaginationConfig,
    normalizeRequestList,
    normalizeResponseList,
} from '../utils/preview-helpers';

const { Text } = Typography;

interface CommodityUsagePreviewProps {
    product?: CommodityProductItem;
}

function renderAuthDescription(authType: unknown, value: unknown, record: Record<string, unknown>) {
    if (Number(authType) !== 5) {
        return String(value || '-');
    }
    return isCustomSignatureCredentialItem(record)
        ? <Tag color="blue" className="m-0">认证凭证</Tag>
        : <Tag color="cyan" className="m-0">HTTP Header</Tag>;
}

export function CommodityUsagePreview({ product }: CommodityUsagePreviewProps) {
    const [sampleDownloadKey, setSampleDownloadKey] = useState('');

    const handleDownloadSampleFile = async () => {
        const sampleData = getProductSampleData(product);
        const fileUrl = sampleData?.fileUrl ? String(sampleData.fileUrl) : '';
        if (!fileUrl) {
            message.error('样例数据文件不存在');
            return;
        }
        if (sampleDownloadKey) {
            return;
        }

        setSampleDownloadKey(fileUrl);
        try {
            const { blob, fileName } = await downloadCommoditySampleFile(fileUrl);
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = fileName || String(sampleData?.name || '样例数据');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            message.success('样例数据下载已开始');
        } catch (error) {
            message.error(await getBlobErrorMessage(error, '样例数据下载失败'));
        } finally {
            setSampleDownloadKey('');
        }
    };

    const sampleData = getProductSampleData(product);
    const usageExample = getProductUsageExample(product);
    const authConfig = normalizeAuthConfig(usageExample?.authConfig);
    const authItems = authConfig?.items || [];
    const requestHeaders = normalizeRequestList(usageExample?.requestHeaders, 'Header');
    const requestBody = normalizeRequestList(usageExample?.requestBody, 'Query');
    const responseFields = normalizeResponseList(usageExample?.responseFields);
    const messageQueueInitialOffset = getNestedRecord(usageExample, 'messageQueueInitialOffset');
    const paginationConfig = normalizePaginationConfig(usageExample?.pagination);
    const ossIncrementalConfig = normalizeOssIncrementalConfig(usageExample?.ossIncrementalPull);
    const sampleFiles = getSampleFiles(sampleData);
    const isTokenUrlAuthConfig = authConfig?.authType === 4;

    const requestBodyColumns = [
        { title: '参数名称', dataIndex: 'key', key: 'key', render: (value: unknown, record: Record<string, unknown>) => String(value || record.label || '-') },
        { title: '位置', dataIndex: 'path', key: 'path', render: (value: unknown) => String(value || '-') },
        { title: '类型', dataIndex: 'type', key: 'type', render: (value: unknown) => String(value || '-') },
        { title: '说明', dataIndex: 'description', key: 'description', render: (value: unknown) => String(value || '-') },
        { title: '必填', dataIndex: 'required', key: 'required', render: (value: unknown) => value ? '是' : '否' },
    ];
    const requestHeaderColumns = [
        { title: '参数名称', dataIndex: 'key', key: 'key', render: (value: unknown, record: Record<string, unknown>) => String(value || record.label || '-') },
        { title: '类型', dataIndex: 'type', key: 'type', render: (value: unknown) => String(value || '-') },
        { title: '描述', dataIndex: 'description', key: 'description', render: (value: unknown) => String(value || '-') },
        { title: '必填', dataIndex: 'required', key: 'required', render: (value: unknown) => value ? '是' : '否' },
    ];
    const authColumns = isTokenUrlAuthConfig
        ? [
            { title: '参数名', dataIndex: 'key', key: 'key', render: (value: unknown, record: Record<string, unknown>) => String(value || record.label || '-') },
            { title: '位置', dataIndex: 'path', key: 'path', render: (value: unknown) => String(value || 'Query') },
            { title: '描述', dataIndex: 'description', key: 'description', render: (value: unknown) => String(value || '-') },
            { title: '必填', dataIndex: 'required', key: 'required', render: (value: unknown) => value ? '是' : '否' },
        ]
        : [
            { title: '认证项', dataIndex: 'label', key: 'label', render: (value: unknown, record: Record<string, unknown>) => String(value || record.key || '-') },
            { title: '认证标识', dataIndex: 'key', key: 'key', render: (value: unknown, record: Record<string, unknown>) => record.editableKey ? '可填写' : String(value || '-') },
            { title: '描述', dataIndex: 'description', key: 'description', render: (value: unknown, record: Record<string, unknown>) => renderAuthDescription(authConfig?.authType, value, record) },
            { title: '必填', dataIndex: 'required', key: 'required', render: (value: unknown) => value ? '是' : '否' },
        ];

    const renderUsageContent = () => (
        <div className="space-y-5 p-1">
            {messageQueueInitialOffset && (
                <div>
                    <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>首次消费范围</Text>
                    <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                        <Text className="block text-slate-700" style={{ fontSize: 12 }}>
                            {getMessageQueueInitialOffsetText(messageQueueInitialOffset)}
                        </Text>
                    </div>
                </div>
            )}

            {authConfig && authItems.length > 0 && (
                <div>
                    <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>认证配置要求</Text>
                    <div className="mt-2 overflow-hidden rounded-lg border border-slate-100">
                        {isTokenUrlAuthConfig && (
                            <div className="grid grid-cols-3 gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Token URL</Text>
                                    <div className="mt-1 break-all text-[12px] text-slate-700">{maskTokenUrl(authConfig.tokenUrl)}</div>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Token 方法</Text>
                                    <div className="mt-1 text-[12px] text-slate-700">{String(authConfig.tokenMethod || 'GET')}</div>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Token 提取路径</Text>
                                    <div className="mt-1 text-[12px] text-slate-700">{String(authConfig.tokenResponsePath || '$.access_token')}</div>
                                </div>
                            </div>
                        )}
                        {authItems.length > 0 && (
                            <Table
                                size="small"
                                pagination={false}
                                rowKey={(_, index) => `auth-${index}`}
                                dataSource={authItems}
                                columns={authColumns}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={4}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                认证类型：{getApiAuthTypeLabel(authConfig.authType)}
                                            </Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />
                        )}
                    </div>
                </div>
            )}

            {requestHeaders.length > 0 && (
                <div>
                    <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>请求头配置</Text>
                    <div className="mt-2 overflow-hidden rounded-lg border border-slate-100">
                        <Table size="small" pagination={false} rowKey={(_, index) => `header-${index}`} dataSource={requestHeaders} columns={requestHeaderColumns} />
                    </div>
                </div>
            )}

            {requestBody.length > 0 && (
                <div>
                    <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>请求体配置</Text>
                    <div className="mt-2 overflow-hidden rounded-lg border border-slate-100">
                        <Table size="small" pagination={false} rowKey={(_, index) => `body-${index}`} dataSource={requestBody} columns={requestBodyColumns} />
                    </div>
                </div>
            )}

            {paginationConfig && (
                <div>
                    <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>分页配置</Text>
                    <div className="mt-2 space-y-1 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                        <Text className="block text-slate-700" style={{ fontSize: 12 }}>
                            {getPaginationSummaryText(paginationConfig)}
                        </Text>
                        <Text className="block text-slate-500" style={{ fontSize: 12 }}>
                            数据数组路径：{paginationConfig.recordsPath || '未配置，运行时自动推测'}
                        </Text>
                        {(paginationConfig.totalPagesPath || paginationConfig.totalRecordsPath) && (
                            <Text className="block text-slate-500" style={{ fontSize: 12 }}>
                                总页数字段：{paginationConfig.totalPagesPath || '-'}；总记录数字段：{paginationConfig.totalRecordsPath || '-'}
                            </Text>
                        )}
                    </div>
                </div>
            )}

            {ossIncrementalConfig && (
                <div>
                    <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>增量拉取</Text>
                    <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                        <Text className="block text-slate-700" style={{ fontSize: 12 }}>
                            {ossIncrementalConfig.description}
                        </Text>
                    </div>
                </div>
            )}

            <div>
                <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>响应说明配置</Text>
                {responseFields.length > 0 ? (
                    <div className="mt-2 overflow-hidden rounded-lg border border-slate-100">
                        <Table
                            size="small"
                            pagination={false}
                            rowKey={(_, index) => `response-${index}`}
                            dataSource={responseFields}
                            columns={[
                                { title: '字段名称', dataIndex: 'key', key: 'key', render: (value: unknown) => String(value || '-') },
                                { title: '类型', dataIndex: 'type', key: 'type', render: (value: unknown) => String(value || '-') },
                                { title: '字段说明', dataIndex: 'description', key: 'description', render: (value: unknown) => String(value || '-') },
                            ]}
                        />
                    </div>
                ) : (
                    <div className="py-4 text-center text-slate-400 italic" style={{ fontSize: 12 }}>未配置响应字段说明</div>
                )}
            </div>

            <div>
                <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>样本文件</Text>
                {sampleFiles.length > 0 ? (
                    <div className="mt-2 grid grid-cols-2 gap-4">
                        {sampleFiles.map((file, index) => (
                            <div key={String(file.id || file.fileUrl || file.name || index)} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-emerald-50">
                                        <FileTextOutlined className="text-emerald-600" style={{ fontSize: 12 }} />
                                    </div>
                                    <Text strong className="truncate text-slate-800" style={{ fontSize: 12 }}>
                                        {String(file.name || '样例数据')}
                                    </Text>
                                </div>
                                <Tag bordered={false} className="m-0 shrink-0 bg-slate-200/50 text-[10px]">
                                    {formatSampleSize(file.size)}
                                </Tag>
                                {Boolean(file.fileUrl) && (
                                    <Button
                                        size="small"
                                        type="link"
                                        icon={<DownloadOutlined />}
                                        loading={sampleDownloadKey === String(file.fileUrl)}
                                        disabled={Boolean(sampleDownloadKey)}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            void handleDownloadSampleFile();
                                        }}
                                    >
                                        下载
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center text-slate-400 italic" style={{ fontSize: 12 }}>未上传任何样本数据文件</div>
                )}
            </div>
        </div>
    );

    const renderPreprocessContent = () => product?.processConfig ? (
        <pre className="m-0 max-h-80 overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-4 text-[12px] text-slate-700">
            {JSON.stringify(product.processConfig, null, 2)}
        </pre>
    ) : (
        <div className="py-8 text-center text-slate-400 italic">未配置数据预处理</div>
    );

    return (
        <Tabs
            items={[
                { key: 'usage', label: '使用说明', children: renderUsageContent() },
                { key: 'preprocess', label: '数据预处理', children: renderPreprocessContent() },
            ]}
        />
    );
}
