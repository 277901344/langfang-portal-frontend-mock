package com.zhzj.trading.model.resource.demandcenter;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

/**
 * Request payload for creating or updating a demand.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class DemandSaveRequest {

    @NotBlank(message = "需求标题不能为空")
    @Size(max = 256, message = "需求标题长度不能超过 256 个字符")
    private String title;

    @Size(max = 500, message = "需求描述长度不能超过 500 个字符")
    private String description;

    @Size(max = 64, message = "主题分类长度不能超过 64 个字符")
    private String topicCategory;

    @Size(max = 64, message = "应用场景长度不能超过 64 个字符")
    private String applicationCategory;

    @Size(max = 64, message = "产品类型长度不能超过 64 个字符")
    private String productType;

    @Size(max = 64, message = "更新频次长度不能超过 64 个字符")
    private String updateFrequency;

    private List<String> expectedFields;

    @Size(max = 200, message = "使用目的长度不能超过 200 个字符")
    private String usagePurpose;

    @Size(max = 20, message = "预算类型长度不能超过 20 个字符")
    private String budgetType;

    private BigDecimal budgetAmount;

    @Size(max = 20, message = "期望交付方式长度不能超过 20 个字符")
    private String expectedDelivery;

    @Size(max = 32, message = "截止日期格式长度不正确")
    private String deadline;
}
