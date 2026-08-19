import { ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

interface LoginRequiredModalProps {
    open: boolean;
    onCancel: () => void;
}

export function LoginRequiredModal({ open, onCancel }: LoginRequiredModalProps) {
    const navigate = useNavigate();

    return (
        <Modal
            title="提示"
            open={open}
            okText="确定"
            cancelText="取消"
            width={520}
            onCancel={onCancel}
            onOk={() => navigate('/login')}
        >
            <div className="flex items-center gap-4 py-3 text-base text-slate-600">
                <ExclamationCircleFilled className="text-3xl" style={{ color: '#F0A43C' }} />
                <span>该功能需要登录，请登录！</span>
            </div>
        </Modal>
    );
}
