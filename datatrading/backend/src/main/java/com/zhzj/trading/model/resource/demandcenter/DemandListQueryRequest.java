package com.zhzj.trading.model.resource.demandcenter;

import lombok.Data;

/**
 * Demand list query request.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class DemandListQueryRequest {

    private String scope;

    private String demandType;

    private String status;

    private String keyword;

    private String topicCategory;

    private String topicCategoryLabel;

    private Integer pageNum;

    private Integer pageSize;
}
