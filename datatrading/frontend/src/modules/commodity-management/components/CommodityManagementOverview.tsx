import React from 'react';
import { Button, Card, Empty, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { UI_CONFIG } from '@/shared/constants/ui';

const { Paragraph, Text } = Typography;

const CommodityManagementOverview: React.FC = () => {
    return (
        <Card
            bordered={false}
            className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding}`}
        >
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Text strong className="text-base text-slate-900">
                        平台商品管理占位
                    </Text>
                    <Paragraph className="mb-0 mt-2 text-slate-500">
                        这里预留给后续“商品上架、编辑、发布、下架、定价、封面、富文本详情”等后台能力。
                    </Paragraph>
                </div>
                <Space>
                    <Button type="primary" icon={<PlusOutlined />} disabled>
                        新建商品
                    </Button>
                </Space>
            </div>

            <div className="commodity-management-placeholder rounded-2xl bg-slate-50 py-16">
                <Empty description="商品管理模块初始化完成，待后续功能接入" />
            </div>
        </Card>
    );
};

export default CommodityManagementOverview;
