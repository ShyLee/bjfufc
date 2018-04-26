package com.archibus.basic.data.service;

import java.sql.SQLException;
import java.util.*;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapHandler;

import com.alibaba.fastjson.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.asc.data.DbUtils;

public class AjaxDataServiceImpl extends EventHandlerBase implements AjaxDataService {
    
    /**
     * fetchSumByTableFieldRestriction.
     * 
     * @param tableName
     * @param fieldName
     * @param restriction
     * @return 根据表名、字段名、条件 返回统计求和信息 如所有土地面积求和
     */
    public String sumForTable(String tableName, String fieldName, String restriction) {
        if ("".equals(restriction) || null == restriction) {
            restriction = "1=1";
        }
        
        double result =
                DataStatistics.getDouble(tableName, fieldName, DataServiceUtils.SUM, restriction);
        String tmp = DataServiceUtils.get2Double(result);
        JSONObject obj = new JSONObject();
        obj.put("sum:" + tableName + "." + fieldName, tmp);
        return obj.toJSONString();
    }
    
    /**
     * 
     * fetchCountByTableFieldRestriction.
     * 
     * @param tableName
     * @param fieldName
     * @param restriction
     * @return 根据表名、字段名、条件 返回统计个数 如统计地块数量
     */
    public String countForTable(String tableName, String fieldName, String restriction) {
        if ("".equals(restriction) || null == restriction) {
            restriction = "1=1";
        }
        
        Integer result =
                DataStatistics.getInt(tableName, fieldName, DataServiceUtils.COUNT, restriction);
        JSONObject obj = new JSONObject();
        obj.put(tableName + "." + fieldName, result);
        return obj.toJSONString();
    }
    
    @Override
    public String executeSQL(String sql) {
        List listObjects =
                EventHandlerBase.selectDbRecords(ContextStore.get().getEventHandlerContext(), sql);
        String result = JSON.toJSONString(listObjects);
        return result;
    }
    
    @Override
    public String getUserName() {
        com.archibus.datasource.DataSource userDS =
                DataSourceFactory.createDataSourceForFields("em", new String[] { "em_id", "name" });
        userDS.addRestriction(Restrictions
            .eq("em", "em_id", ContextStore.get().getUser().getName()));
        DataRecord record = userDS.getRecord();
        String userName = "";
        if (record != null) {
            userName = record.getString("em.name");
        }
        
        return userName;
    }
    
    @Override
    public String updateDataSchema(String tableName) {
        String sql =
                "select table_name,field_name,ml_heading from afm_flds where table_name='"
                        + tableName + "'";
        List listObjects =
                EventHandlerBase.selectDbRecords(ContextStore.get().getEventHandlerContext(), sql);
        Iterator it = listObjects.iterator();
        while (it.hasNext()) {
            Object[] row = (Object[]) it.next();
            System.err.println(row);
            String execsql =
                    "COMMENT ON COLUMN " + row[0].toString() + "." + row[1].toString() + " IS '"
                            + row[2].toString() + "'";
            SqlUtils.executeUpdate(row[0].toString(), execsql);
            SqlUtils.commit();
        }
        return "success";
    }
    
    public String fetchEmData() {
        
        return "success";
    }
    
    @Override
    public String compareDiffer(String record) {
        Object obj = JSON.parse(record);
        JSONObject o = JSON.parseObject(record);
        
        String emId = o.getString("sczfem_minus_em.em_id");
        String gzbm = o.getString("sczfem_minus_em.gzbm");
        String sfzh = o.getString("sczfem_minus_em.identi_code");
        String dvId = o.getString("sczfem_minus_em.dv_id");
        String zgzt = o.getString("sczfem_minus_em.zgzt");
        String zcId = o.getString("sczfem_minus_em.zc_id");
        String zwId = o.getString("sczfem_minus_em.zw_id");
        String name = o.getString("sczfem_minus_em.name");
        String email = o.getString("sczfem_minus_em.email");
        HashMap map = this.getEmById(emId);
        
        String zf = " 住房库 ：";
        String rs = " 人事库 : ";
        Iterator it = map.keySet().iterator();
        HashMap<String, String> newMap = new HashMap<String, String>();
        while (it.hasNext()) {
            String key = (String) it.next();
            if (map.get(key) == null) {
                newMap.put(key, "");
            } else {
                newMap.put(key, map.get(key).toString());
            }
            
        }
        ArrayList list = new ArrayList();
        if (!newMap.get("GZBM").equals(gzbm)) {
            JSONObject json = new JSONObject();
            json.put("value", "工资编码不同:" + zf + gzbm + rs + map.get("gzbm"));
            list.add(json);
        }
        if (!newMap.get("IDENTI_CODE").equals(sfzh)) {
            JSONObject json = new JSONObject();
            json.put("value", "身份证号不同:" + zf + sfzh + rs + map.get("identi_code"));
            list.add(json);
        }
        if (!newMap.get("DV_ID").equals(dvId)) {
            JSONObject json = new JSONObject();
            json.put("value", "单位编码不同:" + zf + dvId + rs + map.get("dv_id"));
            list.add(json);
        }
        if (!newMap.get("ZAIGANGZHUANGTAI_ID").equals(zgzt)) {
            JSONObject json = new JSONObject();
            json.put("value", "在岗状态不同:" + zf + zgzt + rs + map.get("zaigangzhuangtai_id"));
            list.add(json);
        }
        if (!newMap.get("ZC_ID").equals(zcId)) {
            JSONObject json = new JSONObject();
            json.put("value", "职称编码不同:" + zf + zcId + rs + map.get("zc_id"));
            list.add(json);
        }
        if (!newMap.get("ZW_ID").equals(zwId)) {
            JSONObject json = new JSONObject();
            json.put("value", "职务编码不同:" + zf + zwId + rs + map.get("zw_id"));
            list.add(json);
        }
        
        if (!newMap.get("NAME").equals(name)) {
            JSONObject json = new JSONObject();
            json.put("value", "姓名不同:" + zf + email + rs + map.get("name"));
            list.add(json);
        }
        if (!newMap.get("EMAIL").equals(email)) {
            JSONObject json = new JSONObject();
            json.put("value", "邮箱不同:" + zf + email + rs + map.get("email"));
            list.add(json);
            
        }
        
        return JSON.toJSONString(list);
    }
    
    public HashMap getEmById(String id) {
        javax.sql.DataSource ds = DbUtils.getDataSource();
        QueryRunner query = new QueryRunner(ds);
        
        Map map = null;
        try {
            map =
                    query
                        .query(
                            "select em_id,gzbm,identi_code,dv_id,zaigangzhuangtai_id,zc_id,zw_id,name,email from em  where em_id = '"
                                    + id + "'", new MapHandler());
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return (HashMap) map;
    }
}
