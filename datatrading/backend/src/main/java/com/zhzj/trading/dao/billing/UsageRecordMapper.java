package com.zhzj.trading.dao.billing;

import com.zhzj.trading.model.billing.BillingOrderSummaryItem;
import com.zhzj.trading.model.billing.BillingSummaryResponse;
import com.zhzj.trading.model.billing.BillingUsageItem;
import com.zhzj.trading.model.billing.BillingUsageStatisticPoint;
import com.zhzj.trading.model.billing.UsageRecordEntity;
import com.zhzj.trading.model.resource.billing.BillingDateRangeQueryRequest;
import com.zhzj.trading.model.resource.billing.BillingOrderSummaryQueryRequest;
import com.zhzj.trading.model.resource.billing.BillingUsageListQueryRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UsageRecordMapper {

    int insert(UsageRecordEntity entity);

    UsageRecordEntity selectByOrderIdAndTransferId(@Param("orderId") String orderId,
                                                   @Param("transferId") String transferId);

    BillingSummaryResponse selectSummary(@Param("query") BillingDateRangeQueryRequest query,
                                         @Param("userId") Long userId,
                                         @Param("isAdmin") boolean isAdmin);

    List<BillingUsageStatisticPoint> selectStatistics(@Param("query") BillingDateRangeQueryRequest query,
                                                      @Param("userId") Long userId,
                                                      @Param("isAdmin") boolean isAdmin);

    int countUsageList(@Param("query") BillingUsageListQueryRequest query,
                       @Param("userId") Long userId,
                       @Param("isAdmin") boolean isAdmin);

    List<BillingUsageItem> selectUsageList(@Param("query") BillingUsageListQueryRequest query,
                                           @Param("userId") Long userId,
                                           @Param("isAdmin") boolean isAdmin,
                                           @Param("offset") int offset,
                                           @Param("limit") int limit);

    List<BillingOrderSummaryItem> selectOrderSummaries(@Param("query") BillingOrderSummaryQueryRequest query,
                                                       @Param("userId") Long userId,
                                                       @Param("isAdmin") boolean isAdmin);
}
