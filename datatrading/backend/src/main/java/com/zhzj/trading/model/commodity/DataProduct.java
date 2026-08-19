package com.zhzj.trading.model.commodity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 数据产品实体类。
 *
 * @author Connector Team
 * @since 2026-01-20
 */
@Data
@TableName("sp.data_product")
public class DataProduct implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.INPUT)
    private String id;

    private String productId;

    private String productName;

    private String productType;

    private String description;

    private String localStatus;

    private String publishStatus;

    private String resourceId;

    @TableField(value = "sample_data")
    private String sampleData;

    private String deliveryType;

    private String topicCategory;

    private String organizationCategory;

    private String applicationCategory;

    private String industryCategory;

    private String dataAcquisition;

    private String updateFrequency;

    private String dataQualityLevel;

    private String dataSecurityLevel;

    private String serviceType;

    @TableField(value = "pricing_model")
    private String pricingModel;

    @TableField(value = "commercial_terms")
    private String commercialTerms;

    @TableField(value = "access_constraints")
    private String accessConstraints;

    @TableField(value = "contract_config")
    private String contractConfig;

    @TableField(value = "process_config")
    private String processConfig;

    @TableField(value = "user_id")
    private Long userId;

    @TableField(value = "user_identity_code")
    private String userIdentityCode;

    @TableField(value = "connector_id")
    private String connectorId;

    @TableField(value = "connector_name")
    private String connectorName;

    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(value = "updated_at")
    private Date updatedAt;

    @TableField(value = "published_at")
    private Date publishedAt;

    @TableField(value = "version")
    private Long version;

    @TableField(value = "version_id")
    private String versionId;

    private Integer deleted;

    private Integer isAuth;
}
