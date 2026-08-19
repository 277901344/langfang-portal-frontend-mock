import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import { DemandForm } from '../../components/DemandForm';
import * as demandService from '../../services/demand';
import type { DemandDetailResponse } from '../../types/api';

const contentBlockClassName = `${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding} shadow-sm`;

const EditDemandPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState<DemandDetailResponse | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        demandService
            .getDemandDetail(id)
            .then((data) => {
                setInitialData(data);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    return (
        <PageContainer title="编辑需求" layout="narrow" onBack={() => navigate(-1)} loading={loading}>
            <div className={contentBlockClassName}>
                {initialData && <DemandForm isEdit={true} initialData={initialData} demandId={id} />}
            </div>
        </PageContainer>
    );
};

export default EditDemandPage;
