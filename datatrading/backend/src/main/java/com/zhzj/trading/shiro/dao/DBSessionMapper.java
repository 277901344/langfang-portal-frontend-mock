package com.zhzj.trading.shiro.dao;





import com.zhzj.trading.shiro.entity.SessionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.shiro.session.Session;

import java.util.List;
import java.util.Set;

/**
 * @Author:Connector Team
 * @Description:
 * @Date: Create in 15:14 2021-05-08
 * @Modified by:
 */
@Mapper
public interface DBSessionMapper {


    /**
     * 创建日期:2017/12/21<br/>
     * 创建时间:8:44:54<br/>
     * 功能概要:插入session
     *
     * @param session
     */
    public int insert(@Param("id") String id, @Param("session") String session);

    /**
     * 创建日期:2017/12/21<br/>
     * 创建时间:8:48:06<br/>
     * 功能概要:删除session
     *
     * @param session
     * @return
     */
    public int delete(String sessionid);

    /**
     * 创建日期:2017/12/21<br/>
     * 创建时间:8:48:23<br/>
     * 功能概要:删除session
     *
     * @param session
     * @return
     */
    public int update(@Param("id") String id, @Param("session") String session, @Param("username") String username);

    /**
     * 创建日期:2017/12/21<br/>
     * 创建时间:8:49:13<br/>
     * 功能概要:通过sessionid来获取session数据
     *
     * @param sessionid
     * @return
     */
    public SessionEntity load(String sessionid);

    /**
     * 创建日期:2017/12/21<br/>
     * 创建时间:11:52:02<br/>
     * 功能概要:根据用户名获取session
     *
     * @param username
     * @return
     */
    public List<Session> loadByUserName(@Param("username") String username);


    /**
     * 获取 用户所有角色
     * @param userId
     * @return
     */
    public Set<String> loadUserRole(@Param("userId") String userId);
}
