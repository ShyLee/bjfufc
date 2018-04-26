package com.archibus.service.school.datatransfer;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class DataTransferEqRmToZjk extends EventHandlerBase {
    
    private final String EQRM_VIEW = "expbook_assets"; // public synonym expbook_assets for
    
    private static Logger log = Logger.getLogger(DataTransferEqRmToZjk.class);
    
    public void getEqDatafromEqSys() {
        
        final long start = System.currentTimeMillis();
        
        // 1: 判断房产系统eq表是否有数据
        final int nowEqRecordsCount = this.getOldEqRecordsCount();
        if (nowEqRecordsCount == 0) {
            this.insertFcEqFromEqSys();
            return;
        }
        if (nowEqRecordsCount > 0) {
            // 1 delete fc-eq where not exists in eq-sys
            this.deleteFcEqNotInEQSys();
            // 2 update fc-eq by eq-sys
            this.updateNewEqfromEqSys();
            // 3 insert new record from eq-sys
            this.insertNewEqfromEqSys();
        }
        
        final long end = System.currentTimeMillis();
        final Calendar c = Calendar.getInstance();
        c.setTimeInMillis(end - start);
        log.info("耗时: " + c.get(Calendar.MINUTE) + "分 " + c.get(Calendar.SECOND) + "秒 "
                + c.get(Calendar.MILLISECOND) + " 微秒");
        // System.out.println("耗时: " + c.get(Calendar.MINUTE) + "分 " + c.get(Calendar.SECOND) + "秒 "
        // + c.get(Calendar.MILLISECOND) + " 微秒");
    }
    
    /**
     * Get Old Record Count of Equipment data From Fc-sys
     * 
     * @return
     */
    public int getOldEqRecordsCount() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        int recCount = 0;
        final String sql = "SELECT count(*) FROM eq";
        final List records = selectDbRecords(context, sql);
        recCount = records.size();
        return recCount;
    }
    
    /**
     * Get New Record Count of Equipment data From eq-sys
     * 
     * @return
     */
    public int getNewEqRecordsCount() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        int recCount = 0;
        final String sql = "SELECT count(*) FROM " + this.EQRM_VIEW;
        final List records = selectDbRecords(context, sql);
        recCount = records.size();
        return recCount;
    }
    
    /**
     * Insert eq data Where bl_id,fl_id,rm_id is exists in rm table
     */
    private void insertFcEqFromEqSys() {
        final String sql =
                "INSERT INTO eq(eq_id,eq_name,modelno,eq_type,dv_name,em_name,bl_id,fl_id,rm_id) "
                        + "SELECT a.code,a.name,a.model,a.type_name,a.base_dep_name,a.base_teacher_name,a.base_building_no,floor,a.no "
                        + "FROM "
                        + this.EQRM_VIEW
                        + " a "
                        + "WHERE  exists (SELECT 1 FROM rm WHERE rm.bl_id=a.base_building_no and rm.fl_id=a.floor and rm.rm_id=a.no)";
        SqlUtils.executeUpdate("eq", sql);
        
        final String sql1 =
                "INSERT INTO eq(eq_id,eq_name,modelno,eq_type,dv_name,em_name) "
                        + "SELECT a.code,a.name,a.model,a.type_name,a.base_dep_name,a.base_teacher_name "
                        + "FROM "
                        + this.EQRM_VIEW
                        + " a "
                        + "WHERE  not exists (SELECT 1 FROM rm WHERE rm.bl_id=a.base_building_no and rm.fl_id=a.floor and rm.rm_id=a.no)";
        SqlUtils.executeUpdate("eq", sql1);
        SqlUtils.commit();
    }
    
    /**
     * Get Eq count of no room info
     * 
     * @return
     */
    private int getEqCountNoRm() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        int recCount = 0;
        final String sql = "SELECT count(*) FROM eq WHERE eq.rm_id is null";
        final List records = selectDbRecords(context, sql);
        recCount = records.size();
        return recCount;
    }
    
    /**
     * 
     */
    private void insertNewEqfromEqSys() {
        final String sql =
                "INSERT INTO eq(eq_id,eq_name,modelno,eq_type,dv_name,em_name,bl_id,fl_id,rm_id) "
                        + "SELECT a.code,a.name,a.model,a.type_name,a.base_dep_name,a.base_teacher_name,a.base_building_no,floor,a.no "
                        + "FROM "
                        + this.EQRM_VIEW
                        + " a "
                        + "WHERE  exists (SELECT 1 FROM rm WHERE rm.bl_id=a.base_building_no and rm.fl_id=a.floor and rm.rm_id=a.no) "
                        + " AND not exists(SELECT 1 FROM eq WHERE eq.eq_id=a.code)";
        SqlUtils.executeUpdate("eq", sql);
        
        final String sql1 =
                "INSERT INTO eq(eq_id,eq_name,modelno,eq_type,dv_name,em_name) "
                        + "SELECT a.code,a.name,a.model,a.type_name,a.base_dep_name,a.base_teacher_name"
                        + "FROM "
                        + this.EQRM_VIEW
                        + " a "
                        + "WHERE not exists (SELECT 1 FROM rm WHERE rm.bl_id=a.base_building_no and rm.fl_id=a.floor and rm.rm_id=a.no) "
                        + " AND not exists(SELECT 1 FROM eq WHERE eq.eq_id=a.code)";
        SqlUtils.executeUpdate("eq", sql1);
        SqlUtils.commit();
    }
    
    /**
     * 
     */
    private void deleteFcEqNotInEQSys() {
        // 1 before delete, archived those record into rmpct (add eq_id column)
        // 2 delete eq data,which not exists eq-sys
        final String sql =
                "DELETE FROM eq WHERE not exists (SELECT 1 FROM " + this.EQRM_VIEW + " a "
                        + " WHERE a.code=eq.code)";
        
        SqlUtils.executeUpdate("eq", sql);
        SqlUtils.commit();
    }
    
    /**
     * 
     */
    private void updateNewEqfromEqSys() {
        final String sql =
                "UPDATE eq SET (eq_name,modelno,eq_type,dv_name,em_name,bl_id,fl_id,rm_id)= "
                        + " (SELECT a.name,a.model,a.type_name,a.base_dep_name,a.base_teacher_name,a.base_building_no,floor,a.no "
                        + " FROM "
                        + this.EQRM_VIEW
                        + " a "
                        + " WHERE exists (SELECT 1 FROM rm WHERE rm.bl_id=a.base_building_no and rm.fl_id=a.floor and rm.rm_id=a.no)"
                        + " and a.code=eq.eq_id )";
        
        SqlUtils.executeUpdate("eq", sql);
        
        final String sql1 =
                "UPDATE eq SET (eq_name,modelno,eq_type,dv_name,em_name)= "
                        + " (SELECT a.name,a.model,a.type_name,a.base_dep_name,a.base_teacher_name "
                        + " FROM "
                        + this.EQRM_VIEW
                        + " a "
                        + " WHERE not exists (SELECT 1 FROM rm WHERE rm.bl_id=a.base_building_no and rm.fl_id=a.floor and rm.rm_id=a.no)"
                        + " and a.code=eq.eq_id )";
        SqlUtils.executeUpdate("eq", sql1);
        SqlUtils.commit();
    }
    
}
