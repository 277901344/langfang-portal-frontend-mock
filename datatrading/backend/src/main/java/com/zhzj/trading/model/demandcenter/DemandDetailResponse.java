package com.zhzj.trading.model.demandcenter;

import lombok.Data;

import java.util.List;

/**
 * Demand detail response.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class DemandDetailResponse extends DemandListItem {

    private String matchedResponseId;

    private String orderId;

    private List<DemandResponseItem> responses;
}
