package com.zhzj.trading.service.tradeorder;

import com.zhzj.trading.dao.tradeorder.TradeOrderMapper;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TradeOrderFulfillmentMaintenanceServiceTest {

    @Test
    void closeExpiredPeriodicFulfillmentOrdersSkipsWhenDisabled() {
        TradeOrderMapper mapper = mock(TradeOrderMapper.class);
        TradeOrderFulfillmentMaintenanceService service = new TradeOrderFulfillmentMaintenanceService(mapper);
        ReflectionTestUtils.setField(service, "periodicExpireCloseEnabled", false);

        service.closeExpiredPeriodicFulfillmentOrders();

        verify(mapper, never()).closeExpiredPeriodicFulfillmentOrders(any());
    }

    @Test
    void closeExpiredPeriodicFulfillmentOrdersUpdatesWhenEnabled() {
        TradeOrderMapper mapper = mock(TradeOrderMapper.class);
        when(mapper.closeExpiredPeriodicFulfillmentOrders(any(Date.class))).thenReturn(2);
        TradeOrderFulfillmentMaintenanceService service = new TradeOrderFulfillmentMaintenanceService(mapper);
        ReflectionTestUtils.setField(service, "periodicExpireCloseEnabled", true);

        service.closeExpiredPeriodicFulfillmentOrders();

        verify(mapper).closeExpiredPeriodicFulfillmentOrders(any(Date.class));
    }

    @Test
    void closeExpiredPeriodicFulfillmentOrdersCatchesMapperException() {
        TradeOrderMapper mapper = mock(TradeOrderMapper.class);
        when(mapper.closeExpiredPeriodicFulfillmentOrders(any(Date.class)))
                .thenThrow(new IllegalStateException("database unavailable"));
        TradeOrderFulfillmentMaintenanceService service = new TradeOrderFulfillmentMaintenanceService(mapper);
        ReflectionTestUtils.setField(service, "periodicExpireCloseEnabled", true);

        service.closeExpiredPeriodicFulfillmentOrders();

        verify(mapper).closeExpiredPeriodicFulfillmentOrders(any(Date.class));
    }
}
