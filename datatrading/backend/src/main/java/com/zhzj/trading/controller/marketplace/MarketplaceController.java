package com.zhzj.trading.controller.marketplace;

import com.zhzj.trading.common.Result;
import com.zhzj.trading.model.commodity.CommodityDetailResponse;
import com.zhzj.trading.model.commodity.CommodityListResponse;
import com.zhzj.trading.model.commodity.CommodityProviderInfo;
import com.zhzj.trading.model.commodity.CommodityRequest;
import com.zhzj.trading.model.marketplace.MarketplaceCategoriesResponse;
import com.zhzj.trading.model.marketplace.MarketplacePurchaseRequest;
import com.zhzj.trading.model.tradeorder.TradeOrderDetailResponse;
import com.zhzj.trading.service.FileService;
import com.zhzj.trading.service.commodity.CommodityManagementService;
import com.zhzj.trading.service.marketplace.MarketplaceService;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import com.zhzj.trading.service.tradeorder.TradeOrderService;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;

/**
 * 数据市场控制器。
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@RestController
@RequestMapping("/marketplace")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;
    private final CommodityManagementService commodityManagementService;
    private final TradeOrderService tradeOrderService;
    private final FileService fileService;

    public MarketplaceController(MarketplaceService marketplaceService,
                                 CommodityManagementService commodityManagementService,
                                 TradeOrderService tradeOrderService,
                                 FileService fileService) {
        this.marketplaceService = marketplaceService;
        this.commodityManagementService = commodityManagementService;
        this.tradeOrderService = tradeOrderService;
        this.fileService = fileService;
    }

    @PostMapping("/commodities")
    public Result<CommodityListResponse> listCommodities(@RequestBody(required = false) CommodityRequest request) {
        return Result.ok(commodityManagementService.listMarketCommodities(request));
    }

    @PostMapping("/commodities/detail")
    public Result<CommodityDetailResponse> commodityDetail(@RequestBody CommodityRequest request) {
        if (request == null || StringUtils.isBlank(request.getCommodityId())) {
            throw new IllegalArgumentException("商品ID不能为空");
        }
        return Result.ok(commodityManagementService.getPublicMarketCommodityDetail(request.getCommodityId()));
    }

    @GetMapping("/commodities/{commodityId}/cover")
    public void commodityCover(@PathVariable("commodityId") String commodityId,
                               HttpServletResponse response) {
        fileService.downloadFile(
                commodityManagementService.getPublicMarketCommodityCover(commodityId),
                response
        );
    }

    @PostMapping("/commodities/provider-info")
    @RequiresPermissions(TradingAuthorizationService.PERM_ORDER_CREATE)
    public Result<CommodityProviderInfo> commodityProviderInfo(@RequestBody CommodityRequest request) {
        if (request == null || StringUtils.isBlank(request.getCommodityId())) {
            throw new IllegalArgumentException("商品ID不能为空");
        }
        return Result.ok(commodityManagementService.getMarketCommodityProviderInfo(request.getCommodityId()));
    }

    @PostMapping("/commodities/purchase")
    @RequiresPermissions(TradingAuthorizationService.PERM_ORDER_CREATE)
    public Result<TradeOrderDetailResponse> purchase(@RequestBody MarketplacePurchaseRequest request) {
        if (request == null || StringUtils.isBlank(request.getCommodityId())) {
            throw new IllegalArgumentException("商品ID不能为空");
        }
        return Result.ok(tradeOrderService.createOrderFromCommodityPurchase(
                request.getCommodityId(),
                request.getQuantity()
        ));
    }

    @GetMapping("/categories")
    public Result<MarketplaceCategoriesResponse> categories() {
        return Result.ok(marketplaceService.getCategories());
    }
}
