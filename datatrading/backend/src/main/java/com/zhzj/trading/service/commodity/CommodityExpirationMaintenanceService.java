package com.zhzj.trading.service.commodity;

import com.zhzj.trading.dao.commodity.CommodityStatusInfoServiceDao;
import com.zhzj.trading.dao.commodity.DataCommodityDao;
import com.zhzj.trading.enums.CommodityStatusEnum;
import com.zhzj.trading.model.commodity.CommodityStatusInfoEntity;
import com.zhzj.trading.util.UuidUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class CommodityExpirationMaintenanceService {

    private final DataCommodityDao dataCommodityDao;
    private final CommodityStatusInfoServiceDao commodityStatusInfoServiceDao;
    private final TransactionTemplate transactionTemplate;

    @Value("${trading.commodity.expire-close-enabled:true}")
    private boolean commodityExpireCloseEnabled;

    public CommodityExpirationMaintenanceService(DataCommodityDao dataCommodityDao,
                                                 CommodityStatusInfoServiceDao commodityStatusInfoServiceDao,
                                                 TransactionTemplate transactionTemplate) {
        this.dataCommodityDao = dataCommodityDao;
        this.commodityStatusInfoServiceDao = commodityStatusInfoServiceDao;
        this.transactionTemplate = transactionTemplate;
    }

    @Scheduled(fixedDelayString = "${trading.commodity.expire-close-delay-ms:3600000}")
    public void unpublishExpiredCommodities() {
        if (!commodityExpireCloseEnabled) {
            return;
        }
        Date now = new Date();
        try {
            List<String> commodityIds = dataCommodityDao.selectExpiredPublishedCommodityIds(now);
            int count = 0;
            for (String commodityId : commodityIds) {
                count += unpublishExpiredCommodity(commodityId, now);
            }
            if (count > 0) {
                log.info("自动下架过期商品完成，count={}", count);
            } else {
                log.debug("自动下架过期商品完成，count=0");
            }
        } catch (Exception e) {
            log.error("自动下架过期商品异常", e);
        }
    }

    int unpublishExpiredCommodity(String commodityId, Date now) {
        try {
            Integer updated = transactionTemplate.execute(status -> {
                int count = dataCommodityDao.unpublishExpiredCommodity(commodityId, now);
                if (count > 0) {
                    boolean saved = commodityStatusInfoServiceDao.save(buildExpiredStatusLog(commodityId, now));
                    if (!saved) {
                        throw new IllegalStateException("保存商品自动下架生命周期失败");
                    }
                }
                return count;
            });
            return updated == null ? 0 : updated;
        } catch (Exception e) {
            log.error("自动下架过期商品失败，commodityId={}", commodityId, e);
            return 0;
        }
    }

    private CommodityStatusInfoEntity buildExpiredStatusLog(String commodityId, Date now) {
        CommodityStatusInfoEntity log = new CommodityStatusInfoEntity();
        log.setId(UuidUtil.get32UUID());
        log.setCommodityId(commodityId);
        log.setStatus(CommodityStatusEnum.UNPUBLISHED.getCode());
        log.setCreateTime(now);
        log.setErrors("商品有效期已过期，自动下架");
        log.setOperationUser(null);
        return log;
    }
}
