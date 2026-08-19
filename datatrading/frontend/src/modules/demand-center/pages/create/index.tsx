import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import { DemandForm } from '../../components/DemandForm';

const contentBlockClassName = `${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding} shadow-sm`;

const CreateDemandPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <PageContainer title="发布需求" layout="narrow" onBack={() => navigate(-1)}>
            <div className={contentBlockClassName}>
                <DemandForm isEdit={false} />
            </div>
        </PageContainer>
    );
};

export default CreateDemandPage;
