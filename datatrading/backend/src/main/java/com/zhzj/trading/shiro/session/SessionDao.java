package com.zhzj.trading.shiro.session;



import com.zhzj.trading.shiro.dao.DBSessionMapper;
import com.zhzj.trading.shiro.entity.SessionEntity;
import com.zhzj.trading.util.SerializableUtils;
import org.apache.shiro.session.Session;
import org.apache.shiro.session.UnknownSessionException;
import org.apache.shiro.session.mgt.ValidatingSession;
import org.apache.shiro.session.mgt.eis.AbstractSessionDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.io.Serializable;
import java.util.Collection;

/**
 * @Author:Connector Team
 * @Description:
 * @Date: Create in 18:03 2021-05-07
 * @Modified by:
 */

public class SessionDao extends AbstractSessionDAO {

    @Autowired
    private DBSessionMapper dbSessionMapper;

    @Override
    protected Serializable doCreate(Session session) {
        //生成session的id
        Serializable sessionId = generateSessionId(session);
        //给session设定id
        assignSessionId(session, sessionId);

        //插入session 到数据库
        dbSessionMapper.insert(session.getId().toString(), SerializableUtils.serializ(session));

        return session.getId();
    }

    @Override
    protected Session doReadSession(Serializable sessionId) {
        //获取session的字符串
        HttpServletRequest request = getRequest();
        if (request != null) {
            Session sessionObj = (Session) request.getAttribute(sessionId.toString());
            if (sessionObj != null) {
                return sessionObj;
            }
        }
        SessionEntity dbsession = dbSessionMapper.load(sessionId.toString());
        if (dbsession == null) {
            return null;
        }
        //加载session数据
        String sessionStr = dbsession.getSession();
        Session session = SerializableUtils.deserializ(sessionStr);
        if (session != null && request != null) {
            request.setAttribute(sessionId.toString(), session);
        }

        return session;
    }

    @Override
    public void update(Session session) throws UnknownSessionException {
        //当是ValidatingSession 无效的情况下，直接退出
        if (session instanceof ValidatingSession &&
                !((ValidatingSession) session).isValid()) {
            return;
        }

        //检索到用户名
        String username = String.valueOf(session.getAttribute("uname"));

        //序列化session
        dbSessionMapper.update(session.getId().toString(), SerializableUtils.serializ(session), username);

//        try {
//            String token = JWTUtil.getRequestHeader("Authorization");
//            Claims claims = JWTUtil.parseRequestJWT();
//            JWTUtil.createResponseJWT(claims.getId(), claims.getSubject(), 60 * 60);//todo 1小时
//        } catch (Exception e) {
//            LoggerUtil.error("更新session时，创建JWT失败");
//            e.printStackTrace();
//        }

    }

    @Override
    public void delete(Session session) {
        //删除session
        dbSessionMapper.delete(session.getId().toString());
        HttpServletRequest request = getRequest();
        if (request != null) { // 一定要进行空值判断，因为SessionValidationScheduler的线程也会调用这个方法，而在那个线程中是不存在Request对象的
            request.removeAttribute(session.getId().toString());
        }
    }


    @Override
    public Collection<Session> getActiveSessions() {
        return null;
    }


    private HttpServletRequest getRequest() {
        ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return requestAttributes != null ? requestAttributes.getRequest() : null;
    }

}
