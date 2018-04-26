package com.archibus.service.school.dinge;

import java.text.SimpleDateFormat;
import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class VerifyDinge extends EventHandlerBase {
    
    public void insertDingeDvByYear(final String year, final String type, final String zhonglei) {
        if (zhonglei.equals("XY")) {
            final String sqlxy = " bu_class = 'XY'";
            if (type.equals("EDIT")) {
                final String delSqlXY =
                        "delete from sc_ts_dv_dinge where year_dinge='" + year
                                + "' and bu_id in (select bu_id from bu where " + sqlxy + ")";
                SqlUtils.executeUpdate("sc_ts_dv_dinge", delSqlXY);
                SqlUtils.commit();
            }
            final String sqlXY =
                    "INSERT INTO sc_ts_dv_dinge(dv_id,bu_id,dv_name,year_dinge) select dv_id,bu_id,dv_name,'"
                            + year + "' from dv where bu_id in (select bu_id from bu where "
                            + sqlxy + ")";
            SqlUtils.executeUpdate("sc_ts_dv_dinge", sqlXY);
            SqlUtils.commit();
        } else if (zhonglei.equals("DZGL")) {
            final String sqldzgl = "bu_class='DZGL'";
            if (type.equals("EDIT")) {
                final String delSqlDZ =
                        "delete from sc_ts_dv_dinge where year_dinge='" + year
                                + "' and  bu_id in (select bu_id from bu where " + sqldzgl + ")";
                SqlUtils.executeUpdate("sc_ts_dv_dinge", delSqlDZ);
                SqlUtils.commit();
            }
            final String sqlDZ =
                    "INSERT INTO sc_ts_dv_dinge(dv_id,bu_id,dv_name,year_dinge) select dv_id,bu_id,dv_name,'"
                            + year + "' from dv where bu_id in (select bu_id from bu where "
                            + sqldzgl + ")";
            SqlUtils.executeUpdate("sc_ts_dv_dinge", sqlDZ);
            SqlUtils.commit();
        } else {
            final String sqlzh = "bu_class = 'XY' or bu_class='DZGL'";
            final String sqlZH =
                    "INSERT INTO sc_ts_dv_dinge(dv_id,bu_id,dv_name,year_dinge) select dv_id,bu_id,dv_name,'"
                            + year + "' from dv where bu_id in (select bu_id from bu where "
                            + sqlzh + ")";
            SqlUtils.executeUpdate("sc_ts_dv_dinge", sqlZH);
            SqlUtils.commit();
        }
        
    }
    
    public void verifyData(final String Year) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String messageFormula = this.verifyDataForEm();
        final String mesageEm = this.verifyFormula(Year);
        
        final JSONObject json = new JSONObject();
        json.put("mFormula", messageFormula);
        json.put("mEm", mesageEm);
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    public String verifyDataForEm() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                " select count(*) as dvCount,em.dv_id,dv.dv_name as dvName from em,dv where em.dv_id=dv.dv_id "
                        + " and (em.zhic_id is null or em.zhiw_id is null)"
                        + " group by em.dv_id,dv.dv_name";
        final List records = retrieveDbRecords(context, sql);
        String message = "";
        if (!records.isEmpty()) {
            final int length = records.size();
            if (length <= 5) {
                for (int i = 0; i < length; i++) {
                    final Map recordMap = (Map) records.get(i);
                    final String dvName = recordMap.get("dvName").toString();
                    final String dvCount = recordMap.get("dvCount").toString();
                    if (message == "") {
                        message = dvName + "有" + dvCount + "个教职工没有职务职称";
                    } else {
                        message = message + "、" + dvName + "有" + dvCount + "个教职工没有职务职称";
                    }
                }
            } else {
                message = length + "个单位的某些教职工没有职务职称";
            }
        }
        return message;
    }
    
    public String verifyFormula(final String year) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "select dv.dv_name as dvName from sc_ts_dv_dinge,dv  where sc_ts_dv_dinge.dv_id=dv.dv_id and formula_id is null and year_dinge='"
                        + year + "'";
        final List records = retrieveDbRecords(context, sql);
        String message = "";
        if (!records.isEmpty()) {
            final int length = records.size();
            if (length <= 5) {
                for (int i = 0; i < length; i++) {
                    final Map recordMap = (Map) records.get(i);
                    final String dvName = recordMap.get("dvName").toString();
                    if (message == "") {
                        message = dvName;
                    } else {
                        message = message + "、" + dvName;
                    }
                }
            } else {
                message = length + "个单位没有选择定额计算公式";
            }
        }
        return message;
    }
    
    public void updateDingeJiBie() {
        final String sql =
                "declare \r\n"
                        + "       cursor csr_dept\r\n"
                        + "       is\r\n"
                        + "       select em_id\r\n"
                        + "       from em;\r\n"
                        + "       row_dept csr_dept%rowtype;\r\n"
                        + "begin\r\n"
                        + "       for row_dept in csr_dept loop\r\n"
                        + "           update em set area_dinge = ( select max(area_dinge)\r\n"
                        + "                from\r\n"
                        + "                (\r\n"
                        + "                select sc_zhiwu.area_dinge from sc_zhiwu,em where sc_zhiwu.zhiw_id = em.zhiw_id and EM.EM_ID = row_dept.em_id\r\n"
                        + "                union all\r\n"
                        + "                select sc_zhic.area_dinge from sc_zhic,em where sc_zhic.zhic_id = em.zhic_id and EM.EM_ID = row_dept.em_id\r\n"
                        + "                )\r\n"
                        + "                )where em.em_id = row_dept.em_id;\r\n"
                        + "       end loop;\r\n" + "end;";
        SqlUtils.executeUpdate("em", sql);
        SqlUtils.commit();
    }
    
    public void insertDvAreaByMonth() {
        final java.util.Date curDate = new Date(System.currentTimeMillis());
        final SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy");
        final SimpleDateFormat monthFormat = new SimpleDateFormat("MM");
        final String year = yearFormat.format(curDate);
        final String month = monthFormat.format(curDate);
        final String sqll =
                "INSERT INTO sc_dv_area_log(dv_id,area,year,month)  SELECT dv_id,area_rm,'" + year
                        + "','" + month + "' from dv ";
        SqlUtils.executeUpdate("sc_dv_area_log", sqll);
        SqlUtils.commit();
    }
}
