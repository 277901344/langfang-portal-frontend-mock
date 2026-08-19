package com.zhzj.trading.model.resource.demandcenter;

import lombok.Data;

/**
 * Demand response reject request.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class DemandResponseRejectRequest {

    private String rejectReason;
}
