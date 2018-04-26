package com.archibus.service.school.dinge;

import java.math.*;
import java.util.*;

import org.json.JSONObject;

import com.archibus.app.reservation.util.DataSourceUtils;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.ExceptionBase;

public class DingeHandler extends EventHandlerBase implements RecordHandler {
    private final DataSource ds;
    
    public String type;// 用来判断是更新面积 还是金额
    
    public String year;
    
    public DingeHandler(final String year) {
        this.year = year;
        this.type = "area";
        this.ds = getMainDataSoure();
    }
    
    /**
     * 1、首先判断该单位所有在编职工都有定额级别，如果没有，请再界面填写完信息，然后再核算 2、办公用房面积、教师工作室面积：计算各单位所有职工的定额面积
     * 3、研究生工作室面积：全日制在读博士*4+全日制在读硕士*2 （全日制在读博士、全日制在读硕士需要在界面中添加） 4、
     * 
     * @param status
     */
    public void updateDingeArea(final JobStatus status) {
        status.setResult(new JobResult("Update Dinge Area"));
        status.setTotalNumber(100);
        this.type = "area";
        this.ds.queryRecords(this);
        status.setCurrentNumber(100);
    }
    
    public void updateDingeMoney(final JobStatus status) {
        status.setResult(new JobResult("Update Dinge Money"));
        status.setTotalNumber(100);
        this.type = "money";
        this.ds.queryRecords(this);
        status.setCurrentNumber(100);
    }
    
    private DataSource getMainDataSoure() {
        final Restriction restriction = Restrictions.sql("year_dinge='" + this.year + "'");
        final DataSource datasource =
                DataSourceFactory.createDataSource().addTable("sc_ts_dv_dinge").addField("dv_id")
                    .addField("count_bs").addField("count_ss").addField("count_em_jb")
                    .addField("area_zdxk").addField("formula_id").addField("area_dv")
                    .addField("area_dazl").addField("area_ta").addField("area_dinge")
                    .addField("count_month").addField("money_month").addRestriction(restriction)
                    .addSort("dv_id");
        return datasource;
    }
    
    /**
     * 更新所有院系的定额面积、用房金额
     */
    public boolean handleRecord(final DataRecord record) {
        final String dv_id = record.getValue("sc_ts_dv_dinge.dv_id").toString();
        final Object formula_id = record.getValue("sc_ts_dv_dinge.formula_id");
        String formulaId = "";
        if (formula_id == null) {
            formulaId = "";
        } else {
            formulaId = record.getValue("sc_ts_dv_dinge.formula_id").toString();
        }
        final double count_bs =
                Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_bs").toString());
        final double count_ss =
                Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_ss").toString());
        final double count_em_jb =
                Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_em_jb").toString());
        final double area_zdxk =
                Double.parseDouble(record.getValue("sc_ts_dv_dinge.area_zdxk").toString());
        final double count_month =
                Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_month").toString());
        final double money_month =
                Double.parseDouble(record.getValue("sc_ts_dv_dinge.money_month").toString());
        final double areaDazl =
                Double.parseDouble(record.getValue("sc_ts_dv_dinge.area_dazl").toString());
        final double areaTa =
                Double.parseDouble(record.getValue("sc_ts_dv_dinge.area_ta").toString());
        final double areaDingeStart =
                Double.parseDouble(record.getValue("sc_ts_dv_dinge.area_dinge").toString());
        
        final double areaDv = this.getAreaByDvId(dv_id);
        final double moneyMonth = this.getMoneyMonth();
        if (this.type.equals("area")) {
            List<Double> list = new ArrayList<Double>();
            // 正常院系用房定额核算公式
            if (formulaId.equals("AA")) {
                list = this.calculateAreaAA(dv_id, count_bs, count_ss, count_em_jb, area_zdxk);
                final double area_yjs = list.get(0);
                final double za = list.get(1);
                final double ja = list.get(2);
                final double ta = list.get(3);
                final double areaRm = list.get(4);
                final double areaDinge =
                        add(add(add(add(add(areaRm, area_yjs), za), ja), ta), area_zdxk);
                this.updateAreaForAA(dv_id, area_yjs, za, ja, ta, areaRm, areaDinge, this.year);
            } else if (formulaId.equals("AA1")) {// 机关部处单位
                final double areaRm = this.getEmAreaByDv(dv_id);
                final double areaDinge = areaDazl + areaTa + areaRm;
                this.updateAreaForAA1(dv_id, areaTa, areaRm, areaDinge, this.year);
            }
        } else if (this.type.equals("money")) {
            final double oa = DataSourceUtils.round2(sub(areaDv, areaDingeStart));
            final double moneyY = DataSourceUtils.round2(mul((mul(oa, count_month)), money_month));
            this.updateMoney(dv_id, areaDv, oa, moneyMonth, moneyY, this.year);
        }
        return true;
    }
    
    /**
     * 计算面积
     * 
     * @param dv_id
     * @param count_bs 全日制在读博士生人数
     * @param count_ss 全日制在读硕士生人数
     * @param count_em_jb 事业编制人数
     * @param area_zdxk 重点学科建设用房面积
     * @return
     */
    private List<Double> calculateAreaAA(final String dv_id, final double count_bs,
            final double count_ss, final double count_em_jb, final double area_zdxk) {
        final List<Double> list = new ArrayList<Double>();
        final double rmArea = this.getEmAreaByDv(dv_id);
        final double area_yjs = add((mul(count_bs, 4)), (mul(count_ss, 3)));
        final double za = this.getAreaByType(count_em_jb, "ZA");
        final double ja = this.getAreaByType(count_em_jb, "JA");
        final double ta = this.getAreaByType(count_em_jb, "TA");
        list.add(area_yjs);
        list.add(za);
        list.add(ja);
        list.add(ta);
        list.add(rmArea);
        return list;
    }
    
    /**
     * 办公用房面积和教师工作室面积
     * 
     * @param dvId
     * @return
     */
    private double getEmAreaByDv(final String dvId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "select count(*) as count_em,nvl(sum(area),0) as sum_area from em ,sc_dinge_jibie where em.dingejibie_id=sc_dinge_jibie.dingejibie_id and dv_id= '"
                        + dvId + "'";
        final List records = retrieveDbRecords(context, sql);
        double areaRm = 0;
        if (!records.isEmpty()) {
            for (int i = 0; i < records.size(); i++) {
                final Map record = (Map) records.get(i);
                areaRm = Double.parseDouble(record.get("sum_area").toString());
            }
        }
        return areaRm;
    }
    
    /**
     * 获取参数区间的值
     * 
     * @param count_em_jb 院系事业编制人数
     * @param area_type 分别有图书资料室面积ZA,会议接待室面积JA,调节面积TA
     * @return
     */
    private double getAreaByType(final double count_em_jb, final String area_type) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "select  lower_value,upper_value,param_value,lower_symbol,upper_symbol from sc_value_interval  where param_name= '"
                        + area_type + "'";
        final List records = retrieveDbRecords(context, sql);
        double area = 0;
        if (!records.isEmpty()) {
            for (int i = 0; i < records.size(); i++) {
                final Map record = (Map) records.get(i);
                final double lower_value = Double.parseDouble(record.get("lower_value").toString());
                final double upper_value = Double.parseDouble(record.get("upper_value").toString());
                final String lower_symbol = record.get("lower_symbol").toString();
                final String upper_symbol = record.get("upper_symbol").toString();
                if (lower_symbol.equals("<") && upper_symbol.equals(">")) {
                    if (count_em_jb < lower_value && count_em_jb > upper_value) {
                        area = Double.parseDouble(record.get("param_value").toString());
                        break;
                    }
                }
                if (lower_symbol.equals("<=") && upper_symbol.equals(">")) {
                    if (count_em_jb <= lower_value && count_em_jb > upper_value) {
                        area = Double.parseDouble(record.get("param_value").toString());
                        break;
                    }
                }
                if (lower_symbol.equals("<") && upper_symbol.equals(">=")) {
                    if (count_em_jb < lower_value && count_em_jb >= upper_value) {
                        area = Double.parseDouble(record.get("param_value").toString());
                        break;
                    }
                }
                if (lower_symbol.equals("<=") && upper_symbol.equals(">=")) {
                    if (count_em_jb <= lower_value && count_em_jb >= upper_value) {
                        area = Double.parseDouble(record.get("param_value").toString());
                        break;
                    }
                }
            }
        }
        return area;
    }
    
    /**
     * 根据单位动态获取对应的用房面积
     * 
     * @param dvId 单位编码
     * 
     * @return
     */
    private double getAreaByDvId(final String dvId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql = "select area_rm  from dv  where dv.dv_id= '" + dvId + "'";
        final List records = retrieveDbRecords(context, sql);
        double ta = 0;
        if (!records.isEmpty()) {
            final Map recordMap = (Map) records.get(0);
            ta = Double.parseDouble(recordMap.get("area_rm").toString());
        }
        return ta;
    }
    
    /**
     * 获取每平米用房资源月占用费标准
     * 
     * @return
     */
    private double getMoneyMonth() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "select param_value from afm_activity_params where  activity_id = 'AbMyExtension02' and param_id = 'DINGE_MONTH_MONEY'";
        final List records = retrieveDbRecords(context, sql);
        double moneyMonth = 0;
        if (!records.isEmpty()) {
            final Map recordMap = (Map) records.get(0);
            moneyMonth = Double.parseDouble(recordMap.get("param_value").toString());
        }
        return moneyMonth;
    }
    
    /**
     * 更新学院（系）定额面积
     * 
     * @param dv_id 单位编码
     * @param area_yjs 研究生工作面积
     * @param za 图书资料室面积
     * @param ja 会议接待室面积
     * @param ta 调节面积
     * @param rmArea 办公用房面积和教师工作室面积
     * @param areaDinge 定额面积
     * @param year 年份
     */
    public void updateAreaForAA(final String dv_id, final double area_yjs, final double za,
            final double ja, final double ta, final double rmArea, final double areaDinge,
            final String year) {
        final String sql =
                "update sc_ts_dv_dinge SET area_yjs=" + area_yjs + " , area_za=" + za + ",area_ja="
                        + ja + ",area_ta=" + ta + ",area_dinge='" + areaDinge + "'  where dv_id="
                        + "'" + dv_id + "' and year_dinge='" + year + "'";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
    }
    
    /**
     * 更新 机关部处等单位 定额面积
     * 
     * @param dv_id 单位编码
     * @param ta 调节面积
     * @param rmArea 办公用房面积
     * @param areaDinge 定额面积
     * @param year 年份
     */
    public void updateAreaForAA1(final String dv_id, final double ta, final double rmArea,
            final double areaDinge, final String year) {
        final String sql =
                "update sc_ts_dv_dinge SET area_ta=" + ta + ",area_dinge='" + areaDinge
                        + "'  where dv_id=" + "'" + dv_id + "' and year_dinge='" + year + "'";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
    }
    
    /**
     * 更新定额费用
     * 
     * @param dv_id 单位编码
     * @param areaDv 使用面积
     * @param oa 超额面积
     * @param monthMonth 超定额用房资源占用月数
     * @param moneyY 每平米用房资源月占用费标准
     * @param year 年份
     */
    public void updateMoney(final String dv_id, final double areaDv, final double oa,
            final double monthMonth, final double moneyY, final String year) {
        final String sql =
                "update sc_ts_dv_dinge SET area_dv='" + areaDv + "', area_oa='" + oa
                        + "', money_month='" + monthMonth + "', money_y='" + moneyY
                        + "'    where dv_id=" + "'" + dv_id + "' and year_dinge='" + year + "'";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
    }
    
    /**
     * 加法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double add(final double d1, final double d2) {
        final BigDecimal b1 = new BigDecimal(d1);
        final BigDecimal b2 = new BigDecimal(d2);
        return b1.add(b2).doubleValue();
    }
    
    /**
     * 减法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double sub(final double d1, final double d2) {
        final BigDecimal b1 = new BigDecimal(d1);
        final BigDecimal b2 = new BigDecimal(d2);
        return b1.subtract(b2).doubleValue();
    }
    
    /**
     * 乘法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double mul(final double d1, final double d2) {
        final BigDecimal b1 = new BigDecimal(d1);
        final BigDecimal b2 = new BigDecimal(d2);
        return b1.multiply(b2).doubleValue();
    }
    
    /**
     * 除法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public double div(final double d1, final double d2) {
        final MathContext mc = new MathContext(6, RoundingMode.HALF_DOWN);
        final BigDecimal b1 = new BigDecimal(d1);
        final BigDecimal b2 = new BigDecimal(d2);
        if (d2 == 0) {
            return 0;
        } else {
            return b1.divide(b2, mc).doubleValue();
        }
    }
    
    public void insertDingeDvByYear(final String year, final String type) {
        if (type.equals("EDIT")) {
            final String delSql = "delete from sc_ts_dv_dinge where year_dinge='" + year + "'";
            SqlUtils.executeUpdate("sc_ts_dv_dinge", delSql);
            SqlUtils.commit();
        }
        final String sql =
                "INSERT INTO sc_ts_dv_dinge(dv_id,dv_name,year_dinge) select dv_id,name,'" + year
                        + "' from dv ";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
    }
    
    public void verifyData(final String Year) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String messageFormula = this.verifyDataForEm();
        if (messageFormula != "") {
            throw new ExceptionBase();
        }
        final String mesageEm = this.verifyFormula(Year);
        if (messageFormula != "") {
            throw new ExceptionBase(String.format("变更参数表中当前的公积金批量基数调整年份失败！[message]:"));
            
        }
        
        final JSONObject json = new JSONObject();
        json.put("mFormula", messageFormula);
        json.put("mEm", mesageEm);
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    public String verifyDataForEm() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                " select count(*) as dv_count,em.dv_id,dv.name as dv_name from em,dv where em.dv_id=dv.dv_id and dingejibie_id is null group by em.dv_id,dv.name";
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
                        message = dvName + "有" + dvCount + "个教职工没有定额级别";
                    } else {
                        message = message + "、" + dvName + "有" + dvCount + "个教职工没有定额级别";
                    }
                }
            } else {
                message = length + "个单位的某些教职工没有定额级别";
            }
        }
        return message;
    }
    
    public String verifyFormula(final String year) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "select dv.name as dv_name from sc_ts_dv_dinge,dv  where sc_ts_dv_dinge.dv_id=dv.dv_id and formula_id is null and year_dinge='"
                        + year + "'";
        final List records = retrieveDbRecords(context, sql);
        String message = "";
        if (!records.isEmpty()) {
            final int length = records.size();
            if (length <= 5) {
                for (int i = 0; i < length; i++) {
                    final Map recordMap = (Map) records.get(i);
                    final String dvName = recordMap.get("dv_name").toString();
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
}
