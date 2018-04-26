package com.archibus.service.school.dinge;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class OverPrice extends EventHandlerBase {
    // 计算超额费率
    public void calculate() {
        Calendar cal = Calendar.getInstance();
        String month = (cal.get(Calendar.MONTH) + 1) + "";
        String year = cal.get(Calendar.YEAR) + "";
        executeInsertData();
        calculateOverPrice(year, month);
    }
    
    // 每月向历史表插入数据
    public static void executeInsertData() {
        deleteRecords();
        insertArea_log();
    }
    
    // 插入数据当月房间数据
    /*
     * insert into sc_dv_area_log(dv_name,dv_id,area,year,month,area_dinge,area_over)select
     * d.dv_name,b.dv_id,b.area,2014,7, dinge.area_dinge,(b.area-dinge.area_dinge) as area_over from
     * (select sum (area) as area ,dv_id from rmwhere dv_id in(select dv_id from dv where bu_id
     * in(select bu_id from bu where bu_class='XY'))group by dv_id) b,dv d,sc_ts_dv_dinge dinge
     * where b.dv_id=d.dv_id and d.dv_id=dinge.dv_id and dinge.year_dinge='2014';
     */
    // 注意超额面积会有负数的情况
    /*
     * update sc_dv_area_log set area_over='0' where area_over<0; 把超额面积是负数的数据都变成0；
     */
    public static void insertArea_log() {
        final Calendar cal = Calendar.getInstance();
        final String month = (cal.get(Calendar.MONTH) + 1) + "";
        final String year = cal.get(Calendar.YEAR) + "";
        final String InSql =
                "insert into sc_dv_area_log(dv_name,dv_id,area,year,month,area_dinge,area_over) select d.dv_name,b.dv_id,b.area,"
                        + year
                        + ","
                        + month
                        + ", dinge.area_dinge ,(b.area-dinge.area_dinge) as area_over from "
                        + "(select sum(area) as area ,dv_id from rm where dv_id in(select dv_id from dv where bu_id in "
                        + "(select bu_id from bu where bu_class='XY' or bu_class='DZGL')) group by dv_id) b,dv d,sc_ts_dv_dinge dinge where b.dv_id=d.dv_id and d.dv_id=dinge.dv_id and dinge.year_dinge='"
                        + year + "'";
        SqlUtils.executeUpdate("sc_dv_area_log", InSql);
        SqlUtils.commit();
        final String UpSql = "update sc_dv_area_log set area_over='" + 0 + "' where area_over<0";
        SqlUtils.executeUpdate("sc_dv_area_log", UpSql);
        SqlUtils.commit();
    }
    
    // 判断表中是否有要插入的数据，有则删除
    public static void deleteRecords() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Calendar cal = Calendar.getInstance();
        final String month = (cal.get(Calendar.MONTH) + 1) + "";
        final String year = cal.get(Calendar.YEAR) + "";
        final String SeSql =
                "select * from sc_dv_area_log where month='" + month + "' and year='" + year + "'";
        
        /*
         * final String afmFieldsTable = "sc_dv_area_log"; final String[] afmFieldsNames = {
         * "month,year" };
         * 
         * final List<DataRecord> records = SqlUtils.executeQuery(afmFieldsTable, afmFieldsNames,
         * SeSql);
         */
        final List records = retrieveDbRecords(context, SeSql);
        if (records.size() != 0) {
            final String deSql =
                    "delete from sc_dv_area_log where month='" + month + "' and year='" + year
                            + "'";
            SqlUtils.executeUpdate("sc_dv_area_log", deSql);
            SqlUtils.commit();
        } else {
            System.out.println("表中没有" + year + "年" + month + "月数据");
        }
        SqlUtils.commit();
    }
    
    // 计算超额费用
    // 1.查询当年当月的表中数据--获取dv_id和超额面积
    // 2.判断超额面积是否>0,“是”则要进一步判断所用建筑物费率是否为0，“否”则不超额跳出当前循环进行下一次循环
    // 3.在超额有费率的情况下计算rate
    // 4.计算超额费用
    public static void calculateOverPrice(final String year, final String month) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String SeSql =
                "select * from sc_dv_area_log where month='" + month + "' and year='" + year
                        + "' and dv_id in(select dv_id from dv where bu_id in "
                        + "(select bu_id from bu where bu_class='XY'))";
        final List records = retrieveDbRecords(context, SeSql);
        if (!records.isEmpty()) {
            final int length = records.size();
            for (int i = 0; i < length; i++) {
                final Map recordMap = (Map) records.get(i);
                final String dv_id = recordMap.get("dv_id").toString();
                final String area_over = recordMap.get("area_over").toString();
                final float areaOver = Float.parseFloat(area_over.trim());
                System.out.println("正在执行第" + i + "条数据");
                if (areaOver > 0) {
                    final float rate = prateYN(dv_id);
                    if (rate != 0) {
                        // update sc_dv_area_log set rate='1.5' where dv_id='011200' and year='2014'
                        // and month='8';
                        final String UpSql =
                                "update sc_dv_area_log set rate='" + rate + "' where dv_id='"
                                        + dv_id + "' and month='" + month + "' and year='" + year
                                        + "'";
                        SqlUtils.executeUpdate("sc_dv_area_log", UpSql);
                        SqlUtils.commit();
                        // update sc_dv_area_log set price=rate*area_over where dv_id='010800';
                        final float rate2 = Float.parseFloat(String.format("%.2f", rate).trim());// 保留两位小数
                        System.out.println(rate2);
                        final String UpSql2 =
                                "update sc_dv_area_log set price='" + areaOver * rate2
                                        + "' where dv_id='" + dv_id + "' and month='" + month
                                        + "' and year='" + year + "'";
                        SqlUtils.executeUpdate("sc_dv_area_log", UpSql2);
                        SqlUtils.commit();
                    }
                } else {
                    continue;
                }
            }
        }
    }
    
    // 判断建筑物是否有费率
    /*--按单位查询每个楼的使用面积和费率(材料科学与工程学院为例)
        select sum(area),r.dv_id,d.dv_id ,d.dv_name ,r.bl_id,b.prate as bl_prate,
        sum(area)*b.prate/(select sum(area) from rm r,dv d where r.dv_id = d.dv_id and d.dv_id='010100') as ss
        from rm r,dv d ,bl b
        where r.dv_id = d.dv_id and r.bl_id = b.bl_id and d.dv_id='010100'
        group by r.dv_id, d.dv_id, d.dv_name, r.bl_id, b.prate
     */
    // 计算费率
    public static float prateYN(final String dv_id) {
        float rate = 0;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String SeSql =
                "select sum(area),r.dv_id,d.dv_id,d.dv_name,r.bl_id,b.prate as bl_prate,"
                        + "sum(area)*b.prate/(select sum(area) from rm r,dv d where r.dv_id = d.dv_id and d.dv_id='"
                        + dv_id + "') as ss" + " from rm r,dv d ,bl b"
                        + " where r.dv_id = d.dv_id and r.bl_id = b.bl_id and d.dv_id='" + dv_id
                        + "' group by r.dv_id, d.dv_id, d.dv_name, r.bl_id, b.prate";
        final List records = retrieveDbRecords(context, SeSql);
        if (!records.isEmpty()) {
            final int length = records.size();
            for (int i = 0; i < length; i++) {
                final Map recordMap = (Map) records.get(i);
                final String bl_prate = recordMap.get("bl_prate").toString();
                final String bl_id = recordMap.get("bl_id").toString();
                final float blPrate = Float.parseFloat(bl_prate.trim());
                if (blPrate == 0) {
                    System.out.println("建筑物id为" + bl_id + "的费率为0");
                    rate = 0;
                    break;
                } else {
                    final String ss = recordMap.get("ss").toString();
                    final float s = Float.parseFloat(ss.trim());
                    rate = rate + s;
                }
            }
        }
        return rate;
    }
}
