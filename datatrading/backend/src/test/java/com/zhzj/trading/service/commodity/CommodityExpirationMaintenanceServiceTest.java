package com.zhzj.trading.service.commodity;

import com.zhzj.trading.dao.commodity.CommodityStatusInfoServiceDao;
import com.zhzj.trading.dao.commodity.DataCommodityDao;
import com.zhzj.trading.model.commodity.CommodityStatusInfoEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CommodityExpirationMaintenanceServiceTest {

    private DataCommodityDao dataCommodityDao;
    private CommodityStatusInfoServiceDao statusInfoServiceDao;
    private TransactionTemplate transactionTemplate;
    private CommodityExpirationMaintenanceService service;

    @BeforeEach
    void setUp() {
        dataCommodityDao = mock(DataCommodityDao.class);
        statusInfoServiceDao = mock(CommodityStatusInfoServiceDao.class);
        transactionTemplate = mock(TransactionTemplate.class);
        when(transactionTemplate.execute(any())).thenAnswer(invocation -> {
            TransactionCallback<?> callback = invocation.getArgument(0);
            return callback.doInTransaction(mock(TransactionStatus.class));
        });
        service = new CommodityExpirationMaintenanceService(dataCommodityDao, statusInfoServiceDao, transactionTemplate);
    }

    @Test
    void unpublishExpiredCommoditiesSkipsWhenDisabled() {
        ReflectionTestUtils.setField(service, "commodityExpireCloseEnabled", false);

        service.unpublishExpiredCommodities();

        verify(dataCommodityDao, never()).selectExpiredPublishedCommodityIds(any());
        verify(dataCommodityDao, never()).unpublishExpiredCommodity(any(), any());
        verify(statusInfoServiceDao, never()).save(any());
    }

    @Test
    void unpublishExpiredCommoditiesWritesLogOnlyWhenUpdateSucceeds() {
        ReflectionTestUtils.setField(service, "commodityExpireCloseEnabled", true);
        when(dataCommodityDao.selectExpiredPublishedCommodityIds(any(Date.class)))
                .thenReturn(List.of("commodity-1", "commodity-2"));
        when(dataCommodityDao.unpublishExpiredCommodity(eq("commodity-1"), any(Date.class))).thenReturn(1);
        when(dataCommodityDao.unpublishExpiredCommodity(eq("commodity-2"), any(Date.class))).thenReturn(0);
        when(statusInfoServiceDao.save(any(CommodityStatusInfoEntity.class))).thenReturn(true);

        service.unpublishExpiredCommodities();

        verify(dataCommodityDao).unpublishExpiredCommodity(eq("commodity-1"), any(Date.class));
        verify(dataCommodityDao).unpublishExpiredCommodity(eq("commodity-2"), any(Date.class));
        verify(statusInfoServiceDao).save(any(CommodityStatusInfoEntity.class));
    }

    @Test
    void unpublishExpiredCommoditiesContinuesWhenSingleCommodityFails() {
        ReflectionTestUtils.setField(service, "commodityExpireCloseEnabled", true);
        when(dataCommodityDao.selectExpiredPublishedCommodityIds(any(Date.class)))
                .thenReturn(List.of("commodity-1", "commodity-2"));
        when(dataCommodityDao.unpublishExpiredCommodity(eq("commodity-1"), any(Date.class)))
                .thenThrow(new IllegalStateException("database unavailable"));
        when(dataCommodityDao.unpublishExpiredCommodity(eq("commodity-2"), any(Date.class))).thenReturn(1);
        when(statusInfoServiceDao.save(any(CommodityStatusInfoEntity.class))).thenReturn(true);

        service.unpublishExpiredCommodities();

        verify(dataCommodityDao).unpublishExpiredCommodity(eq("commodity-1"), any(Date.class));
        verify(dataCommodityDao).unpublishExpiredCommodity(eq("commodity-2"), any(Date.class));
        verify(statusInfoServiceDao).save(any(CommodityStatusInfoEntity.class));
    }
}
