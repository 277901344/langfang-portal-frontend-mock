package com.zhzj.trading.model.demandcenter;

import lombok.Data;

import java.util.List;

/**
 * Demand list response.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class DemandListResponse {

    private List<DemandListItem> data;

    private Integer dataCount;

    private Integer pageCount;
}
