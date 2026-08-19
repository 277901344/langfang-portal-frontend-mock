package com.zhzj.trading.model.demandcenter;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * Demand entity.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class DemandEntity {

    private String id;

    private String demandNo;

    private String title;

    private String description;

    private String topicCategory;

    private String applicationCategory;

    private String productType;

    private String updateFrequency;

    private String expectedFieldsJson;

    private String usagePurpose;

    private String budgetType;

    private BigDecimal budgetAmount;

    private String expectedDelivery;

    private Date deadline;

    private String status;

    private Long publisherId;

    private String publisherName;

    private String matchedResponseId;

    private String orderId;

    private Integer responseCount;

    private Integer viewCount;

    private Date createdAt;

    private Date updatedAt;

    private Date publishedAt;

    private Date closedAt;

    private Integer deleted;
}
