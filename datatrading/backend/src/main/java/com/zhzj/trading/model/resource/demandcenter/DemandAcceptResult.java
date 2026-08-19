package com.zhzj.trading.model.resource.demandcenter;

import lombok.Data;

/**
 * Demand accept result.
 *
 * @author Connector Team
 * @since 2026-05-24
 */
@Data
public class DemandAcceptResult {

    private String demandId;

    private String responseId;

    private String orderId;

    private String orderNo;
}
