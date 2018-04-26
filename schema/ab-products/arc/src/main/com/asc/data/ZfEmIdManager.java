package com.asc.data;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * 住房档案的生成工具类
 * 
 * @author JiaGuoqiang 2015-09-24
 * @since 20.1
 * 
 */
public class ZfEmIdManager extends EventHandlerBase {
    /**
     * 根据职工生日生成住房档案 规则： 生日年份+"-"+3位自增序列号，每年都重新从001计算自增序列号
     * 
     * @param birthday 职工的生日
     * @return 生成的住房档案号
     */
    public String getZfEmId(final String emId) {
        String zfEmId = "";// 生成的住房档案号
        // 获取生日的前四位年份
        
        final String birthYear = emId.substring(0, 4);
        // 根据年份获取数据库中的最大序列
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String selectSql =
                "select max(archive_id) as maxarchiveid from sc_zf_em where archive_id like '"
                        + birthYear + "%'";
        final List records = retrieveDbRecords(context, selectSql);
        if ((!records.isEmpty()) || (records.size() != 0)) {
            for (int i = 0; i < records.size(); i++) {
                final Map record = (Map) records.get(i);
                if (record.get("maxarchiveid") == null) {
                    zfEmId = birthYear + "-001";
                } else {
                    final String maxId = record.get("maxarchiveid").toString();
                    // 对获取的最大档案编号进行转换
                    final String[] maxIdArray = maxId.split("-");
                    int maxIdIndex = 0;
                    if (maxIdArray.length > 1) {
                        final String maxIdIndexValue = maxIdArray[1];
                        maxIdIndex = Integer.parseInt(maxIdIndexValue);
                        final String nextIndexValue = String.valueOf(maxIdIndex + 1);
                        if (nextIndexValue.length() == 1) {
                            zfEmId = birthYear + "-" + "00" + nextIndexValue;
                        } else if (nextIndexValue.length() == 2) {
                            zfEmId = birthYear + "-" + "0" + nextIndexValue;
                        } else if (nextIndexValue.length() == 3) {
                            zfEmId = birthYear + "-" + nextIndexValue;
                        }
                    }
                }
                
            }
        } else {
            zfEmId = birthYear + "-001";
        }
        return zfEmId;
    }
    
    /**
     * 根据员工表Em批量生成住房档案数据 1.只更新不在sc_zf_em表中的数据 2.只更新生日不为空的员工的数据
     * 
     */
    public void generateZfArchiveFromEm() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "select em_id from em where em_id is not null and em_id not in (select em_id from sc_zf_em)";
        final List records = retrieveDbRecords(context, sql);
        if ((!records.isEmpty()) || (records.size() != 0)) {
            for (int i = 0; i < records.size(); i++) {
                final Map record = (Map) records.get(i);
                // 获取员工编号
                final String emId = record.get("em_id").toString();
                if (emId.equals("AFM") || emId.equals("SYSADMIN")) {
                    continue;
                }
                final String archiveIdValue = getZfEmId(emId);
                
                // 根据员工编号在住房档案表中插入数据
                final String insertSql =
                        "INSERT into sc_zf_em (archive_id,em_id,xm, gzbm,sfzh, dv_id,zw_jb_id,zw_jb_name,zw_id,zw_name,zc_jb_id,zc_jb_name, zc_id,zc_name, mphone,telephone,em_type, email,date_come_sch) "
                                + "SELECT '"
                                + archiveIdValue
                                + "',em_id,name, gzbm,identi_code,dv_id,zw_jb_id,(select zw_jb_name from sc_zw_jb where sc_zw_jb.zw_jb_id=em.zw_jb_id),zw_id,(select zw_name from sc_zw where sc_zw.zw_id=em.zw_id),zc_jb_id,(select zc_jb_name from sc_zc_jb where sc_zc_jb.zc_jb_id=em.zc_jb_id),zc_id,(select zc_name from sc_zc where sc_zc.zc_id=em.zc_id),phone,phone_home,zaigangzhuangtai_id,email,date_work_begin FROM em WHERE em_id = '"
                                + emId + "'";
                SqlUtils.executeUpdate("sc_zf_em", insertSql);
                SqlUtils.commit();
            }
        }
    }
    
    /**
     * 根据Em表中的数据更新住房档案信息
     */
    public void updateZfEmInfoFromEm() {
        ContextStore.get().getEventHandlerContext();
        final String sql =
                "update sc_zf_em set (xm,xb,email,sfzh,gzbm,dv_id,zw_jb_id,zw_jb_name,zw_id,zw_name,zc_jb_id,zc_jb_name, zc_id,zc_name,mphone,telephone,date_begin_work,date_come_sch,em_type) "
                        + "= "
                        + "(select name,sex,email,identi_code,gzbm,dv_id,zw_jb_id,(select zw_jb_name from sc_zw_jb where sc_zw_jb.zw_jb_id=em.zw_jb_id),zw_id,(select zw_name from sc_zw where sc_zw.zw_id=em.zw_id),zc_jb_id,(select zc_jb_name from sc_zc_jb where sc_zc_jb.zc_jb_id=em.zc_jb_id),zc_id,(select zc_name from sc_zc where sc_zc.zc_id=em.zc_id),phone,phone_home,date_join_work,date_work_begin,zaigangzhuangtai_id from em where em.em_id=sc_zf_em.em_id) where sc_zf_em.em_id in (select em_id from em)";
        SqlUtils.executeUpdate("sc_zf_em", sql);
        SqlUtils.commit();
    }
}
