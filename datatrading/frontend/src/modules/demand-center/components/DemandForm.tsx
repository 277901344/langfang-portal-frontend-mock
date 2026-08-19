import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Spin, message } from 'antd';
import type { SelectProps } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { FormSection } from '@/shared/components/FormSection';
import { UI_CONFIG } from '@/shared/constants/ui';
import {
    COMMODITY_TYPE_OPTIONS,
    PRICING_MODEL_OPTIONS,
    UPDATE_FREQUENCY_OPTIONS,
    formatApplicationCategoryLabel,
    formatProductTypeLabel,
    formatTopicCategoryLabel,
    formatUpdateFrequencyLabel,
} from '@/shared/utils/tradingLabels';
import { useTradingDictionaryStore } from '@/store/useTradingDictionaryStore';
import type { DemandDetailResponse, DemandSaveRequest } from '../types/api';
import * as demandService from '../services/demand';

interface DemandFormProps {
    isEdit?: boolean;
    initialData?: DemandDetailResponse;
    demandId?: string;
}

const { TextArea } = Input;

export const DemandForm: React.FC<DemandFormProps> = ({ isEdit = false, initialData, demandId }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const topicCategoryOptions = useTradingDictionaryStore((state) => state.topicCategoryOptions);
    const applicationCategoryOptions = useTradingDictionaryStore((state) => state.applicationCategoryOptions);
    const updateFrequencyOptions = useTradingDictionaryStore((state) => state.updateFrequencyOptions);

    useEffect(() => {
        if (initialData && isEdit) {
            form.setFieldsValue({
                ...initialData,
                deadline: initialData.deadline ? dayjs(initialData.deadline) : undefined,
                expectedFields: initialData.expectedFields || [],
            });
        }
    }, [initialData, isEdit, form]);

    const onFinish = async (values: Record<string, any>) => {
        setLoading(true);
        try {
            const requestData = {
                ...values,
                deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
            } as DemandSaveRequest;

            if (isEdit && demandId) {
                await demandService.updateDemand(demandId, requestData);
                message.success('需求更新成功');
            } else {
                const res = await demandService.createDemand(requestData);
                message.success('需求创建成功');
                navigate(`/demand-center/${res.id}`, { replace: true });
                return;
            }
            navigate('/demand-center');
        } finally {
            setLoading(false);
        }
    };

    const budgetTypeOptions: SelectProps['options'] = PRICING_MODEL_OPTIONS;

    const demandProductTypeOptions = useMemo(
        () =>
            ensureOption(
                COMMODITY_TYPE_OPTIONS,
                initialData?.productType,
                formatProductTypeLabel
            ),
        [initialData?.productType]
    );

    const demandTopicCategoryOptions = useMemo(
        () =>
            ensureOption(toLabelValueOptions(topicCategoryOptions), initialData?.topicCategory, (value) =>
                formatTopicCategoryLabel(undefined, value, value || '-')
            ),
        [initialData?.topicCategory, topicCategoryOptions]
    );

    const demandApplicationCategoryOptions = useMemo(
        () =>
            ensureOption(toLabelValueOptions(applicationCategoryOptions), initialData?.applicationCategory, (value) =>
                formatApplicationCategoryLabel(undefined, value, value || '-')
            ),
        [applicationCategoryOptions, initialData?.applicationCategory]
    );

    const demandUpdateFrequencyOptions = useMemo(() => {
        const sourceOptions =
            updateFrequencyOptions.length > 0 ? toLabelValueOptions(updateFrequencyOptions) : UPDATE_FREQUENCY_OPTIONS;

        return ensureOption(sourceOptions, initialData?.updateFrequency, (value) =>
            formatUpdateFrequencyLabel(undefined, value, value || '-')
        );
    }, [initialData?.updateFrequency, updateFrequencyOptions]);

    return (
        <Spin spinning={loading}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <div className="space-y-6">
                    <FormSection title="基础信息" variant="shaded">
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item
                                    name="title"
                                    label="需求标题"
                                    rules={[{ required: true, message: '请输入需求标题' }]}
                                >
                                    <Input placeholder="请填写简明扼要的需求标题" maxLength={UI_CONFIG.input.maxLength} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="topicCategory" label="主题分类">
                                    <Select
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        options={demandTopicCategoryOptions}
                                        placeholder="请选择主题分类"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="applicationCategory" label="应用场景">
                                    <Select
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        options={demandApplicationCategoryOptions}
                                        placeholder="请选择应用场景"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="productType" label="产品类型">
                                    <Select
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        options={demandProductTypeOptions}
                                        placeholder="请选择产品类型"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="updateFrequency" label="更新频次">
                                    <Select
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        options={demandUpdateFrequencyOptions}
                                        placeholder="请选择更新频次"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item name="deadline" label="截止日期">
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        format="YYYY-MM-DD"
                                        placeholder="请选择需求有效期"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSection>

                    <FormSection title="详细说明" variant="shaded">
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item name="usagePurpose" label="使用目的">
                                    <TextArea
                                        rows={2}
                                        placeholder="简单描述需求方采购数据的用途"
                                        maxLength={UI_CONFIG.input.textAreaMaxLength}
                                        showCount
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item name="description" label="需求描述">
                                    <TextArea
                                        rows={4}
                                        placeholder="详细描述所需的字段或要求"
                                        maxLength={500}
                                        showCount
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label="期望字段（可选）">
                                    <Form.List name="expectedFields">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map(({ key, name, ...restField }) => (
                                                    <Space
                                                        key={key}
                                                        style={{ display: 'flex', marginBottom: 8 }}
                                                        align="baseline"
                                                    >
                                                        <Form.Item
                                                            {...restField}
                                                            name={name}
                                                            rules={[{ required: true, message: '请输入字段名称' }]}
                                                        >
                                                            <Input
                                                                placeholder="字段名称（例如：user_id）"
                                                                style={{ width: 300 }}
                                                            />
                                                        </Form.Item>
                                                        <MinusCircleOutlined
                                                            onClick={() => remove(name)}
                                                            className="text-red-500"
                                                        />
                                                    </Space>
                                                ))}
                                                <Form.Item>
                                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                        添加期望字段
                                                    </Button>
                                                </Form.Item>
                                            </>
                                        )}
                                    </Form.List>
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSection>

                    <FormSection title="商务与交付要求" variant="shaded">
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item
                                    name="budgetType"
                                    label="预算类型"
                                    rules={[{ required: true, message: '请选择预算类型' }]}
                                >
                                    <Select options={budgetTypeOptions} placeholder="请选择" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="budgetAmount"
                                    label="预算金额"
                                    dependencies={['budgetType']}
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (getFieldValue('budgetType') !== 'FREE' && value == null) {
                                                    return Promise.reject(new Error('请输入预算金额'));
                                                }
                                                return Promise.resolve();
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber
                                        min={0}
                                        precision={2}
                                        style={{ width: '100%' }}
                                        placeholder="若为免费可不填"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSection>
                </div>

                <div className="mt-6 flex justify-end">
                    <Space size={UI_CONFIG.spacing.buttonGapNum}>
                        <Button onClick={() => navigate(-1)}>取消</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {isEdit ? '保存修改' : '创建需求'}
                        </Button>
                    </Space>
                </div>
            </Form>
        </Spin>
    );
};

function ensureOption(
    options: NonNullable<SelectProps['options']>,
    currentValue: string | undefined,
    formatter: (value?: string) => string
): NonNullable<SelectProps['options']> {
    if (!currentValue || options.some((option) => option?.value === currentValue)) {
        return options;
    }

    return [
        ...options,
        {
            value: currentValue,
            label: formatter(currentValue),
        },
    ];
}

function toLabelValueOptions(options: NonNullable<SelectProps['options']>): NonNullable<SelectProps['options']> {
    return options.map((option) => ({
        ...option,
        value: typeof option?.label === 'string' ? option.label : option?.value,
    }));
}
