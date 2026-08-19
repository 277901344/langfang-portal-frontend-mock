package com.zhzj.trading.model.commodity;

import lombok.Data;

/**
 * Commodity provider information shown for admin review.
 *
 * @author Connector Team
 * @since 2026-05-26
 */
@Data
public class CommodityProviderInfo {

    private Long userId;

    private Integer authType;

    private String subjectType;

    private String subjectName;

    private String connectorName;

    private String displayName;

    private String phone;

    private String unifiedSocialCreditCode;

    private String operatorCertType;

    private String operatorCertNumber;
}
