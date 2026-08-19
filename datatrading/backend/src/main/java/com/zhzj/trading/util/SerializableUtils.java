package com.zhzj.trading.util;

import org.apache.shiro.session.Session;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Base64;

/**
 * @Author:Connector Team
 * @Description:
 * @Date: Create in 10:45 2021-05-08
 * @Modified by:
 */
public class SerializableUtils {
    /**
     * 创建日期:2017/12/21<br/>
     * 创建时间:9:25:30<br/>
     * 功能概要:将Session序列化成String类型
     * @param session
     * @return
     */
    public static String serializ(Session session) {
        try {
            //ByteArrayOutputStream 用于存储序列化的Session对象
            ByteArrayOutputStream bos = new ByteArrayOutputStream();

            //将Object对象输出成byte数据
            ObjectOutputStream out = new ObjectOutputStream(bos);
            out.writeObject(session);

            //将字节码，编码成String类型数据
            return Base64.getEncoder().encodeToString(bos.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("序列化失败");
        }
    }


    /**
     * 创建日期:2017/12/21<br/>
     * 创建时间:9:26:19<br/>
     * 功能概要:将一个session的字符串序列化成字符串反序列化
     * @param sessionStr
     * @return
     */
    public static Session deserializ(String sessionStr) {
        try {
            //读取字节码表
            ByteArrayInputStream bis  = new ByteArrayInputStream(Base64.getDecoder().decode(sessionStr));

            //将字节码反序列化成 对象
            ObjectInputStream in = new ObjectInputStream(bis);
            Session session = (Session) in.readObject();
            return session;
        } catch (Exception e) {
            throw new RuntimeException("反序列化失败");
        }
    }

}
