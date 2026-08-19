package com.zhzj.trading.dao.fund;

import com.zhzj.trading.model.fund.UserIdentityProfile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserIdentityProfileMapper {

    UserIdentityProfile selectByUserId(@Param("userId") Long userId);
}
