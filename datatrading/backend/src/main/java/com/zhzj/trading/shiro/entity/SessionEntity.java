package com.zhzj.trading.shiro.entity;

/**
 * @Author:Connector Team
 * @Description:
 * @Date: Create in 15:17 2021-05-08
 * @Modified by:
 */
public class SessionEntity {
    private String id;
    private String session;
    private String username;


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSession() {
        return session;
    }

    public void setSession(String session) {
        this.session = session;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
