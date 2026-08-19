import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Pagination, Select, Space, Table, Upload, message } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

import FilePreviewModal from '@/shared/components/FilePreviewModal';
import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import { getFileDownloadUrl, getFileNameFromUrl, isTextPreviewFile } from '@/shared/utils/file';
import {
  listAdminFundAccounts,
  listFundSubjects,
  previewFundAttachment,
  rechargeFundAccount,
  removeFundAttachment,
  uploadFundAttachment,
} from '../services/fund';
import type { FundAccountItem, FundAccountQueryRequest, FundSubjectOption } from '../types/api';
import { ACCOUNT_ROLE_OPTIONS, ROLE_LABEL } from '../constants';

const FundManagementAccountsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [rechargeForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<FundSubjectOption[]>([]);
  const [accounts, setAccounts] = useState<FundAccountItem[]>([]);
  const [total, setTotal] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContentType, setPreviewContentType] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [previewDownloadUrl, setPreviewDownloadUrl] = useState('');
  const [query, setQuery] = useState<FundAccountQueryRequest>({
    pageNum: 1,
    pageSize: UI_CONFIG.pagination.tablePageSize,
  });

  const subjectSelectOptions = useMemo(
    () =>
      subjectOptions.map((item) => ({
        label: item.subjectName,
        value: item.id,
        subjectName: item.subjectName,
      })),
    [subjectOptions]
  );

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchAccounts = async (nextQuery: FundAccountQueryRequest) => {
    setLoading(true);
    try {
      const result = await listAdminFundAccounts(nextQuery);
      setAccounts(result.data || []);
      setTotal(result.dataCount || 0);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (keyword?: string) => {
    setSubjectLoading(true);
    try {
      const result = await listFundSubjects({ keyword, pageNum: 1, pageSize: 20 });
      setSubjectOptions(result.data || []);
    } finally {
      setSubjectLoading(false);
    }
  };

  useEffect(() => {
    void fetchAccounts(query);
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

  const openRechargeModal = async () => {
    rechargeForm.resetFields();
    rechargeForm.setFieldValue('attachmentFiles', []);
    setRechargeOpen(true);
    await fetchSubjects();
  };

  const extractAttachmentUrl = (fileList?: UploadFile[]) => {
    const firstFile = Array.isArray(fileList) && fileList.length > 0 ? fileList[0] : null;
    return (firstFile?.response as string | undefined) || firstFile?.url || '';
  };

  const handleSubmitRecharge = async () => {
    const values = await rechargeForm.validateFields();
    const selected = subjectSelectOptions.find((item) => item.value === values.userIdentityCode);

    setSubmitting(true);
    try {
      await rechargeFundAccount({
        userIdentityCode: values.userIdentityCode,
        subjectName: selected?.subjectName || '',
        amount: values.amount,
        attachmentUrl: extractAttachmentUrl(values.attachmentFiles),
        remark: values.remark,
      });
      message.success('充值成功');
      setRechargeOpen(false);
      await fetchAccounts(query);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = async (fileLike: UploadFile | { url: string; name?: string }) => {
    const fileUrl = ('response' in fileLike ? (fileLike.response as string | undefined) : undefined) || fileLike.url;
    if (!fileUrl) {
      return;
    }

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
    setPreviewTitle(fileLike.name || getFileNameFromUrl(fileUrl) || '附件预览');
    setPreviewDownloadUrl(getFileDownloadUrl(fileUrl));
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
    setPreviewDownloadUrl('');
  };

  const beforeAttachmentUpload: UploadProps['beforeUpload'] = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('附件大小不能超过 10MB');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleAttachmentUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const fileUrl = await uploadFundAttachment(file as File);
      onSuccess?.(fileUrl);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleAttachmentRemove: UploadProps['onRemove'] = async (file) => {
    const fileUrl = (file.response as string | undefined) || file.url;
    if (!fileUrl) {
      return true;
    }

    try {
      await removeFundAttachment(fileUrl);
      message.success('附件删除成功');
      return true;
    } catch {
      message.error('附件删除失败');
      return false;
    }
  };

  const uploadProps: UploadProps = {
    maxCount: 1,
    multiple: false,
    customRequest: handleAttachmentUpload,
    onRemove: handleAttachmentRemove,
    onPreview: (file) => void handlePreview(file),
    beforeUpload: beforeAttachmentUpload,
  };

  const columns: ColumnsType<FundAccountItem> = [
    {
      title: '主体名称',
      dataIndex: 'subjectName',
      width: 220,
      ellipsis: true,
    },
    {
      title: '主体标识',
      dataIndex: 'userIdentityCode',
      width: 240,
      ellipsis: true,
    },
    {
      title: '账户角色',
      dataIndex: 'accountRole',
      width: 120,
      render: (value: string) => ROLE_LABEL[value] || value || '-',
    },
    {
      title: '当前余额',
      dataIndex: 'availableBalance',
      width: 120,
    },
    {
      title: '累计充值',
      dataIndex: 'totalRechargeAmount',
      width: 120,
    },
    {
      title: '累计扣费',
      dataIndex: 'totalDebitAmount',
      width: 120,
    },
    {
      title: '累计收入',
      dataIndex: 'totalIncomeAmount',
      width: 120,
    },
  ];

  return (
    <PageContainer
      title="账户列表"
      layout="fluid"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openRechargeModal}>
          新增充值
        </Button>
      }
    >
      <div
        className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.searchAreaPadding} ${UI_CONFIG.block.searchAreaShadow} ${UI_CONFIG.spacing.searchToContent}`}
      >
        <Form form={form} layout="inline">
          <Form.Item name="keyword" label="关键字">
            <Input allowClear placeholder="主体名称 / 主体标识 / 账户号" style={{ width: 280 }} />
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
          dataSource={accounts}
          pagination={false}
          tableLayout="fixed"
          scroll={{ x: 1060 }}
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

      <Modal
        title="新增充值"
        open={rechargeOpen}
        onCancel={() => setRechargeOpen(false)}
        onOk={() => void handleSubmitRecharge()}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={rechargeForm} layout="vertical">
          <Form.Item
            name="userIdentityCode"
            label="主体"
            rules={[{ required: true, message: '请选择主体' }]}
          >
            <Select
              showSearch
              filterOption={false}
              placeholder="请选择主体"
              options={subjectSelectOptions}
              loading={subjectLoading}
              onSearch={(value) => void fetchSubjects(value)}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入充值金额' }]}
          >
            <InputNumber
              min={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入充值金额"
            />
          </Form.Item>
          <Form.Item
            name="attachmentFiles"
            label="附件信息"
            valuePropName="fileList"
            getValueFromEvent={(event) => {
              if (Array.isArray(event)) {
                return event;
              }
              return event?.fileList || [];
            }}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <FilePreviewModal
        open={previewOpen}
        title={previewTitle}
        previewUrl={previewUrl}
        previewContentType={previewContentType}
        textContent={previewText}
        downloadUrl={previewDownloadUrl}
        onCancel={handleCancelPreview}
      />
    </PageContainer>
  );
};

export default FundManagementAccountsPage;
