package com.archibus.service.school.house;

import java.util.List;

import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;


/***
 * 林大关于周转房的优惠政策
 * 
 * 校内员工
 * 五年内的住户每年租金自动上调上一年租金的10%，五年后每年租金上调上一年租金的50%。
 * 
 * */
public class ZZFEmFlBjfu {
    //获取当前职工的已入住月份
    public int getYRZMonth(String identity){
        final String sql = "select archive_id,zzf_months from sc_zf_em where sfzh = '" + identity + "'"; 
        final String[] flds =
                new String[] { "archive_id", "zzf_months"};
        final List<DataRecord> records =
                SqlUtils.executeQuery("sc_zf_em", flds, sql);
        final DataRecord record = records.get(0);
        
        return Double.valueOf(record.getValue("sc_zf_em.zzf_months").toString()).intValue();
    }
    //更新当前职工的已入住月份
    public void updateYRZMonth(String identity,int Num){
       final String sql = "update sc_zf_em set zzf_months = " + Num + " where  sfzh = '" + identity + "'";
        SqlUtils.executeUpdate("sc_zf_em", sql.toString());
    }
    
    //获取当前职工的已入住月份
    public int getYRZMonth2(String identity){
        final String sql = "select archive_id,zzf_months2 from sc_zf_em where sfzh = '" + identity + "'"; 
        final String[] flds =
                new String[] { "archive_id", "zzf_months2"};
        final List<DataRecord> records =
                SqlUtils.executeQuery("sc_zf_em", flds, sql);
        final DataRecord record = records.get(0);
        return Double.valueOf(record.getValue("sc_zf_em.zzf_months2").toString()).intValue();
    }
    //更新当前职工的已入住月份
    public void updateYRZMonth2(String identity,int Num){
       final String sql = "update sc_zf_em set zzf_months2 = " + Num + " where  sfzh = '" + identity + "'";
        SqlUtils.executeUpdate("sc_zf_em", sql.toString());
    }
}
