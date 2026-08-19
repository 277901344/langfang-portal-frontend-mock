package com.zhzj.trading.dao.tradeorder;

import com.zhzj.trading.model.resource.tradeorder.TradeOrderListQueryRequest;
import com.zhzj.trading.model.tradeorder.TradeOrderDetailResponse;
import com.zhzj.trading.model.tradeorder.TradeOrderEntity;
import com.zhzj.trading.model.tradeorder.TradeOrderListItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * Trade order mapper.
 *
 * @author Connector Team
 * @since 2026-05-24
 */
@Mapper
public interface TradeOrderMapper {

    int insert(TradeOrderEntity entity);

    int countByOrderNoPrefix(@Param("prefix") String prefix);

    TradeOrderEntity selectById(@Param("id") String id);

    TradeOrderEntity selectByResponseId(@Param("responseId") String responseId);

    int countList(@Param("query") TradeOrderListQueryRequest query,
                  @Param("userId") Long userId,
                  @Param("isAdmin") boolean isAdmin);

    List<TradeOrderListItem> selectList(@Param("query") TradeOrderListQueryRequest query,
                                        @Param("userId") Long userId,
                                        @Param("isAdmin") boolean isAdmin,
                                        @Param("offset") int offset,
                                        @Param("limit") int limit);

    TradeOrderDetailResponse selectDetailById(@Param("id") String id);

    int updateStatusSnapshot(@Param("id") String id,
                             @Param("fromStatus") String fromStatus,
                             @Param("toStatus") String toStatus,
                             @Param("updatedAt") Date updatedAt,
                             @Param("confirmedAt") Date confirmedAt,
                             @Param("completedAt") Date completedAt,
                             @Param("fulfillmentExpireAt") Date fulfillmentExpireAt,
                             @Param("actualAmount") BigDecimal actualAmount);

    int updateCompletionSnapshot(@Param("id") String id,
                                 @Param("fromStatus") String fromStatus,
                                 @Param("toStatus") String toStatus,
                                 @Param("updatedAt") Date updatedAt,
                                 @Param("completedAt") Date completedAt,
                                 @Param("actualAmount") BigDecimal actualAmount,
                                 @Param("paymentStatus") String paymentStatus,
                                 @Param("paidAmount") BigDecimal paidAmount,
                                 @Param("paidAt") Date paidAt,
                                 @Param("debitFlowId") Long debitFlowId,
                                 @Param("incomeFlowId") Long incomeFlowId);

    int updatePaymentSnapshot(@Param("id") String id,
                              @Param("paymentStatus") String paymentStatus,
                              @Param("paidAmount") BigDecimal paidAmount,
                              @Param("paidAt") Date paidAt,
                              @Param("debitFlowId") Long debitFlowId,
                              @Param("incomeFlowId") Long incomeFlowId,
                              @Param("updatedAt") Date updatedAt);

    int updateMeteringSnapshot(@Param("id") String id,
                               @Param("actualAmount") BigDecimal actualAmount,
                               @Param("updatedAt") Date updatedAt);

    int updateContractBindingSnapshot(@Param("id") String id,
                                      @Param("contractId") String contractId,
                                      @Param("updatedAt") Date updatedAt);

    int bindContractSnapshot(@Param("id") String id,
                             @Param("contractId") String contractId,
                             @Param("updatedAt") Date updatedAt);

    int closeExpiredPeriodicFulfillmentOrders(@Param("updatedAt") Date updatedAt);

    int updateIdentitySnapshot(@Param("id") String id,
                               @Param("buyerUserIdentityCode") String buyerUserIdentityCode,
                               @Param("buyerSubjectName") String buyerSubjectName,
                               @Param("sellerUserIdentityCode") String sellerUserIdentityCode,
                               @Param("sellerSubjectName") String sellerSubjectName,
                               @Param("updatedAt") Date updatedAt);
}
