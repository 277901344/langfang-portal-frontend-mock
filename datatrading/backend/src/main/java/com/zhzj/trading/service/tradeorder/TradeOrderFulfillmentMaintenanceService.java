package com.zhzj.trading.service.tradeorder;

import com.zhzj.trading.dao.tradeorder.TradeOrderMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;

@Slf4j
@Service
public class TradeOrderFulfillmentMaintenanceService {

    private final TradeOrderMapper tradeOrderMapper;

    @Value("${trading.fulfillment.periodic-expire-close-enabled:true}")
    private boolean periodicExpireCloseEnabled;

    public TradeOrderFulfillmentMaintenanceService(TradeOrderMapper tradeOrderMapper) {
        this.tradeOrderMapper = tradeOrderMapper;
    }

    @Scheduled(fixedDelayString = "${trading.fulfillment.periodic-expire-close-delay-ms:3600000}")
    public void closeExpiredPeriodicFulfillmentOrders() {
        if (!periodicExpireCloseEnabled) {
            return;
        }
        try {
            int count = tradeOrderMapper.closeExpiredPeriodicFulfillmentOrders(new Date());
            if (count > 0) {
                log.info("关闭过期周期履约准入订单完成，count={}", count);
            } else {
                log.debug("关闭过期周期履约准入订单完成，count=0");
            }
        } catch (Exception e) {
            log.error("关闭过期周期履约准入订单异常", e);
        }
    }
}
