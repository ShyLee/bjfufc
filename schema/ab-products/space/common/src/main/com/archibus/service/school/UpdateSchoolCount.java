package com.archibus.service.school;

import com.archibus.datasource.*;
import com.archibus.eventhandler.EventHandlerBase;

public class UpdateSchoolCount extends EventHandlerBase {
    
    /**
     * 
     */
    public static void updateCount() {
        calculateCountRm();
        calculateNoBldgs();
        updateStudentCount();
        updateEmployeeHeadcounts();
        calculateFlNum();
    }
    
    public static void updateStudentAndEmpCount() {
        // calculateCountRm();
        // calculateNoBldgs();
        updateStudentCount();
        updateEmployeeHeadcounts();
    }
    
    public static void calculateNoBldgs() {
        new FieldOperation("property", "bl").setAssignedRestriction("bl.acc_type !='yxz'")
            .calculate("property.qty_no_bldgs_calc", "COUNT", "bl.bl_id");
        new FieldOperation("site", "property").calculate("site.no_bldgs", "SUM",
            "property.qty_no_bldgs_calc");
        new FieldOperation("sc_school", "site").calculate("sc_school.count_bl", "SUM",
            "site.no_bldgs");
    }
    
    private static void calculateFlNum() {
        new FieldOperation("bl", "fl").setAssignedRestriction("fl.overground ='yes'").calculate(
            "bl.count_upground", "COUNT", "fl.fl_id");
        
        new FieldOperation("bl", "fl").setAssignedRestriction("fl.overground !='yes'").calculate(
            "bl.count_underground", "COUNT", "fl.fl_id");
        
        new FieldOperation("bl", "fl").calculate("bl.count_fl", "COUNT", "fl.fl_id");
    }
    
    /**
     * Update Room COUNT for FL,BL,DV,SITE,SC_SCHOOL
     */
    public static void calculateCountRm() {
        
        // Count Numbers of room on each floor
        
        new FieldOperation("fl", "rm").calculate("fl.count_rm", "COUNT", "rm.rm_id");
        
        // Count Numbers of room on each building from fl"
        
        new FieldOperation("bl", "fl").calculate("bl.count_rm_keyong", "SUM", "fl.count_rm");
        
        // SUM Numbers of room on each site from bl
        new FieldOperation("site", "bl").setAssignedRestriction("bl.acc_type!='yxz'").calculate(
            "site.count_rm", "SUM", "bl.count_rm_keyong");
        
        // SUM Numbers of room on school from site
        new FieldOperation("sc_school", "site").calculate("sc_school.count_rm", "SUM",
            "site.count_rm");
        
        // Count Numbers of room on each division from VIEW-"sc_view_bldvcat"
        
        new FieldOperation("dv", "sc_view_bldvcat").calculate("dv.count_rm", "SUM",
            "sc_view_bldvcat.count_rm");
    }
    
    /**
     * calculate the dv.count_student field
     */
    public static void updateStudentCount() {
        new FieldFormula("dv").setAssignedRestriction("dv.bu_id = '教学单位'").calculate(
            "dv.count_student",
            "count_benk + count_shuos + count_bos + count_bosh + count_liuxues + count_zhuank");
        
        new FieldOperation("site", "dv").calculate("site.count_student_actual", "SUM",
            "dv.count_student");
        new FieldOperation("sc_school", "dv").calculate("sc_school.count_student_actual", "SUM",
            "dv.count_student");
    }
    
    /**
     * calculate the dv.count_em field
     */
    public static void updateTeacherCount() {
        new FieldFormula("dv").calculate("dv.count_em",
            "count_teacher + count_zhuanji + count_gongren + count_ganbu");
        new FieldOperation("bu", "dv").calculate("bu.count_em", "SUM", "dv.count_em");
        
        new FieldOperation("sc_school", "dv").calculate("sc_school.count_teacher_actual", "SUM",
            "dv.count_em");
    }
    
    /**
     * Employee update calculations.
     * 
     * @see emup.abs
     */
    public static void updateEmployeeHeadcounts() {
        
        // COUNT number of EMPLOYEES in each RM
        
        new FieldOperation("rm", "em").calculate("rm.count_em", "COUNT", "em.em_id");
        
        // Equal Division of room area among employees
        
        new FieldFormula("rm", "em")
            .setAssignedRestriction(
                "em.pct_rm = 0 AND em.bl_id is not null AND em.fl_id is not null AND em.rm_id IS NOT NULL")
            .calculate("em.area_rm",
                "rm.area / " + SqlUtils.formatSqlReplace0WithHuge("rm.count_em"));
        
        //
        new FieldFormula("rm", "em").setAssignedRestriction(
            "em.pct_rm = 0 AND em.rm_id IS NOT NULL").calculate("em.option1", "rm.count_em");
        
        // COUNT number of EMPLOYEES on each FL
        
        new FieldOperation("fl", "em").calculate("fl.count_em", "COUNT", "em.em_id");
        
        // SUM number of EMPLOYEES from FL to BL
        
        new FieldOperation("bl", "fl").calculate("bl.count_em", "SUM", "fl.count_em");
        
        // COUNT number of EMPLOYEES on each DP
        
        new FieldOperation("dp", "em").calculate("dp.count_em", "COUNT", "em.em_id");
        
        // COUNT number of EMPLOYEES in each DV
        
        // new FieldOperation("dv", "em").calculate("dv.count_em", "COUNT", "em.em_id");
        new FieldFormula("dv").calculate("dv.count_em",
            "count_teacher + count_zhuanji + count_gongren + count_ganbu");
        
        // 学院和校区不存在固定关系，无法统计
        // new FieldOperation("site", "dv").calculate("site.count_teacher_actual", "SUM",
        // "dv.count_em");
        
        // SUM number of EMPLOYEES from dv to SITE
        
        // new FieldOperation("site", "dv").calculate("site.count_em", "SUM", "dv.count_em");
        
        // SUM number of TEACHERS from division to sc_school
        new FieldOperation("sc_school", "dv").calculate("sc_school.count_teacher_actual", "SUM",
            "dv.count_em");
        
        // SUM number of EMPLOYEES from DV to BU
        
        new FieldOperation("bu", "dv").calculate("bu.count_em", "SUM", "dv.count_em");
        
        // SUM number of EMPLOYEES from RM to RMTYPE
        
        new FieldOperation("rmtype", "rm").calculate("rmtype.count_em", "SUM", "rm.count_em");
        
        // SUM number of EMPLOYEES from RMTYPE to RMCAT
        
        new FieldOperation("rmcat", "rm").calculate("rmcat.count_em", "SUM", "rm.count_em");
        
        // SUM number of EMPLOYEES from RM to RMSTD
        
        new FieldOperation("rmstd", "rm").calculate("rmstd.count_em", "SUM", "rm.count_em");
        
        // COUNT number of EMPLOYEES for each EMSTD
        
        new FieldOperation("emstd", "em").calculate("emstd.count_em", "COUNT", "em.em_id");
    }
    
}
