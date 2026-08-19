package com.zhzj.trading.model.tradeorder;

import com.zhzj.trading.model.commodity.CommodityProviderInfo;
import lombok.Data;

import java.util.List;

/**
 * Trade order detail response.
 *
 * @author Connector Team
 * @since 2026-05-24
 */
@Data
public class TradeOrderDetailResponse extends TradeOrderListItem {

    private String remark;

    private String proposal;

    private Boolean canConfirm;

    private Boolean canCancel;

    private Boolean canComplete;

    private Long debitFlowId;

    private Long incomeFlowId;

    private CommodityProviderInfo providerInfo;

    private CommodityProviderInfo demanderInfo;

    private String productId;

    private String versionId;

    private String productName;

    private String contractName;

    private List<OrderStatusLogItem> statusLogs;
}
