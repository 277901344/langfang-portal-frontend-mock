import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Pagination, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import FilePreviewModal from '@/shared/components/FilePreviewModal';
import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import { getFileNameFromUrl, isTextPreviewFile } from '@/shared/utils/file';
import { listAdminFundFlows, previewFundAttachment, voidDebitFlow, voidRechargeFlow } from '../services/fund';
import type { FundFlowItem, FundFlowQueryRequest } from '../types/api';
import { ACCOUNT_ROLE_OPTIONS, FLOW_COLOR, FLOW_TYPE_LABEL, FLOW_TYPE_OPTIONS, ROLE_LABEL } from '../constants';

const FundManagementFlowsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [flows, setFlows] = useState<FundFlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContentType, setPreviewContentType] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [query, setQuery] = useState<FundFlowQueryRequest>({
    pageNum: 1,
    pageSize: UI_CONFIG.pagination.tablePageSize,
  });

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchFlows = async (nextQuery: FundFlowQueryRequest) => {
    setLoading(true);
    try {
      const result = await listAdminFundFlows(nextQuery);
      setFlows(result.data || []);
      setTotal(result.dataCount || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFlows(query);
  }, [query]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setQuery((prev) => ({
      ...prev,
      ...values,
      pageNum: 1,
    }));
  };

  const handleReset = () => {
    form.resetFields();
    setQuery({
      pageNum: 1,
      pageSize: UI_CONFIG.pagination.tablePageSize,
    });
  };

  const handleVoidRecharge = async (flowId: number) => {
    await voidRechargeFlow(flowId);
    message.success('充值作废成功');
    await fetchFlows(query);
  };

  const handleVoidDebit = async (flowId: number) => {
    await voidDebitFlow(flowId);
    message.success('扣费作废成功');
    await fetchFlows(query);
  };

  const handlePreview = async (fileUrl: string, fileName?: string) => {
    let nextPreviewUrl = fileUrl;
    let nextPreviewContentType = '';
    let nextPreviewText = '';

    if (!/^https?:\/\//i.test(fileUrl)) {
      const previewResponse = await previewFundAttachment(fileUrl);
      nextPreviewContentType = previewResponse.contentType || previewResponse.blob.type || '';

      if (isTextPreviewFile(fileUrl, nextPreviewContentType)) {
        nextPreviewText = await previewResponse.blob.text();
      } else {
        nextPreviewUrl = window.URL.createObjectURL(previewResponse.blob);
      }
    }

    if (previewUrl.startsWith('blob:') && previewUrl !== nextPreviewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(nextPreviewUrl);
    setPreviewContentType(nextPreviewContentType);
    setPreviewText(nextPreviewText);
    setPreviewTitle(fileName || getFileNameFromUrl(fileUrl) || '附件预览');
    setPreviewOpen(true);
  };

  const handleCancelPreview = () => {
    if (previewUrl.startsWith('blob:')) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewOpen(false);
    setPreviewUrl('');
    setPreviewContentType('');
    setPreviewText('');
    setPreviewTitle('');
  };

  const renderAttachment = (attachmentUrl?: string) => {
    if (!attachmentUrl) {
      return '-';
    }

    const fileName = getFileNameFromUrl(attachmentUrl) || '附件';

    return (
      <Space size={6} wrap>
        <span className="max-w-[180px] truncate text-slate-700" title={fileName}>
          {fileName}
        </span>
        <Button type="link" style={{ padding: 0 }} onClick={() => void handlePreview(attachmentUrl, fileName)}>
          预览
        </Button>
      </Space>
    );
  };

  const columns: ColumnsType<FundFlowItem> = [
    {
      title: '流水号',
      dataIndex: 'flowNo',
      width: 220,
    },
    {
      title: '操作类型',
      dataIndex: 'flowType',
      width: 120,
      render: (value: string) => (
        <Tag color={FLOW_COLOR[value] || 'default'}>{FLOW_TYPE_LABEL[value] || value || '-'}</Tag>
      ),
    },
    {
      title: '主体名称',
      dataIndex: 'subjectName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '账户角色',
      dataIndex: 'accountRole',
      width: 120,
      render: (value: string) => ROLE_LABEL[value] || value || '-',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
    },
    {
      title: '关联订单',
      dataIndex: 'orderNo',
      width: 180,
      render: (value?: string) => value || '-',
    },
    {
      title: '附件',
      dataIndex: 'attachmentUrl',
      width: 260,
      render: (value?: string) => renderAttachment(value),
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      width: 140,
      render: (value?: string) => value || '-',
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: FundFlowItem) => {
        if (record.relatedFlowId) {
          return '-';
        }
        if (record.flowType === 'RECHARGE') {
          return (
            <Popconfirm title="确认执行充值作废吗？" onConfirm={() => void handleVoidRecharge(record.id)}>
              <Button type="link" danger style={{ padding: 0 }}>
                充值作废
              </Button>
            </Popconfirm>
          );
        }
        if (record.flowType === 'DEBIT') {
          return (
            <Popconfirm title="确认执行扣费作废吗？" onConfirm={() => void handleVoidDebit(record.id)}>
              <Button type="link" danger style={{ padding: 0 }}>
                扣费作废
              </Button>
            </Popconfirm>
          );
        }
        return '-';
      },
    },
  ];

  return (
    <PageContainer title="资金流水" layout="fluid">
      <div
        className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.searchAreaPadding} ${UI_CONFIG.block.searchAreaShadow} ${UI_CONFIG.spacing.searchToContent}`}
      >
        <Form form={form} layout="inline">
          <Form.Item name="keyword" label="关键字">
            <Input allowClear placeholder="主体名称 / 流水号 / 订单号" style={{ width: 280 }} />
          </Form.Item>
          <Form.Item name="flowType" label="操作类型">
            <Select allowClear placeholder="全部类型" style={{ width: 180 }} options={FLOW_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="accountRole" label="账户角色">
            <Select allowClear placeholder="全部角色" style={{ width: 160 }} options={ACCOUNT_ROLE_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space size={UI_CONFIG.spacing.buttonGapNum}>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      <div className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding}`}>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={flows}
          pagination={false}
          tableLayout="fixed"
          scroll={{ x: 1700 }}
        />
        <div className="mt-4 flex justify-end" style={{ marginTop: UI_CONFIG.spacing.tableToPaginationNum }}>
          <Pagination
            current={query.pageNum}
            pageSize={query.pageSize}
            total={total}
            showSizeChanger
            showTotal={(count) => `共 ${count} 条`}
            onChange={(page, pageSize) =>
              setQuery((prev) => ({
                ...prev,
                pageNum: page,
                pageSize,
              }))
            }
          />
        </div>
      </div>

      <FilePreviewModal
        open={previewOpen}
        title={previewTitle}
        previewUrl={previewUrl}
        previewContentType={previewContentType}
        textContent={previewText}
        onCancel={handleCancelPreview}
      />
    </PageContainer>
  );
};

export default FundManagementFlowsPage;
