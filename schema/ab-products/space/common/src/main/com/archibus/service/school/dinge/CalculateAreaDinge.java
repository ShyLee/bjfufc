package com.archibus.service.school.dinge;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class CalculateAreaDinge extends EventHandlerBase {
    
    final String year;
    
    public CalculateAreaDinge(final String year) {
        this.year = year;
    }
    
    // AA（m2）＝BA（m2） +JA（m2）+SA（m2）+ DA（m2）
    
    // 此模块需要更新的数据有ba、bja、bla、ja、jea
    
    public void updateAreaDingeAA() {
        
        final String sql =
                "update sc_ts_dv_dinge  set area_dinge = (area_ba+area_da+area_ja+area_sa) where year_dinge ='"
                        + this.year
                        + "' and dv_id in (select dv_id from dv where bu_id in (select bu_id from bu where bu_class='XY'))";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
        return;
    }
    
    // 更新学生定额面积jea
    public void updateAreaDingeJea() {
        // 更新的是所有的，没有区分学院党政
        final String sql =
                "update sc_ts_dv_dinge  set area_jea=(select c.total from "
                        + "(select b.a*b.kvalue as total,b.dv_id from"
                        + "( select area_jea,area_stu_bk+area_stu_ss+area_stu_bs as a,kvalue,sc_ts_dv_dinge.dv_id from sc_ts_dv_dinge,dv "
                        + " where dv.dv_id =sc_ts_dv_dinge.dv_id and sc_ts_dv_dinge.year_dinge='"
                        + this.year + "')b)c where sc_ts_dv_dinge.dv_id = c.dv_id)";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
        return;
    }
    
    // 更新实验实践、毕设及管理服务辅助Ja
    public void updateAreaDingeJa() {
        final String sql =
                "update sc_ts_dv_dinge  set area_ja=(area_jea+area_jba) where year_dinge ='"
                        + this.year + "'";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
        return;
    }
    
    // 更新学院机动用房面积bla
    public void updateAreaDingeBla() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "select count(*) as count_em, sum(area_dinge) as sum_area,dv_id from  em "
                        + "where dv_id in (select dv_id from dv where bu_id in"
                        + "(select bu_id from bu where bu_class='XY')) " + "group by dv_id";
        final List records = retrieveDbRecords(context, sql);
        double areaBlaNum = 0;
        double area_bla = 0;
        String dv_id = "";
        if (!records.isEmpty()) {
            for (int i = 0; i < records.size(); i++) {
                final Map record = (Map) records.get(i);
                areaBlaNum = Double.parseDouble(record.get("count_em").toString());
                dv_id = record.get("dv_id").toString();
                if (areaBlaNum < 50) {
                    area_bla = 80;
                } else if (areaBlaNum >= 50 && areaBlaNum < 100) {
                    area_bla = 130;
                } else if (areaBlaNum > 100) {
                    area_bla = 150;
                }
                this.updateAreaDingeBla2(dv_id, area_bla);
            }
        }
        return;
    }
    
    public void updateAreaDingeBla2(final String dv_id, final double area_bla) {
        final String sql =
                "update sc_ts_dv_dinge  set area_bla=  '" + area_bla + "' where dv_id = '" + dv_id
                        + "' and year_dinge='" + this.year + "' ";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
        return;
    }
    
    // 更新学院教师用房bja
    public void updateAreaDingeBja() {
        
        final String sql =
                "update sc_ts_dv_dinge set area_bja =(select b.total from "
                        + " (select sum(area_dinge) as total, dv_id from  em "
                        + "where dv_id in (select dv_id from dv where bu_id in "
                        + "(select bu_id from bu where bu_class='XY')) group by dv_id )b "
                        + " where sc_ts_dv_dinge.dv_id = b.dv_id) where year_dinge= '" + this.year
                        + "'" + "and dv_id =(select b.dv_id from "
                        + "(select sum(area_dinge) as total, dv_id from  em "
                        + " where dv_id in (select dv_id from dv where bu_id in "
                        + " (select bu_id from bu where bu_class='XY')) group by dv_id )b "
                        + " where sc_ts_dv_dinge.dv_id = b.dv_id)";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
        return;
    }
    
    // 更新学院办公用房
    public void updateAreaDingeBa() {
        final String sql =
                "update sc_ts_dv_dinge set area_ba = area_bja+area_bla where year_dinge = '"
                        + this.year + "'";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
        return;
    }
    
    /**
     * 下面是党政机关的定额面积计算
     */
    
    public void updateAreaDingeDzBa() {
        
        final String sql =
                "update sc_ts_dv_dinge set area_dz_ba =(select b.total from "
                        + " (select sum(area_dinge) as total, dv_id from  em "
                        + "where dv_id in (select dv_id from dv where bu_id in "
                        + "(select bu_id from bu where bu_class='DZGL')) group by dv_id )b "
                        + " where sc_ts_dv_dinge.dv_id = b.dv_id) where year_dinge= '" + this.year
                        + "'" + "and dv_id =(select b.dv_id from "
                        + "(select sum(area_dinge) as total, dv_id from  em "
                        + " where dv_id in (select dv_id from dv where bu_id in "
                        + " (select bu_id from bu where bu_class='DZGL')) group by dv_id )b "
                        + " where sc_ts_dv_dinge.dv_id = b.dv_id)";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
        return;
    }
    
    public void updateAreaDingeDz() {
        
        final String sql =
                "update sc_ts_dv_dinge  set area_dinge = (area_dz_ba+area_dz_za) where year_dinge ='"
                        + this.year
                        + "' and dv_id in (select dv_id from dv where bu_id in (select bu_id from bu where bu_class='DZGL'))";
        
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
        return;
    }
    
    public String verifyDataForEm() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                " select count(*) as dv_count,em.dv_id,dv.dv_name as dv_name from em,dv where em.dv_id=dv.dv_id and area_dinge is null group by em.dv_id,dv.dv_name";
        final List records = retrieveDbRecords(context, sql);
        String message = "";
        if (!records.isEmpty()) {
            final int length = records.size();
            if (length <= 5) {
                for (int i = 0; i < length; i++) {
                    final Map recordMap = (Map) records.get(i);
                    final String dvName = recordMap.get("dv_name").toString();
                    final String dvCount = recordMap.get("dv_count").toString();
                    if (message == "") {
                        message = dvName + "有" + dvCount + "个教职工没有定额面积，请定义职务职称";
                    } else {
                        message = message + "、" + dvName + "有" + dvCount + "个教职工没有定额面积，请定义职务职称";
                    }
                }
            } else {
                message = length + "个单位的某些教职工没有定额面积，请定义职务职称";
            }
        }
        return message;
    }
    
    /**
     * 更新sc_ts_dv_dinge 表中的实验室补贴数据 从sc_lib中获取
     */
    public void updateAreaDingeSa() {
        final String sql =
                "update sc_ts_dv_dinge set area_sa = "
                        + "(select area_bt from sc_lib where dv_id= sc_ts_dv_dinge.dv_id) "
                        + "where sc_ts_dv_dinge.dv_id in(select dv_id from  sc_lib) and year_dinge ='"
                        + this.year + "' ";
        
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
        return;
        
    }
}
