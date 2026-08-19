import React, { useState } from 'react';
import { Form, Input, Modal, message } from 'antd';
import type { DemandResponseRejectRequest } from '../types/api';
import * as demandService from '../services/demand';

interface RejectModalProps {
    visible: boolean;
    responseId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const { TextArea } = Input;

export const RejectModal: React.FC<RejectModalProps> = ({ visible, responseId, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await demandService.rejectResponse(responseId, values as DemandResponseRejectRequest);
            message.success('已拒绝该响应');
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
            title="拒绝响应"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="确认拒绝"
            okButtonProps={{ danger: true }}
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item
                    name="rejectReason"
                    label="拒绝理由"
                    rules={[{ required: true, message: '请填写拒绝理由' }]}
                >
                    <TextArea
                        rows={4}
                        placeholder="例如：报价超出预算、交付方式不满足要求"
                        maxLength={200}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
