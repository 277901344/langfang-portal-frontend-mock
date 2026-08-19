import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, InputNumber, Modal, Select, message } from 'antd';

import { listOwnDataProducts } from '@/modules/commodity-management/services/commodityManagement';
import type { CommodityProductItem } from '@/modules/commodity-management/types/api';
import { UI_CONFIG } from '@/shared/constants/ui';
import { COMMODITY_TYPE_OPTIONS, PRICING_MODEL_OPTIONS } from '@/shared/utils/tradingLabels';
import * as demandService from '../services/demand';
import type { DemandRespondRequest } from '../types/api';

interface RespondModalProps {
    visible: boolean;
    demandId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const { TextArea } = Input;

const buildProductOptionValue = (product: CommodityProductItem) => `${product.productId}::${product.versionId || ''}`;

export const RespondModal: React.FC<RespondModalProps> = ({ visible, demandId, onClose, onSuccess }) => {
    const [form] = Form.useForm<DemandRespondRequest & { relatedProductKey?: string }>();
    const [loading, setLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(false);
    const [products, setProducts] = useState<CommodityProductItem[]>([]);

    useEffect(() => {
        if (!visible) {
            return;
        }
        const fetchProducts = async () => {
            setProductLoading(true);
            try {
                const result = await listOwnDataProducts({ pageNum: 1, pageSize: 200 });
                setProducts(result.data || []);
            } finally {
                setProductLoading(false);
            }
        };
        fetchProducts();
    }, [visible]);

    const productOptions = useMemo(
        () =>
            products.map((item) => ({
                label: `${item.productName || item.productId}${item.versionId ? `（${item.versionId}）` : ''}`,
                value: buildProductOptionValue(item),
            })),
        [products]
    );

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload: DemandRespondRequest = {
                proposal: values.proposal,
                pricingModel: values.pricingModel,
                quotedPrice: values.quotedPrice,
                deliveryType: values.deliveryType,
                connectorId: values.connectorId,
                productId: values.productId,
                versionId: values.versionId,
            };
            setLoading(true);
            await demandService.respondDemand(demandId, payload);
            message.success('需求响应提交成功');
            form.resetFields();
            onSuccess();
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="响应需求"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            width={UI_CONFIG.modal.width}
            maskClosable={UI_CONFIG.modal.maskClosable}
            okText="提交响应"
            cancelText="取消"
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item
                    name="proposal"
                    label="方案说明"
                    rules={[{ required: true, message: '请填写响应方案' }]}
                >
                    <TextArea
                        rows={4}
                        placeholder="描述您能提供的数据服务、交付方式或对接方案"
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="pricingModel"
                        label="定价方式"
                        rules={[{ required: true, message: '请选择定价方式' }]}
                    >
                        <Select options={PRICING_MODEL_OPTIONS} placeholder="请选择" />
                    </Form.Item>

                    <Form.Item
                        name="quotedPrice"
                        label="报价金额"
                        dependencies={['pricingModel']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (getFieldValue('pricingModel') !== 'FREE' && value == null) {
                                        return Promise.reject(new Error('请输入报价金额'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="若免费可不填" />
                    </Form.Item>

                    <Form.Item
                        name="deliveryType"
                        label="交付方式"
                        rules={[{ required: true, message: '请选择交付方式' }]}
                    >
                        <Select options={COMMODITY_TYPE_OPTIONS} placeholder="请选择" />
                    </Form.Item>

                    <Form.Item name="relatedProductKey" label="关联产品">
                        <Select
                            allowClear
                            showSearch
                            loading={productLoading}
                            options={productOptions}
                            placeholder="请选择需要关联的产品"
                            optionFilterProp="label"
                            onChange={(value) => {
                                if (!value) {
                                    form.setFieldsValue({ productId: undefined, versionId: undefined });
                                    return;
                                }
                                const [productId, versionId] = String(value).split('::');
                                form.setFieldsValue({
                                    productId: productId || undefined,
                                    versionId: versionId || undefined,
                                });
                            }}
                        />
                    </Form.Item>
                </div>

                <Form.Item name="productId" hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="versionId" hidden>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};
