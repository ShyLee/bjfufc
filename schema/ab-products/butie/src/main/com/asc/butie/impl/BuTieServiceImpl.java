package com.asc.butie.impl;

import java.sql.SQLException;
import java.util.*;

import javax.sql.DataSource;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.*;

import com.alibaba.fastjson.JSONObject;
import com.asc.butie.BuTieService;
import com.asc.butie.domain.*;
import com.asc.data.DbUtils;

public class BuTieServiceImpl implements BuTieService {
    private DataSource ds;
    private  HashMap<String, ZWVO> zw;
    private  HashMap<String, ZCVO> zc;
    
    //根据现职务或职称所享受金额的最大金额按月发放
    /**
     *@return
     *  json{
     *          em_id, //员工号
     *          amount, //补贴最大金额
     *          area//补贴面积最大额
     *      } 
     * */
    public String getBuTieByZj(String em_id) {
        //获取所有职务职称的补贴面积或补贴金额标准
        ds = DbUtils.getDataSource();
        this.zw=(HashMap<String, ZWVO>) getZw();
        this.zc=(HashMap<String, ZCVO>) getZC();
        
        
        QueryRunner qr=new QueryRunner(ds);
        String sql="select em_id,zw_id,zc_id from sc_zf_em where em_id ='"+em_id+"'";
        try {
            Map<String, Object> map= qr.query(sql, new MapHandler());
            String emId=(String)map.get("EM_ID");
            String zwId=(String) map.get("ZW_ID");
            String zcId=(String) map.get("ZC_ID");
            double amount=0;
            JSONObject json=new JSONObject();
            json.put("em_id", emId);
            
            //实际业务环境中，月补贴金额与月补贴面积应该是成正比变化的
            if(!"".equals(zwId) && null !=zwId && !"".equals(zcId) && null !=zcId){
                ZWVO w= this.zw.get(zwId);
                ZCVO c= this.zc.get(zcId);
                if(w.getAmount_wf_std()> c.getAmount_wf_std()){
                    amount=w.getAmount_wf_std();
                    json.put("amount", amount);
                    
                    json.put("area", w.getArea_zf_std());
                }else{
                    amount=c.getAmount_wf_std();
                    json.put("amount", amount);
                    
                    json.put("area", c.getArea_zf_std());
                }
                
            }else if(!"".equals(zwId) && null !=zwId){
                ZWVO w= this.zw.get(zwId);
                amount=w.getAmount_wf_std();
                json.put("amount", amount);
                
                json.put("area", w.getArea_zf_std());
            }else if(!"".equals(zcId) && null !=zcId){
                ZCVO c= this.zc.get(zcId);
                amount=c.getAmount_wf_std();
                json.put("amount", amount);
                
                json.put("area", c.getArea_zf_std());
            }else{
                json.put("amount", 0);
                json.put("area", 0);
            }
            
            
            
            return json.toString();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    
    
    public Map<String, ZWVO> getZw(){
        QueryRunner qr=new QueryRunner(ds);
        String sql="select a.zw_id ,a.zw_jb_id,b.amount_wf_std,b.area_zf_std from sc_zw a, sc_zw_jb b where a.zw_jb_id = b.zw_jb_id"; 
        try {
            HashMap<String, ZWVO> map=(HashMap<String, ZWVO>) qr.query(sql, new BeanMapHandler<String,ZWVO>(ZWVO.class,"zw_id"));
            
            return map;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
            
        }
        
    }
    
    public  Map<String, ZCVO> getZC(){
        QueryRunner qr=new QueryRunner(ds);
        String sql="select a.zc_id ,a.zc_jb_id,b.amount_wf_std,b.area_zf_std from sc_zc a, sc_zc_jb b  where a.zc_jb_id = b.zc_jb_id";
        try {
            HashMap<String, ZCVO> map=(HashMap<String, ZCVO>)qr.query(sql, new BeanMapHandler<String,ZCVO>(ZCVO.class,"zc_id"));
            
            return map;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
            
        }
    }
        
}
