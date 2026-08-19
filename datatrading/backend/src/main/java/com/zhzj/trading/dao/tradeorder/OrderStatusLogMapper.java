package com.zhzj.trading.dao.tradeorder;

import com.zhzj.trading.model.tradeorder.OrderStatusLogEntity;
import com.zhzj.trading.model.tradeorder.OrderStatusLogItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Order status log mapper.
 *
 * @author Connector Team
 * @since 2026-05-24
 */
@Mapper
public interface OrderStatusLogMapper {

    int insert(OrderStatusLogEntity entity);

    List<OrderStatusLogItem> selectByOrderId(@Param("orderId") String orderId);
}
