package com.archibus.service.school.zfbt;

import java.text.SimpleDateFormat;
import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.school.tools.SchTools;
import com.archibus.utility.ExceptionBase;

public final class ZhuFangBuTieService extends EventHandlerBase {
    public int count_em = 0;
    
    public double total_bt_money = 0.00;
    
    public static String EM_STATUS_ZC = "1"; // 正常
    
    public void calcEmsZhuFangBt(final String yearmonth, final String dvId, final String date_allot) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        this.verifyEmpty(context);
        this.delBtMonthTemp(context, yearmonth);
        // this.insertRec_BtMain(context, yearmonth);
        this.insertRec_BtDetailTemp(context, yearmonth, dvId, date_allot);
        
        this.getSumValueOfCurrCalcu(context, yearmonth, dvId);
        
        // this.updateRec_BtMain(context, yearmonth);
        
        final JSONObject calc_result = new JSONObject();
        calc_result.put("count_em", this.count_em);
        calc_result.put("total_bt_money", this.total_bt_money);
        
        context.addResponseParameter("jsonExpression", calc_result.toString());
    }
    
    /**
     * 检查补贴账户中的单位在dv表中是否存在
     * 
     * @param context
     */
    private void verifyEmpty(final EventHandlerContext context) {
        final String sql =
                "select em_id,em_name from sc_bt_acc where status="
                        + literal(context, this.EM_STATUS_ZC)
                        + " and (dv_id is null or dv_id not in (select dv_id from dv))";
        SqlUtils.executeUpdate("sc_bt_acc", sql);
        SqlUtils.commit();
        String emList = "";
        final List records = retrieveDbRecords(context, sql);
        if (!records.isEmpty()) {
            for (int i = 0; i < records.size(); i++) {
                final Map record = (Map) records.get(i);
                if (emList != "") {
                    emList = emList + "," + record.get("em_id");
                } else {
                    emList = record.get("em_id").toString();
                }
                
            }
            throw new ExceptionBase(String.format("职工号为" + emList + "的使用单位为空或者在使用单位表中不存在,请检查后再计算!"));
        }
    }
    
    private void insertRec_BtMain(final EventHandlerContext context, final String yearmonth) {
        final String sql =
                "INSERT INTO sc_bt_allot_month_main(yearmonth) values("
                        + literal(context, yearmonth) + ")";
        SqlUtils.executeUpdate("sc_bt_allot_month_main", sql);
        SqlUtils.commit();
    }
    
    private void updateRec_BtMain(final EventHandlerContext context, final String yearmonth) {
        final String sql =
                "Update sc_bt_allot_month_main SET count_em=" + this.count_em + " , total_money="
                        + this.total_bt_money + ",finished = 'Y'" + " Where yearmonth="
                        + literal(context, yearmonth);
        SqlUtils.executeUpdate("sc_bt_allot_month_main", sql);
        SqlUtils.commit();
    }
    
    private void insertRec_BtDetailTemp(final EventHandlerContext context, final String yearmonth,
            final String dvId, final String date_allot) {
        // getAllZfbt_ems(context, "在岗职工", dvId);
        
        final StringBuffer sql = new StringBuffer();
        final String notes = "发放" + yearmonth + "住房补贴";
        sql.append(" Insert into sc_bt_allot_month_temp(yearmonth,em_id,em_name,em_bt_no, ");
        sql.append(" identi_code,date_allot,zhiji_name,zhiji_area,emtype_name,emtype_std,dv_id, ");
        sql
            .append(" actual_bt_area,fentan_area,po_name,po_zhiji_name,hj_fuli_area,pre_total_allot_money, ");
        sql
            .append(" allot_money,total_allot_money,alloted_count_month,bd_flag,update_flag,notes) ");
        sql.append(" SELECT " + literal(context, yearmonth) + ",");
        sql.append("  sc_bt_acc.em_id,sc_bt_acc.em_name,sc_bt_acc.em_bt_no,sc_bt_acc.identi_code,");
        sql.append(" to_date('" + notNull(date_allot) + "','YYYY-mm-dd'),");
        sql
            .append(" sc_bt_acc.zhiji_name,zj.zhiji_area,sc_bt_acc.emtype_name,ty.emtype_std,sc_bt_acc.dv_id, ");
        sql
            .append(" sc_bt_acc.actual_bt_area,round((zj.zhiji_area-sc_bt_acc.actual_bt_area),2) as fentan_area,sc_bt_acc.po_name,sc_bt_acc.po_zhiji_name,(sc_bt_acc.area_fuli+sc_bt_acc.po_fuli_area) as hj_fuli_area,sc_bt_acc.alloted_money ,");
        sql
            .append(" round(sc_bt_acc.actual_bt_area * ty.emtype_std,2 ),round(sc_bt_acc.alloted_money +(sc_bt_acc.actual_bt_area * ty.emtype_std), 2),sc_bt_acc.alloted_count_month +1,sc_bt_acc.bt_changed,'T',"
                    + literal(context, notes));
        sql.append(" FROM sc_bt_acc,sc_bt_zhiji zj,sc_bt_emtype ty ");
        sql
            .append(" WHERE sc_bt_acc.zhiji_name=zj.zhiji_name and sc_bt_acc.emtype_name=ty.emtype_name and sc_bt_acc.emtype_name='在岗职工'");
        sql.append("  and sc_bt_acc.alloted_count_month<300 and sc_bt_acc.status='"
                + this.EM_STATUS_ZC);
        sql.append("'  and sc_bt_acc.em_bt_no is not null");
        if (!dvId.equals("")) {
            sql.append("  and sc_bt_acc.dv_id=" + literal(context, dvId));
        }
        // System.out.println("[" + sql.toString() + "]");
        SqlUtils.executeUpdate("sc_bt_allot_month_detail", sql.toString());
        SqlUtils.commit();
        
    }
    
    private void getSumValueOfCurrCalcu(final EventHandlerContext context, final String yearmonth,
            final String dvId) {
        final StringBuffer sql = new StringBuffer();
        sql
            .append(" SELECT count(*) as count_em , round(sum(sc_bt_acc.actual_bt_area * ty.emtype_std),2) as total_money");
        sql.append(" FROM sc_bt_acc,sc_bt_zhiji zj,sc_bt_emtype ty ");
        sql
            .append(" WHERE sc_bt_acc.zhiji_name=zj.zhiji_name and sc_bt_acc.emtype_name=ty.emtype_name and sc_bt_acc.emtype_name='在岗职工'");
        sql.append("  and sc_bt_acc.alloted_count_month<300 and sc_bt_acc.status='"
                + this.EM_STATUS_ZC);
        sql.append("'  and sc_bt_acc.em_bt_no is not null");
        if (!dvId.equals("")) {
            sql.append("  and sc_bt_acc.dv_id=" + literal(context, dvId));
        }
        final List records = retrieveDbRecords(context, sql.toString());
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            this.count_em = getIntegerValue(context, record.get("count_em")).intValue();
            this.total_bt_money = Double.parseDouble(record.get("total_money").toString());
        }
        
    }
    
    private void delBtMonthTemp(final EventHandlerContext context, final String yearmonth) {
        // Step1 -- Delete the records of this month in the table sc_zzfrent_details
        final String sql = "DELETE FROM sc_bt_allot_month_temp ";
        
        SqlUtils.executeUpdate("sc_bt_allot_month_temp", sql);
        SqlUtils.commit();
        
    }
    
    /**
     * 
     * @return
     */
    public String getCurrBtYearMonth() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String lastBtYearMonthValue = "";
        final String sql = " SELECT MAX(yearmonth) AS yearmonth FROM sc_bt_allot_month_main ";
        final List records = retrieveDbRecords(context, sql);
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            lastBtYearMonthValue = record.get("yearmonth").toString();
        }
        return lastBtYearMonthValue == "" ? getCurrYearMonth() : lastBtYearMonthValue;
        
    }
    
    public String getCurrYearMonth() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String sysYearMonthValue = "";
        final String sql = "SELECT to_char(sysdate,'yyyymm') as sysYearMonth FROM dual";
        final List records = retrieveDbRecords(context, sql);
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            sysYearMonthValue = record.get("sysYearMonth").toString();
        }
        return sysYearMonthValue == "" ? null : sysYearMonthValue;
        
    }
    
    /**
     * 保存职工住房补贴
     * 
     * @param yearmonth
     */
    public void saveEmsZhuFangBt(final String yearmonth) {
        // 把sc_bt_allot_month_temp表的数据写入sc_bt_allot_month_detail
        // js --判断sc_bt_allot_month_temp是否为空”本月还没有计算住房补贴,请先计算!"
        // js --判断保存的月份数据已经结转，不能再次保存
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // 新增发放主表
        this.insertRec_BtMain(context, yearmonth);
        // 保存发放明细表
        this.insertRec_BtDetail(context, yearmonth);
        // 更新发放主表
        this.getSumValueOfCurrCalcu(context, yearmonth, "");
        this.updateRec_BtMain(context, yearmonth);
        // 更改职工表
        this.updateEmsAfterSave();
        // 删除补贴计算表数据
        this.delBtMonthTemp(context, yearmonth);
        
    }
    
    private void updateEmsAfterSave() {
        // 更新本月发放金额、累计发放月数、变动标志、累计发放金额
        // new FieldFormula("sc_bt_allot_month_temp", "sc_bt_acc").setAssignedRestriction(
        // "em_bt_no in (select em_bt_no from sc_bt_allot_month_temp)").calculate("sc_bt_acc.bt_money_month",
        // "sc_bt_allot_month_temp.allot_money");
        // new FieldFormula("sc_bt_acc").calculate("sc_bt_acc.alloted_count_month",
        // "sc_bt_acc.alloted_count_month +1");
        // new FieldFormula("sc_bt_allot_month_temp", "sc_bt_acc").setAssignedRestriction(
        // "em_bt_no in (select em_bt_no from sc_bt_allot_month_temp)").calculate("sc_bt_acc.alloted_money",
        // "sc_bt_acc.alloted_money+sc_bt_allot_month_temp.allot_money");
        final StringBuffer sql = new StringBuffer();
        sql
            .append(" update sc_bt_acc b set (b.bt_money_month,b.alloted_count_month,b.alloted_money)=(");
        sql
            .append(" select a.allot_money,b.alloted_count_month+1,round((b.alloted_money+a.allot_money),2) ");
        sql.append(" from sc_bt_allot_month_temp a where a.em_id=b.em_id)");
        sql.append("where exists (select 1  from sc_bt_zhiji zj, sc_bt_emtype ty ");
        sql
            .append("where b.zhiji_name = zj.zhiji_name and b.emtype_name = ty.emtype_name  and b.emtype_name = '在岗职工' ");
        sql.append("  and b.alloted_count_month<300 and b.status='" + this.EM_STATUS_ZC + "'");
        sql.append("  and b.em_bt_no is not null)");
        SqlUtils.executeUpdate("sc_bt_acc", sql.toString());
        SqlUtils.commit();
    }
    
    /**
     * 
     * @param context
     * @param yearmonth
     */
    private void insertRec_BtDetail(final EventHandlerContext context, final String yearmonth) {
        
        final StringBuffer sql = new StringBuffer();
        sql.append(" Insert into sc_bt_allot_month_detail(yearmonth,em_id,em_name,em_bt_no, ");
        sql
            .append(" identi_code,date_allot,zhiji_name,zhiji_area,emtype_name,emtype_std,dv_name, ");
        sql
            .append(" actual_bt_area,fentan_area,po_name,po_zhiji_name,hj_fuli_area,pre_total_allot_money, ");
        sql
            .append(" allot_money,total_allot_money,alloted_count_month,bd_flag,update_flag,notes) ");
        sql.append(" SELECT yearmonth,em_id,em_name,em_bt_no,");
        sql.append("  identi_code,date_allot,zhiji_name,zhiji_area,emtype_name,emtype_std,dv_id, ");
        sql
            .append(" actual_bt_area,fentan_area,po_name,po_zhiji_name,hj_fuli_area,pre_total_allot_money,");
        sql.append(" allot_money,total_allot_money,alloted_count_month,bd_flag,update_flag,notes ");
        
        sql.append(" FROM sc_bt_allot_month_temp ");
        
        SqlUtils.executeUpdate("sc_bt_allot_month_detail", sql.toString());
        SqlUtils.commit();
        
    }
    
    /**
     * 相比上月职工的住房补贴是否变动
     * 
     * @param emId
     * @param yearmonth
     * @return
     */
    public boolean zfbtIsChanged(final String emBtNo, final String currMonthBtMoney,
            final String yearmonth) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String sql =
                " SELECT em_id,em_bt_no, allot_money,total_allot_money,notes FROM sc_bt_allot_month_detail "
                        + " WHERE em_bt_no =" + literal(context, emBtNo) + "  AND yearmonth="
                        + literal(context, this.getPreYearMonth(yearmonth))
                        + "  AND notes like '发放%'";
        final List records = retrieveDbRecords(context, sql);
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            final int allot_money = getIntegerValue(context, record.get("allot_money")).intValue();
            if (getIntegerValue(context, currMonthBtMoney).intValue() != allot_money) {
                return true;
            }
            
        }
        return false;
    }
    
    /**
     * 得到前补贴月份
     * 
     * @param currYearMonth
     * @return
     */
    private String getPreYearMonth(final String currYearMonth) {
        final String year = currYearMonth.substring(0, 4);
        final String month = currYearMonth.substring(4);
        
        final int int_month = Integer.parseInt(month);
        final String newMonth =
                int_month < 2 ? "12" : int_month <= 10 ? "0"
                        + String.valueOf(Integer.parseInt(month) - 1) : String.valueOf(Integer
                    .parseInt(month) - 1);
        final String newYear = newMonth == "12" ? String.valueOf(Integer.parseInt(year) - 1) : year;
        final String preYearMonth = newYear + newMonth;
        return preYearMonth;
    }
    
    public void getZfbtChangeRecs(final String yearmonth) {
        // 新开户、标准变动、封存
        
        final StringBuffer sql = new StringBuffer();
        sql.append("SELECT ");
        
    }
    
    /**
     * 更新合并变动信息，每个员工只有一条变动汇总记录。如果本月员工为新增用户，则变动原因为“新开户”。
     * 如果本月员工为退休变动，则变动原因为“封存”，面积变动和职级变动都为标准变动，如果变动前后补贴金额不变，则不保存变动汇总记录。
     * 
     * @param yearmonth
     */
    public void refreshZfbtEmChg(final String yearmonth) {
        
        if (yearmonth.equals("")) {
            this.log.error("yearmonth is null");
            return;
        }
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // 插入变更数据
        final StringBuffer sql = new StringBuffer();
        sql.append(" SELECT sc_bt_normal_change.em_id,sc_bt_normal_change.change_type ");
        sql.append(" ,sc_bt_normal_change.month_bt_money1 ");
        sql
            .append(" ,sc_bt_acc.em_name,sc_bt_acc.identi_code,sc_bt_acc.bt_money_month,sc_bt_acc.em_bt_no ");
        sql.append(" FROM sc_bt_normal_change INNER JOIN sc_bt_acc ");
        sql.append(" ON sc_bt_normal_change.em_id = sc_bt_acc.em_id ");
        sql.append(" WHERE change_month = '" + yearmonth + "' ");
        sql.append(" ORDER BY em_id ,change_id ");
        this.log.debug("[SELECT SQL]:[" + sql.toString() + "]");
        final List records = retrieveDbRecords(context, sql.toString());
        String last_em = null;
        /*
         * 由于Select的时候获取了当前的补贴额度，而补贴记录进行了按输入顺序排序，因此第一条记录的变更前的量就是初始量
         * 只需要插入第一条变更记录就可以知道变化前的量和变化量。因此检验重名则不执行任何操作。
         * 另外，由于存在a变成b又变成a的变更模式，因此无法忽略到sc_bt_normal_change.month_bt_money1 =
         * sc_bt_acc.bt_money_month的数据。
         */
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Map record = (Map) it.next();
                final String em_id = SchTools.getString(record, "em_id");
                final String change_type = SchTools.getString(record, "change_type");
                final String month_bt_money1 = SchTools.getString(record, "month_bt_money1");
                final String em_bt_no = SchTools.getString(record, "em_bt_no");
                final String em_name = SchTools.getString(record, "em_name");
                final String identi_code = SchTools.getString(record, "identi_code");
                final String bt_money_month = SchTools.getString(record, "bt_money_month");
                final float add_money =
                        Float.parseFloat(bt_money_month) - Float.parseFloat(month_bt_money1);
                // normal change表变动类型和实际得到的变动汇总表变动原因不同。因此进行判断后存储。
                String chg_cause = "标准变动";
                if (change_type.equals("NEW")) {
                    chg_cause = "新开户";
                }
                if (change_type.equals("QIF")) {
                    chg_cause = "启封";
                }
                if (change_type.equals("PAUSE")) {
                    chg_cause = "暂停";
                }
                if (change_type.equals("TX") || change_type.equals("STOP")) {
                    chg_cause = "封存";
                }
                
                // 有关封存和启封的处理。
                if (em_id.equals(last_em)) {
                    if (chg_cause.equals("封存") || chg_cause.equals("暂停") || chg_cause.equals("启封")) {
                        final StringBuffer updateSql = new StringBuffer();
                        updateSql.append("UPDATE sc_bt_em_chg SET chg_cause = '" + chg_cause
                                + "' WHERE yearmonth = '" + yearmonth + "' AND em_id = '" + em_id
                                + "'");
                        SqlUtils.executeUpdate("sc_bt_em_chg", updateSql.toString());
                        this.log.debug("[UPDATE SQL]:[" + updateSql.toString() + "]");
                    }
                    last_em = em_id;
                    continue;
                }
                last_em = em_id;
                
                final StringBuffer insertSql = new StringBuffer();
                if (add_money < 0) {
                    final float cut_money = Math.abs(add_money);
                    insertSql
                        .append("INSERT INTO sc_bt_em_chg (yearmonth,em_id,em_name,identi_code,chg_cause,new_month_bt_money,old_month_bt_money,em_bt_no,cut_money)");
                    insertSql
                        .append(" values ('" + yearmonth + "','" + em_id + "','" + em_name + "','"
                                + identi_code + "','" + chg_cause + "','" + bt_money_month + "','"
                                + month_bt_money1 + "','" + em_bt_no + "','" + cut_money + "')");
                    
                } else if (add_money > 0) {
                    Math.abs(add_money);
                    insertSql
                        .append("INSERT INTO sc_bt_em_chg (yearmonth,em_id,em_name,identi_code,chg_cause,new_month_bt_money,old_month_bt_money,em_bt_no,add_money)");
                    insertSql
                        .append(" values ('" + yearmonth + "','" + em_id + "','" + em_name + "','"
                                + identi_code + "','" + chg_cause + "','" + bt_money_month + "','"
                                + month_bt_money1 + "','" + em_bt_no + "','" + add_money + "')");
                } else {
                    // 当add_money = 0，即金额未发生变化的时候，不执行插入操作
                    continue;
                }
                this.log.debug("[INSERT SQL]:[" + insertSql.toString() + "]");
                SqlUtils.executeUpdate("sc_bt_em_chg", insertSql.toString());
                SqlUtils.commit();
            }
        }
    }
    
    /**
     * zhangyan add begin 批量封存补贴账户
     * 
     * @param records
     */
    public void SealSelectedMutiBtAcc(final List recordsList) {
        if (recordsList.size() > 0) {
            for (int i = 0; i < recordsList.size(); i++) {
                final String btNo = recordsList.get(i).toString();
                final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
                final List records =
                        selectDbRecords(context,
                            "select em_id,em_name,em_bt_no,po_em_id,po_name,address_emjt from sc_bt_acc where em_bt_no='"
                                    + btNo + "'");
                if (!records.isEmpty()) {
                    String emId = "";
                    String emName = "";
                    String emBtNo = "";
                    String poEmId = "";
                    String poEmName = "";
                    String address = "";
                    for (final Iterator it = records.iterator(); it.hasNext();) {
                        final Object[] values = (Object[]) it.next();
                        emId = (String) values[0];
                        emName = (String) values[1];
                        emBtNo = (String) values[2];
                        poEmId = (String) values[3];
                        poEmName = (String) values[4];
                        address = (String) values[5];
                    }
                    final Date date = new Date();
                    final SimpleDateFormat sdf = new SimpleDateFormat("yyyyMM");
                    final String yearMonth = sdf.format(date);
                    final String updateSql =
                            "update sc_bt_acc set status='3' where em_bt_no='" + btNo + "'";
                    SqlUtils.executeUpdate("sc_bt_acc", updateSql);
                    SqlUtils.commit();
                    
                    final String insertSql =
                            "insert into sc_bt_normal_change(change_month,change_type,em_id,em_name,em_bt_no,po_em_id,po_name,address_home) values("
                                    + literal(context, yearMonth)
                                    + ",'STOP',"
                                    + literal(context, emId)
                                    + ","
                                    + literal(context, emName)
                                    + ","
                                    + literal(context, emBtNo)
                                    + ","
                                    + literal(context, poEmId)
                                    + ","
                                    + literal(context, poEmName)
                                    + ","
                                    + literal(context, address) + ")";
                    SqlUtils.executeUpdate("sc_bt_normal_change", insertSql);
                    SqlUtils.commit();
                }
            }
        }
    }
}
