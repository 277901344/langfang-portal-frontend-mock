package com.zhzj.trading.controller.tradeorder;

import com.zhzj.trading.common.Result;
import com.zhzj.trading.model.contract.UserContractItem;
import com.zhzj.trading.model.resource.tradeorder.TradeOrderBindContractRequest;
import com.zhzj.trading.model.resource.tradeorder.TradeOrderListQueryRequest;
import com.zhzj.trading.model.tradeorder.TradeOrderDetailResponse;
import com.zhzj.trading.model.tradeorder.TradeOrderListResponse;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import com.zhzj.trading.service.tradeorder.TradeOrderService;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Trade order controller.
 *
 * @author Connector Team
 * @since 2026-05-24
 */
@RestController
@RequestMapping("/trade-order")
public class TradeOrderController {

    private final TradeOrderService tradeOrderService;

    public TradeOrderController(TradeOrderService tradeOrderService) {
        this.tradeOrderService = tradeOrderService;
    }

    @GetMapping("/orders")
    @RequiresPermissions(TradingAuthorizationService.PERM_ORDER_VIEW)
    public Result<TradeOrderListResponse> listOrders(TradeOrderListQueryRequest request) {
        return Result.ok(tradeOrderService.listOrders(request));
    }

    @GetMapping("/orders/{orderId}")
    @RequiresPermissions(TradingAuthorizationService.PERM_ORDER_VIEW)
    public Result<TradeOrderDetailResponse> getOrderDetail(@PathVariable("orderId") String orderId) {
        return Result.ok(tradeOrderService.getOrderDetail(orderId));
    }

    @GetMapping("/orders/{orderId}/contracts")
    @RequiresPermissions(TradingAuthorizationService.PERM_ORDER_VIEW)
    public Result<List<UserContractItem>> listBindableContracts(@PathVariable("orderId") String orderId) {
        return Result.ok(tradeOrderService.listBindableContracts(orderId));
    }

    @PostMapping("/orders/{orderId}/bind-contract")
    @RequiresPermissions(TradingAuthorizationService.PERM_ORDER_UPDATE)
    public Result<String> bindContract(@PathVariable("orderId") String orderId,
                                       @Valid @RequestBody TradeOrderBindContractRequest request) {
        tradeOrderService.bindContract(orderId, request.getContractId());
        return Result.ok("订单关联合约成功", orderId);
    }

    @PostMapping("/orders/{orderId}/confirm")
    @RequiresPermissions(TradingAuthorizationService.PERM_ORDER_CONFIRM)
    public Result<String> confirmOrder(@PathVariable("orderId") String orderId) {
        tradeOrderService.confirmOrder(orderId);
        return Result.ok("订单确认成功", orderId);
    }

    @PostMapping("/orders/{orderId}/cancel")
    @RequiresPermissions(TradingAuthorizationService.PERM_ORDER_CANCEL)
    public Result<String> cancelOrder(@PathVariable("orderId") String orderId) {
        tradeOrderService.cancelOrder(orderId);
        return Result.ok("订单取消成功", orderId);
    }

    @PostMapping("/orders/{orderId}/complete")
    @RequiresPermissions(TradingAuthorizationService.PERM_ORDER_COMPLETE)
    public Result<String> completeOrder(@PathVariable("orderId") String orderId) {
        tradeOrderService.completeOrder(orderId);
        return Result.ok("订单完成成功", orderId);
    }
}
