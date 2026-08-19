package com.zhzj.trading.controller.billing;

import com.zhzj.trading.common.Result;
import com.zhzj.trading.model.billing.BillingOrderSummaryResponse;
import com.zhzj.trading.model.billing.BillingRefreshResponse;
import com.zhzj.trading.model.billing.BillingSummaryResponse;
import com.zhzj.trading.model.billing.BillingUsageListResponse;
import com.zhzj.trading.model.billing.BillingUsageStatisticsResponse;
import com.zhzj.trading.model.resource.billing.BillingDateRangeQueryRequest;
import com.zhzj.trading.model.resource.billing.BillingOrderSummaryQueryRequest;
import com.zhzj.trading.model.resource.billing.BillingRefreshRequest;
import com.zhzj.trading.model.resource.billing.BillingUsageListQueryRequest;
import com.zhzj.trading.service.billing.BillingService;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping("/summary")
    @RequiresPermissions(TradingAuthorizationService.PERM_BILLING_VIEW)
    public Result<BillingSummaryResponse> summary(BillingDateRangeQueryRequest request) {
        return Result.ok(billingService.getSummary(request));
    }

    @GetMapping("/usage/statistics")
    @RequiresPermissions(TradingAuthorizationService.PERM_BILLING_VIEW)
    public Result<BillingUsageStatisticsResponse> usageStatistics(BillingDateRangeQueryRequest request) {
        return Result.ok(billingService.getUsageStatistics(request));
    }

    @GetMapping("/usage/list")
    @RequiresPermissions(TradingAuthorizationService.PERM_BILLING_VIEW)
    public Result<BillingUsageListResponse> usageList(BillingUsageListQueryRequest request) {
        return Result.ok(billingService.listUsage(request));
    }

    @GetMapping("/order-summary")
    @RequiresPermissions(TradingAuthorizationService.PERM_BILLING_VIEW)
    public Result<BillingOrderSummaryResponse> orderSummary(BillingOrderSummaryQueryRequest request) {
        return Result.ok(billingService.listOrderSummaries(request));
    }

    @PostMapping("/refresh")
    @RequiresPermissions(TradingAuthorizationService.PERM_BILLING_VIEW)
    public Result<BillingRefreshResponse> refresh(@RequestBody(required = false) BillingRefreshRequest request) {
        return Result.ok(billingService.refresh(request));
    }
}
