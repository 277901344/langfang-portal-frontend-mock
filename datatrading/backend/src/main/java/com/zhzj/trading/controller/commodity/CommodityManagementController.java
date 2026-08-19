package com.zhzj.trading.controller.commodity;

import com.zhzj.trading.common.Result;
import com.zhzj.trading.model.commodity.CommodityDetailResponse;
import com.zhzj.trading.model.commodity.CommodityListResponse;
import com.zhzj.trading.model.commodity.CommodityProductItem;
import com.zhzj.trading.model.commodity.CommodityProductListResponse;
import com.zhzj.trading.model.commodity.CommodityRequest;
import com.zhzj.trading.service.commodity.CommodityManagementService;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * Commodity management controller.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@RestController
@RequestMapping("/commodity-management")
public class CommodityManagementController {

    @Autowired
    private CommodityManagementService commodityManagementService;

    @PostMapping("/list")
    // @RequiresPermissions(TradingAuthorizationService.PERM_COMMODITY_MANAGEMENT_VIEW)
    public Result<CommodityListResponse> list(@RequestBody(required = false) CommodityRequest request) {
        return Result.ok(commodityManagementService.listCommodities(request));
    }

    @PostMapping("/detail")
    // @RequiresPermissions(TradingAuthorizationService.PERM_COMMODITY_MANAGEMENT_VIEW)
    public Result<CommodityDetailResponse> detail(@Valid @RequestBody CommodityRequest request) {
        return Result.ok(commodityManagementService.getCommodityDetail(request.getCommodityId()));
    }

    @PostMapping("/save")
    // @RequiresPermissions(TradingAuthorizationService.PERM_COMMODITY_MANAGEMENT_SAVE)
    public Result<CommodityDetailResponse> save(@Valid @RequestBody CommodityRequest request) {
        return Result.ok(commodityManagementService.saveCommodity(request));
    }

    @PostMapping("/publish")
    // @RequiresPermissions(TradingAuthorizationService.PERM_COMMODITY_MANAGEMENT_PUBLISH)
    public Result<CommodityDetailResponse> publish(@Valid @RequestBody CommodityRequest request) {
        return Result.ok("操作成功", commodityManagementService.publishCommodity(request.getCommodityId()));
    }

    @PostMapping("/unpublish")
    // @RequiresPermissions(TradingAuthorizationService.PERM_COMMODITY_MANAGEMENT_PUBLISH)
    public Result<CommodityDetailResponse> unpublish(@Valid @RequestBody CommodityRequest request) {
        return Result.ok("商品下架成功", commodityManagementService.unpublishCommodity(request.getCommodityId()));
    }

    @PostMapping("/reject")
    // @RequiresPermissions(TradingAuthorizationService.PERM_COMMODITY_MANAGEMENT_PUBLISH)
    public Result<CommodityDetailResponse> reject(@Valid @RequestBody CommodityRequest request) {
        return Result.ok("商品已驳回", commodityManagementService.rejectCommodity(request.getCommodityId(), request.getErrors()));
    }

    @PostMapping("/delete")
    // @RequiresPermissions(TradingAuthorizationService.PERM_COMMODITY_MANAGEMENT_DELETE)
    public Result<String> delete(@Valid @RequestBody CommodityRequest request) {
        commodityManagementService.deleteCommodity(request.getCommodityId());
        return Result.ok("商品删除成功", request.getCommodityId());
    }

    @PostMapping("/products")
    // @RequiresPermissions(TradingAuthorizationService.PERM_COMMODITY_MANAGEMENT_VIEW)
    public Result<CommodityProductListResponse> ownProducts(@RequestBody(required = false) CommodityRequest request) {
        return Result.ok(commodityManagementService.listOwnProducts(request));
    }

    @PostMapping("/products/detail")
    // @RequiresPermissions(TradingAuthorizationService.PERM_COMMODITY_MANAGEMENT_VIEW)
    public Result<CommodityProductItem> ownProductDetail(@RequestBody CommodityRequest request) {
        return Result.ok(commodityManagementService.getOwnProductDetail(request));
    }
}
