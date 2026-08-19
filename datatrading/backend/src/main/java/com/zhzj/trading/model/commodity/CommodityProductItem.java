package com.zhzj.trading.model.commodity;

import lombok.Data;

import java.util.Date;
import java.util.Map;

/**
 * Data product item selectable by commodity management.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Data
public class CommodityProductItem {

    private String id;

    private String productId;

    private String versionId;

    private String productName;

    private String productType;

    private String description;

    private String publishStatus;

    private String localStatus;

    private String deliveryType;

    private String topicCategory;

    private String topicCategoryLabel;

    private String organizationCategory;

    private String organizationCategoryLabel;

    private String applicationCategory;

    private String applicationCategoryLabel;

    private String industryCategory;

    private String industryCategoryLabel;

    private String dataAcquisition;

    private String dataAcquisitionLabel;

    private String updateFrequency;

    private String updateFrequencyLabel;

    private String dataQualityLevel;

    private String dataQualityLevelLabel;

    private String dataSecurityLevel;

    private String dataSecurityLevelLabel;

    private String serviceType;

    private Map<String, Object> pricingModel;

    private Map<String, Object> commercialTerms;

    private Map<String, Object> accessConstraints;

    private Map<String, Object> processConfig;

    private Map<String, Object> sampleData;

    private String connectorId;

    private String connectorName;

    private String userIdentityCode;

    private Integer isAuth;

    private Date publishedAt;

    private Date updatedAt;
}
