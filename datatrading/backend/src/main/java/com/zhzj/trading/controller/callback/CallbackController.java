package com.zhzj.trading.controller.callback;

import com.zhzj.trading.common.Result;
import com.zhzj.trading.model.callback.TransferCallbackResponse;
import com.zhzj.trading.model.resource.callback.TransferCallbackRequest;
import com.zhzj.trading.service.callback.TransferCallbackService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/callback")
public class CallbackController {

    private final TransferCallbackService transferCallbackService;

    public CallbackController(TransferCallbackService transferCallbackService) {
        this.transferCallbackService = transferCallbackService;
    }

    @PostMapping("/transfer")
    public Result<TransferCallbackResponse> transfer(@Valid @RequestBody TransferCallbackRequest request) {
        TransferCallbackResponse response = transferCallbackService.recordTransfer(request);
        String message = Boolean.TRUE.equals(response.getDuplicate()) ? "重复回调已忽略" : "传输回调处理成功";
        return Result.ok(message, response);
    }
}
