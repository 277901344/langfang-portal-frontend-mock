package com.zhzj.trading.controller.fund;

import com.zhzj.trading.common.Result;
import com.zhzj.trading.model.fund.FundAccountListResponse;
import com.zhzj.trading.model.fund.FundFlowListResponse;
import com.zhzj.trading.model.fund.FundSubjectListResponse;
import com.zhzj.trading.model.resource.fund.FundAccountQueryRequest;
import com.zhzj.trading.model.resource.fund.FundFlowQueryRequest;
import com.zhzj.trading.model.resource.fund.FundRechargeRequest;
import com.zhzj.trading.model.resource.fund.FundSubjectQueryRequest;
import com.zhzj.trading.service.fund.FundAccountService;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/fund")
public class FundController {

    private final FundAccountService fundAccountService;

    public FundController(FundAccountService fundAccountService) {
        this.fundAccountService = fundAccountService;
    }

    @GetMapping("/subjects")
    @RequiresPermissions(TradingAuthorizationService.PERM_FUND_ADMIN_VIEW)
    public Result<FundSubjectListResponse> listSubjects(FundSubjectQueryRequest request) {
        return Result.ok(fundAccountService.listSubjects(request));
    }

    @GetMapping("/admin/accounts")
    @RequiresPermissions(TradingAuthorizationService.PERM_FUND_ADMIN_VIEW)
    public Result<FundAccountListResponse> listAdminAccounts(FundAccountQueryRequest request) {
        return Result.ok(fundAccountService.listAdminAccounts(request));
    }

    @GetMapping("/admin/flows")
    @RequiresPermissions(TradingAuthorizationService.PERM_FUND_ADMIN_VIEW)
    public Result<FundFlowListResponse> listAdminFlows(FundFlowQueryRequest request) {
        return Result.ok(fundAccountService.listAdminFlows(request));
    }

    @PostMapping("/admin/recharge")
    @RequiresPermissions(TradingAuthorizationService.PERM_FUND_ADMIN_RECHARGE)
    public Result<String> recharge(@Valid @RequestBody FundRechargeRequest request) {
        return Result.ok("充值成功", fundAccountService.recharge(request));
    }

    @PostMapping("/admin/recharge/{flowId}/void")
    @RequiresPermissions(TradingAuthorizationService.PERM_FUND_ADMIN_RECHARGE_VOID)
    public Result<String> voidRecharge(@PathVariable("flowId") Long flowId) {
        fundAccountService.voidRecharge(flowId);
        return Result.ok("充值作废成功", String.valueOf(flowId));
    }

    @PostMapping("/admin/debit/{flowId}/void")
    @RequiresPermissions(TradingAuthorizationService.PERM_FUND_ADMIN_DEBIT_VOID)
    public Result<String> voidDebit(@PathVariable("flowId") Long flowId) {
        fundAccountService.voidDebit(flowId);
        return Result.ok("扣费作废成功", String.valueOf(flowId));
    }

    @GetMapping("/my/accounts")
    @RequiresPermissions(TradingAuthorizationService.PERM_FUND_VIEW)
    public Result<FundAccountListResponse> listMyAccounts() {
        return Result.ok(fundAccountService.listMyAccounts());
    }

    @GetMapping("/my/flows")
    @RequiresPermissions(TradingAuthorizationService.PERM_FUND_VIEW)
    public Result<FundFlowListResponse> listMyFlows(FundFlowQueryRequest request) {
        return Result.ok(fundAccountService.listMyFlows(request));
    }
}
