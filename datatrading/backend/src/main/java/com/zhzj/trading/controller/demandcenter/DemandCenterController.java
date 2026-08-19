package com.zhzj.trading.controller.demandcenter;

import com.zhzj.trading.common.Result;
import com.zhzj.trading.model.demandcenter.DemandDetailResponse;
import com.zhzj.trading.model.demandcenter.DemandListResponse;
import com.zhzj.trading.model.demandcenter.DemandResponseItem;
import com.zhzj.trading.model.resource.demandcenter.DemandAcceptResult;
import com.zhzj.trading.model.resource.demandcenter.DemandListQueryRequest;
import com.zhzj.trading.model.resource.demandcenter.DemandRespondRequest;
import com.zhzj.trading.model.resource.demandcenter.DemandResponseRejectRequest;
import com.zhzj.trading.model.resource.demandcenter.DemandSaveRequest;
import com.zhzj.trading.service.demandcenter.DemandCenterService;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * Demand center controller.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@RestController
@RequestMapping("/demand-center")
public class DemandCenterController {

    private final DemandCenterService demandCenterService;

    public DemandCenterController(DemandCenterService demandCenterService) {
        this.demandCenterService = demandCenterService;
    }

    @PostMapping("/demands")
    @RequiresPermissions(TradingAuthorizationService.PERM_DEMAND_CREATE)
    public Result<DemandDetailResponse> createDemand(@Valid @RequestBody DemandSaveRequest request) {
        return Result.ok(demandCenterService.createDemand(request));
    }

    @PutMapping("/demands/{demandId}")
    @RequiresPermissions(TradingAuthorizationService.PERM_DEMAND_UPDATE)
    public Result<DemandDetailResponse> updateDemand(@PathVariable("demandId") String demandId,
                                                     @Valid @RequestBody DemandSaveRequest request) {
        return Result.ok(demandCenterService.updateDemand(demandId, request));
    }

    @PostMapping("/demands/{demandId}/publish")
    @RequiresPermissions(TradingAuthorizationService.PERM_DEMAND_CREATE)
    public Result<String> publishDemand(@PathVariable("demandId") String demandId) {
        demandCenterService.publishDemand(demandId);
        return Result.ok("需求发布成功", demandId);
    }

    @PostMapping("/demands/{demandId}/close")
    @RequiresPermissions(TradingAuthorizationService.PERM_DEMAND_CLOSE)
    public Result<String> closeDemand(@PathVariable("demandId") String demandId) {
        demandCenterService.closeDemand(demandId);
        return Result.ok("需求关闭成功", demandId);
    }

    @GetMapping("/demands")
    public Result<DemandListResponse> listDemands(DemandListQueryRequest request) {
        return Result.ok(demandCenterService.listDemands(request));
    }

    @GetMapping("/demands/{demandId}")
    public Result<DemandDetailResponse> demandDetail(@PathVariable("demandId") String demandId) {
        return Result.ok(demandCenterService.getDemandDetail(demandId));
    }

    @PostMapping("/demands/{demandId}/responses")
    @RequiresPermissions(TradingAuthorizationService.PERM_DEMAND_RESPOND)
    public Result<DemandResponseItem> respondDemand(@PathVariable("demandId") String demandId,
                                                    @Valid @RequestBody DemandRespondRequest request) {
        return Result.ok(demandCenterService.respondDemand(demandId, request));
    }

    @PostMapping("/responses/{responseId}/accept")
    @RequiresPermissions(TradingAuthorizationService.PERM_DEMAND_RESPONSE_REVIEW)
    public Result<DemandAcceptResult> acceptResponse(@PathVariable("responseId") String responseId) {
        return Result.ok(demandCenterService.acceptResponse(responseId));
    }

    @PostMapping("/responses/{responseId}/reject")
    @RequiresPermissions(TradingAuthorizationService.PERM_DEMAND_RESPONSE_REVIEW)
    public Result<String> rejectResponse(@PathVariable("responseId") String responseId,
                                         @RequestBody(required = false) DemandResponseRejectRequest request) {
        demandCenterService.rejectResponse(responseId, request);
        return Result.ok("响应拒绝成功", responseId);
    }
}
