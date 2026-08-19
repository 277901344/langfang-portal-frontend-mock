package com.zhzj.trading.service.demandcenter;

import com.zhzj.trading.dao.demandcenter.DemandMapper;
import com.zhzj.trading.dao.demandcenter.DemandResponseMapper;
import com.zhzj.trading.enums.DemandResponseStatusEnum;
import com.zhzj.trading.enums.DemandStatusEnum;
import com.zhzj.trading.model.demandcenter.DemandDetailResponse;
import com.zhzj.trading.model.demandcenter.DemandEntity;
import com.zhzj.trading.model.demandcenter.DemandResponseEntity;
import com.zhzj.trading.service.client.MarketplaceCatalogClient;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import com.zhzj.trading.service.tradeorder.TradeOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DemandCenterServiceAnonymousAccessTest {

    private DemandMapper demandMapper;
    private DemandResponseMapper demandResponseMapper;
    private DemandCenterService service;

    @BeforeEach
    void setUp() {
        demandMapper = mock(DemandMapper.class);
        demandResponseMapper = mock(DemandResponseMapper.class);
        TradingAuthorizationService authorizationService = mock(TradingAuthorizationService.class);
        when(authorizationService.getCurrentUserOrNull()).thenReturn(null);
        service = new DemandCenterService(
                demandMapper,
                demandResponseMapper,
                authorizationService,
                mock(TradeOrderService.class),
                mock(MarketplaceCatalogClient.class)
        );
    }

    @Test
    void anonymousCanReadPublicDemandWithoutResponseDetails() {
        DemandEntity demand = demand("demand-1", DemandStatusEnum.PUBLISHED.name());
        DemandResponseEntity response = new DemandResponseEntity();
        response.setId("response-1");
        response.setDemandId(demand.getId());
        response.setStatus(DemandResponseStatusEnum.PENDING.name());
        when(demandMapper.selectById(demand.getId())).thenReturn(demand);
        when(demandResponseMapper.selectByDemandId(demand.getId()))
                .thenReturn(Collections.singletonList(response));

        DemandDetailResponse result = service.getDemandDetail(demand.getId());

        assertTrue(result.getResponses().isEmpty());
        assertTrue(result.getCanRespond());
        assertFalse(result.getOwnDemand());
        assertFalse(result.getCanEdit());
        assertFalse(result.getCanClose());
        assertFalse(result.getCanReviewResponses());
    }

    @Test
    void anonymousCannotReadDraftDemand() {
        DemandEntity demand = demand("demand-2", DemandStatusEnum.DRAFT.name());
        when(demandMapper.selectById(demand.getId())).thenReturn(demand);

        assertThrows(IllegalArgumentException.class, () -> service.getDemandDetail(demand.getId()));
    }

    private DemandEntity demand(String id, String status) {
        DemandEntity demand = new DemandEntity();
        demand.setId(id);
        demand.setPublisherId(100L);
        demand.setStatus(status);
        demand.setResponseCount(1);
        return demand;
    }
}
