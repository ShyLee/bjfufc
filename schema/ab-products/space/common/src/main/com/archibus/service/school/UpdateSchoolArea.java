package com.archibus.service.school;

import com.archibus.datasource.*;
import com.archibus.eventhandler.EventHandlerBase;

public class UpdateSchoolArea extends EventHandlerBase {
    
    /**
     * The interface function,
     */
    public static void updateArea() {
        
        // update area of Location
        calculateGros();
        calculateAreaShiYong();
        
        // update gongtanlv
        calculateBlRates();
        
        // update the area and count room for rmcat
        updateRmcatArea();
        
        calculateDivisions();
        calculateBu();
    }
    
    /**
     * SUM gross areas
     */
    private static void calculateGros() {
        // Sum EXTERNAL and INTERNAL gross areas from GROS to FL
        /*new FieldOperation("fl", "gros").setAssignedRestriction("gros.gros_type='EXT'").calculate(
            "fl.area_gross_ext", "SUM", "gros.area");
        
        new FieldOperation("fl", "gros").setAssignedRestriction("gros.gros_type='INT'").calculate(
            "fl.area_gross_int", "SUM", "gros.area");
        
        // Calculate EXTERIOR WALL area in FL
        new FieldFormula("fl").setAssignedRestriction("fl.area_gross_ext <> 0").calculate(
            "fl.area_ext_wall", "fl.area_gross_ext - fl.area_gross_int");
        new FieldFormula("fl").setAssignedRestriction("fl.area_gross_ext = 0").calculate(
            "fl.area_ext_wall", "0");
        
        // Sum EXTERNAL, INTERNAL, and EXT. WALL area from FL to BL
        new FieldOperation("bl", "fl")
            .addOperation("bl.area_gross_ext", "SUM", "fl.area_gross_ext").addOperation(
                "bl.area_gross_int", "SUM", "fl.area_gross_int").addOperation("bl.area_ext_wall",
                "SUM", "fl.area_ext_wall").calculate();
        
        // Sum EXTERNAL, INTERNAL, and EXT. WALL area from BL to SITE
        new FieldOperation("site", "bl").setAssignedRestriction("bl.acc_type!='yxz'").addOperation(
            "site.area_gross_ext", "SUM", "bl.area_gross_ext").addOperation("site.area_gross_int",
            "SUM", "bl.area_building_manual").addOperation("site.area_ext_wall", "SUM",
            "bl.area_ext_wall").addOperation("site.area_underground", "SUM", "bl.area_underground")
            .calculate();*/
        
        
        
        new FieldOperation("site", "bl").addOperation("site.area_gross_int", "SUM",
                "bl.area_building_manual").calculate();
        
        new FieldOperation("sc_school", "site").addOperation("sc_school.area_jianzhu", "SUM",
            "site.area_gross_int").calculate();
        
        new FieldOperation("site", "bl").addOperation("site.no_bldgs", "COUNT", "bl.bl_id").calculate();
        
        new FieldOperation("sc_school", "site").addOperation("sc_school.count_bl", "SUM", "site.no_bldgs").calculate();
        
        String updateSql = "update sc_school set count_rm=(select count(rm_id) from rm)";
        SqlUtils.executeUpdate("sc_school", updateSql);
        SqlUtils.commit();
        
    }
    
    /**
     * SUM Usable Area for FL,BL,SITE; Count numbers of floor in the building, this value is used
     * when calculate bl.gongtanlv
     */
    private static void calculateAreaShiYong() {
        // SUM Service area from RM to FL
        new FieldOperation("fl", "rm").setAssignedRestriction("rm.rm_cat='SERV'").calculate(
            "fl.area_serv", "SUM", "rm.area");
        
        // SUM Room Area from RM to FL
        new FieldOperation("fl", "rm").calculate("fl.area_rm", "SUM", "rm.area");
        
        // SUM Service Area from FL to BL
        new FieldOperation("bl", "fl").addOperation("bl.area_serv", "SUM", "fl.area_serv")
            .addOperation("bl.count_fl_ground", "COUNT", "fl.fl_id").calculate();
        
        // SUM room area from View--SC_VIEW_BLDVCAT to BL
        new FieldOperation("bl", "fl").calculate("bl.area_rm", "SUM", "fl.area_rm");
        
        // SUM room area from BL to SITE
        new FieldOperation("site", "bl").setAssignedRestriction("bl.acc_type!='yxz'").addOperation(
            "site.area_rm", "SUM", "bl.area_rm").addOperation("site.area_serv", "SUM",
            "bl.area_serv").calculate();
        new FieldOperation("sc_school", "site").addOperation("sc_school.area_shiyong", "SUM",
            "site.area_rm").addOperation("sc_school.area_serv", "SUM", "site.area_serv")
            .calculate();
        
        // Calculate common area of building
        new FieldFormula("bl").calculate("bl.area_bl_comn_gp",
            "bl.area_building_manual - bl.area_rm");
        new FieldOperation("site", "bl").setAssignedRestriction("bl.acc_type!='yxz'").calculate(
            "site.area_gp_comn", "SUM", "bl.area_bl_comn_gp");
        new FieldOperation("sc_school", "site").calculate("sc_school.area_comn", "SUM",
            "site.area_gp_comn");
        
    }
    
    /**
     * Calculate GongTanLv and share_serv_rate of BL
     */
    private static void calculateBlRates() {
        
        // Calculate GongTanLv of BL
        
        new FieldFormula("bl").setAssignedRestriction(
            "bl.count_fl_ground <> 0 and bl.area_building_manual <> 0").calculate("bl.gongtanlv",
            "(bl.area_building_manual-bl.area_rm) / bl.area_building_manual");
        
        // Calculate share_serv_rate of BL
        new FieldFormula("bl").setAssignedRestriction(
            "bl.count_fl_ground <> 0 and bl.area_building_manual <> 0").calculate(
            "bl.share_serv_rate",
            "(bl.area_building_manual-bl.area_rm + bl.area_serv) / bl.area_building_manual");
        
        new FieldFormula("bl").setAssignedRestriction("bl.count_fl_ground = 0").calculate(
            "bl.share_serv_rate", "bl.gongtanlv");
    }
    
    /**
     * Update rmcat area and room count from VIEW--SC_VIEW_BLDVCAT
     */
    private static void updateRmcatArea() {
        
        // SUM AREA and ROOM Count from SC_VIEW_BLDVCAT to RMCAT
        new FieldOperation("rmcat", "UIBE_RMCAT").addOperation("rmcat.area", "SUM",
            "UIBE_RMCAT.area_shiyong").addOperation("rmcat.area_jianzhu", "SUM",
            "UIBE_RMCAT.area_jianzhu")
            .addOperation("rmcat.tot_count", "SUM", "UIBE_RMCAT.count_rm").calculate();
        
        // SUM AREA and ROOM Count from RM to RMTYPE
        new FieldOperation("rmtype", "rm").addOperation("rmtype.area", "SUM", "rm.area")
            .addOperation("rmtype.tot_count", "COUNT", "rm.rm_id").calculate();
        
        // calculate area_avg
        new FieldFormula("rmcat").setAssignedRestriction("rmcat.tot_count <> 0").calculate(
            "rmcat.area_avg", "(rmcat.area) / rmcat.tot_count");
        
        new FieldFormula("rmtype").setAssignedRestriction("rmtype.tot_count <> 0").calculate(
            "rmtype.area_avg", "(rmtype.area) / rmtype.tot_count");
    }
    
    /**
     * update em.area_rm for emplyee's room change
     */
    public static void updateEmArea(final String blId, final String flId, final String rmId) {
        
        final String sql =
                " update em" + "                 set em.area_rm = (select (CASE"
                        + "                                            WHEN rm.count_em = 0 THEN"
                        + "                                             em.area_rm"
                        + "                                            else"
                        + "                                             rm.area"
                        + "                                          END) / (CASE"
                        + "                                            WHEN rm.count_em = 0 THEN"
                        + "                                             1"
                        + "                                            else"
                        + "                                             rm.count_em"
                        + "                                          END)"
                        + "                                     from rm"
                        + "                                    where rm.bl_id  = '" + blId + "'"
                        + "                                      and rm.fl_id  = '" + flId + "'"
                        + "                                      and rm.rm_id  = '" + rmId + "')";
        SqlUtils.executeUpdate("em", sql);
        SqlUtils.commit();
    }
    
    /**
     * Update dv.count_rm,dv.area_rm,dv.area_jianzhu from view
     */
    private static void calculateDivisions() {
        new FieldOperation("dv", "sc_view_bldvcat").addOperation("dv.area_rm", "SUM",
            "sc_view_bldvcat.area_shiyong").addOperation("dv.area_jianzhu", "SUM",
            "sc_view_bldvcat.area_jianzhu").calculate();
        new FieldFormula("dv")
            .setAssignedRestriction(
                "dv.bu_id in (SELECT bu_id FROM bu WHERE bu_class = 'JXKY') AND dv.count_em_adjust !=0")
            .calculate("dv.area_avg_em", "(dv.area_rm) / dv.count_em_adjust");
        new FieldOperation("dv", "USMS_DVTYPE").setAssignedRestriction(
            "USMS_DVTYPE.type_name='办公室'").calculate("dv.area_comn_ocup", "SUM",
            "USMS_DVTYPE.area_shiyong");
        new FieldOperation("dv", "USMS_DVTYPE").setAssignedRestriction(
            "USMS_DVTYPE.type_name='会议室'").calculate("dv.area_conference", "SUM",
            "USMS_DVTYPE.area_shiyong");
        new FieldOperation("dv", "USMS_DVTYPE").setAssignedRestriction(
            "USMS_DVTYPE.type_name='教师工作室'").calculate("dv.area_comn_nocup", "SUM",
            "USMS_DVTYPE.area_shiyong");
    }
    
    /**
     * Update bu.count_rm,bu.area_rm,bu.area_jianzhu
     */
    private static void calculateBu() {
        new FieldOperation("bu", "sc_view_bldvcat").addOperation("bu.area_rm", "SUM",
            "sc_view_bldvcat.area_shiyong").addOperation("bu.area_jianzhu", "SUM",
            "sc_view_bldvcat.area_jianzhu").calculate();
        
        new FieldFormula("bu").setAssignedRestriction(
            "bu.bu_class = 'JXKY' AND bu.count_em_adjust !=0").calculate("bu.area_avg_em",
            "(bu.area_rm) / bu.count_em_adjust");
        
    }
    
}
