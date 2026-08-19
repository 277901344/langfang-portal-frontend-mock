package com.zhzj.trading.model.demandcenter;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * Demand list item.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class DemandListItem {

    private String id;

    private String demandNo;

    private String title;

    private String description;

    private String topicCategory;

    private String applicationCategory;

    private String productType;

    private String updateFrequency;

    private List<String> expectedFields;

    private String usagePurpose;

    private String budgetType;

    private BigDecimal budgetAmount;

    private String expectedDelivery;

    private Date deadline;

    private String status;

    private Long publisherId;

    private String publisherName;

    private Integer responseCount;

    private Date createdAt;

    private Date updatedAt;

    private Date publishedAt;

    private Boolean ownDemand;

    private Boolean canEdit;

    private Boolean canClose;

    private Boolean canRespond;

    private Boolean canReviewResponses;
}
