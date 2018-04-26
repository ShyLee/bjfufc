package com.archibus.service.school.zfbt;

import java.io.InputStream;
import java.math.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.Context;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.school.SchoolJobService;
import com.archibus.utility.ExceptionBase;

public class BtDataTransfer extends SchoolJobService {
    protected Context context = null;
    
    protected final Logger log = Logger.getLogger(this.getClass());
    
    protected final List<String> errorData = new ArrayList<String>();
    
    /**
     * 住房补贴批量导入
     */
    public void BtDataImport(final String yearmonth, final String btYearmonth,
            final String serverFileName, final String format, final InputStream inputStream) {
        try {
            // 第一步:读取xls数据
            final ImportExportFileBase xlsBuilder =
                    getXLSBuilder(serverFileName, format, inputStream);
            XlsBuilder.FileFormatType.fromString(format);
            
            if (xlsBuilder.getLastRowIndex() < 2) {
                this.status.addPartialResult(new JobResult("导入文件表中没有数据，请检查!"));
                throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
            }
            this.status.setTotalNumber(xlsBuilder.getLastRowIndex() - 2);
            final List<String> fieldName = getFieldName(xlsBuilder);
            final List<HashMap<String, Object>> records = getRecordsByField(xlsBuilder, fieldName);
            // 第二步:处理数据
            insertDataIntoTable(records, yearmonth, btYearmonth);
        } catch (final ExceptionBase e) {
            System.out.println(e.toString());
        } catch (final Exception e) {
            System.out.println(e.toString());
        }
    }
    
    /**
     * 对数据处理 1.检查处理数据 2.写入补贴账户表 3.写入补贴变动表 4.如果是双职工,更新配偶记录中职工作为配偶的信息
     * 
     * @param records
     * @param yearMonth
     */
    private void insertDataIntoTable(final List<HashMap<String, Object>> records,
            final String yearMonth, final String btYearmonth) {
        for (final HashMap<String, Object> record : records) {
            
            this.status.incrementCurrentNumber();
            String message = "";
            final String emId = record.get("em_id").toString();
            final String dvId = record.get("dv_id").toString();
            final String emName = record.get("em_name").toString();
            final String identiCode = record.get("identi_code").toString();
            final String dateJoinWork = record.get("date_join_work").toString();
            final String zhijiName = record.get("zhiji_name").toString();
            final String areaFuliValue = record.get("area_fuli").toString();
            // 职工福利房面积
            double areaFuli = 0.0;
            if (!areaFuliValue.equals("")) {
                areaFuli = Double.parseDouble(areaFuliValue);
            }
            final String marriedValue = record.get("married").toString();
            String married = "F";
            if (marriedValue.equals("是")) {
                married = "T";
            } else {
                married = "F";
            }
            final String poName = record.get("po_name").toString();
            final String poDvId = record.get("po_dv_id").toString();
            final String poEmId = record.get("po_em_id").toString();
            final String poZhijiName = record.get("po_zhiji_name").toString();
            final String poIdentiCode = record.get("po_identi_code").toString();
            final String poFuliAreaValue = record.get("po_fuli_area").toString();
            // 职工配偶福利房面积
            double poFuliArea = 0.0;
            if (!poFuliAreaValue.equals("")) {
                poFuliArea = Double.parseDouble(poFuliAreaValue);
            }
            // final String btStartYearMonthValue = record.get("bt_start_yearmonth").toString();
            // String btStartYearMonth = "";
            // if (!btStartYearMonthValue.equals("")) {
            // if (btStartYearMonthValue.length() == 6) {
            // btStartYearMonth = btStartYearMonthValue.substring(0, 6);
            // } else {
            // message = "职工号" + emId + "补贴起始年月格式错误,请检查";
            // this.errorData.add(record.toString());
            // }
            // }
            final String btStartYearMonth = btYearmonth;
            String isWorkingP = "F";
            if (married.equals("T") && !poEmId.equals("")) {
                isWorkingP = "T";
            } else {
                isWorkingP = "F";
            }
            
            // 计算实际补贴面积、月补贴金额、是否是双职工
            // 职工职级对应面积
            double zhijiArea = 0.0;
            if (!zhijiName.equals("")) {
                zhijiArea = getZhijiArea(zhijiName);
            }
            // 职工配偶职级对应面积
            double poZhijiArea = 0.0;
            if (!poZhijiName.equals("")) {
                poZhijiArea = getZhijiArea(poZhijiName);
            }
            double actualArea = 0.0;
            if (married.equals("T")) {
                actualArea = calcEmActualBtArea(zhijiArea, poZhijiArea, areaFuli, poFuliArea);
            } else {
                actualArea = calcEmActualBtArea(zhijiArea, 0, areaFuli, 0);
            }
            final String emtype_name = "在岗职工";
            final double countMoney = countBtMoney(actualArea, emtype_name);
            if (message.equals("")) {
                if (checkEmInfoExistEm(emId)) {
                    if (!checkEmInfoExist(emId)) {
                        // 插入补贴主表
                        insertIntoBtAccount(emId, emName, identiCode, dvId, dateJoinWork,
                            zhijiName, areaFuli, married, poEmId, poName, poDvId, poZhijiName,
                            poIdentiCode, poFuliArea, actualArea, countMoney, isWorkingP,
                            yearMonth, yearMonth);
                        // 月补贴金额大于零时，插入补贴变动表
                        if (countMoney > 0) {
                            insertIntoBtChange(emId, emName, dvId, zhijiName, areaFuli, married,
                                poEmId, poName, poDvId, poZhijiName, poFuliArea, zhijiArea,
                                poZhijiArea, actualArea, countMoney, yearMonth);
                            // 如果补贴起始年月和变动年月不同，则需要补发,补发月数=变动那个年月-补贴起始年月
                            if (!btStartYearMonth.equals(yearMonth)) {
                                final int bfMonth =
                                        (Integer.parseInt(yearMonth.substring(0, 4)) - Integer
                                            .parseInt(btStartYearMonth.substring(0, 4)))
                                                * 12
                                                + (Integer.parseInt(yearMonth.substring(4)) - Integer
                                                    .parseInt(btStartYearMonth.substring(4))) + 1;
                                if (bfMonth > 0) {
                                    // 保存到补发详情表中 (sc_bt_bf_detail), married,poEmId,
                                    insertIntoBfDetail(emId, emName, identiCode, dvId, zhijiName,
                                        emtype_name, areaFuli, poName, poZhijiName, poFuliArea,
                                        zhijiArea, poZhijiArea, btStartYearMonth, yearMonth,
                                        bfMonth, countMoney);
                                    // 更新账户表(sc_bt_acc)[即补发金额又补发月数]
                                    updateBtACC(emId, bfMonth, countMoney);
                                    // 保存到住房补贴月发放明细表 (sc_bt_allot_month_detail)
                                    insertIntoBfDetailMonth(emId, emName, identiCode, dvId,
                                        zhijiName, zhijiArea, emtype_name, poName, poZhijiName,
                                        poZhijiArea, actualArea, yearMonth, bfMonth, countMoney,
                                        areaFuli, poFuliArea);
                                }
                            }
                            
                        }
                        // 更新配偶记录中的本人作为配偶的信息
                        if (isWorkingP.equals("T")) {
                            if (checkPoInfoExist(poEmId)) {
                                updatePoInfo_acc_info(emId, emName, identiCode, dvId, zhijiName,
                                    areaFuli, poEmId);
                            } else {
                                message += "职工号" + emId + "的配偶工号" + poEmId + "在账户表中不存在,请检查！";
                            }
                        }
                    } else {
                        message += "职工号" + emId + "在补贴账户表中已经存在,请检查！";
                        this.errorData.add(record.toString());
                    }
                } else {
                    message += "职工号" + emId + "在职工表中不存在,请检查！";
                    this.errorData.add(record.toString());
                }
            }
            this.status.addPartialResult(new JobResult(message));
        }
        final long allRows = this.status.getCurrentNumber();
        final int missedRows = this.errorData.size();
        final int finished = (int) allRows - missedRows;
        this.status.setMessage("共导入" + allRows + "条数据,成功导入" + finished + "条,出错" + missedRows + "条");
    }
    
    private String checkData(final String emId, final String btStartYearMonthValue) {
        String message = "";
        if (btStartYearMonthValue.length() == 6) {
            message = "职工号" + emId + "补贴起始年月格式错误,请检查";
        }
        return message;
    }
    
    private void insertIntoBtAccount(final String emId, final String emName,
            final String identiCode, final String dvId, final String dateJoinWork,
            final String zhijiName, final double areaFuli, final String married,
            final String poEmId, final String poName, final String poDvId,
            final String poZhijiName, final String poIdentiCode, final double poFuliArea,
            final double actualArea, final double countMoney, final String isWorkingP,
            final String btStartYearMonth, final String yearMonth) {
        String changeType = "9";
        if (countMoney > 0) {
            changeType = "1";
        }
        final String insertSql =
                "insert into sc_bt_acc(status,em_id,em_name,dv_id,identi_code,date_join_work,zhiji_name,area_fuli,married,po_name,po_dv_id,po_em_id,po_zhiji_name,po_identi_code,po_fuli_area,bt_start_yearmonth,actual_bt_area,bt_money_month,is_working_parents,emtype_name) values("
                        + "'"
                        + changeType
                        + "','"
                        + emId
                        + "','"
                        + emName
                        + "','"
                        + dvId
                        + "','"
                        + identiCode
                        + "',to_date('"
                        + dateJoinWork
                        + "','YYYY-MM-dd'),'"
                        + zhijiName
                        + "',"
                        + areaFuli
                        + ",'"
                        + married
                        + "','"
                        + poName
                        + "','"
                        + poDvId
                        + "','"
                        + poEmId
                        + "','"
                        + poZhijiName
                        + "','"
                        + poIdentiCode
                        + "',"
                        + poFuliArea
                        + ",'"
                        + btStartYearMonth
                        + "',"
                        + actualArea
                        + ","
                        + countMoney + ",'" + isWorkingP + "','在岗职工')";
        SqlUtils.executeUpdate("sc_bt_acc", insertSql);
        SqlUtils.commit();
    }
    
    private void insertIntoBtChange(final String emId, final String emName, final String dvId,
            final String zhijiName, final double areaFuli, final String married,
            final String poEmId, final String poName, final String poDvId,
            final String poZhijiName, final double poFuliArea, final double zhijiArea,
            final double poZhijiArea, final double actualArea, final double countMoney,
            final String yearMonth) {
        final String insertSql =
                "insert into sc_bt_normal_change(change_month,change_type,em_id,em_name,fuli_area2,em_zhiji_name2,zhiji_area_std2,actual_bt_area2,month_bt_money2,po_em_id,po_name,po_zhiji_name2,po_zhiji_area_std2,po_fuli_area2) values("
                        + yearMonth
                        + ",'NEW','"
                        + emId
                        + "','"
                        + emName
                        + "','"
                        + areaFuli
                        + "','"
                        + zhijiName
                        + "','"
                        + zhijiArea
                        + "','"
                        + actualArea
                        + "','"
                        + countMoney
                        + "','"
                        + poEmId
                        + "','"
                        + poName
                        + "','"
                        + poZhijiName
                        + "','"
                        + poZhijiArea + "','" + poFuliArea + "')";
        SqlUtils.executeUpdate("sc_bt_normal_change", insertSql);
        SqlUtils.commit();
    }
    
    private void updatePoInfo_acc_info(final String emId, final String emName,

    final String identiCode, final String dvId, final String zhijiName, final double areaFuli,
            final String poEmId) {
        final String sql =
                "update sc_bt_acc set po_name='" + emName + "',po_dv_id='" + dvId + "',po_em_id='"
                        + emId + "',po_zhiji_name='" + zhijiName + "',po_identi_code='"
                        + identiCode + "',po_fuli_area='" + areaFuli + "' where em_id='" + poEmId
                        + "'";
        SqlUtils.executeUpdate("sc_bt_acc", sql);
        SqlUtils.commit();
    }
    
    /**
     * 保存到补发详情表中 (sc_bt_bf_detail)
     * 
     * */
    private void insertIntoBfDetail(final String emId, final String emName,
            final String identiCode, final String dvId, final String zhijiName,
            final String emtype_name, final Double areaFuli, final String poName,
            final String poZhijiName, final Double poFuliArea, final double zhijiArea,
            final double poZhijiArea, final String btStartYearMonth, final String yearMonth,
            final int bfMonth, final double countMoney) {
        // 计算本次补发金额
        final double allot_money = countMoney * bfMonth;
        // 返回补贴标准
        final double emtypeStd = getBtEmtypeStd(emtype_name);
        // 合计福利房面积
        final double hjFuliArea = areaFuli + poFuliArea;
        
        final String sql =
                "insert into sc_bt_bf_detail(em_id,em_name,identi_code,dv_id,zhiji_name,zhiji_area,emtype_name,emtype_std,po_name,po_zhiji_name,"
                        + "hj_fuli_area,yearmonth_start,yearmonth_end,date_bf,count_month,allot_money,yearmonth,cause_bf,notes,pre_count_month,alloted_count_month,pre_total_allot_money,total_allot_money) values('"
                        + emId
                        + "','"
                        + emName
                        + "','"
                        + identiCode
                        + "','"
                        + dvId
                        + "','"
                        + zhijiName
                        + "','"
                        + zhijiArea
                        + "','"
                        + emtype_name
                        + "','"
                        + emtypeStd
                        + "','"
                        + poName
                        + "','"
                        + poZhijiName
                        + "','"
                        + hjFuliArea
                        + "','"
                        + btStartYearMonth
                        + "','"
                        + yearMonth
                        + "',"
                        + "sysdate"
                        + ",'"
                        + bfMonth
                        + "','"
                        + allot_money
                        + "','"
                        + yearMonth
                        + "','"
                        + "批量导入所引起的补发"
                        + "','"
                        + "批量导入所引起的补发"
                        + "','"
                        + 0
                        + "','"
                        + bfMonth
                        + "','"
                        + 0
                        + "','"
                        + allot_money + "') ";
        SqlUtils.executeUpdate("sc_bt_bf_detail", sql);
        SqlUtils.commit();
        
    }
    
    /**
     * 更新状态为正常的账户表余额 (sc_bt_acc)
     * 
     * */
    private void updateBtACC(final String emId, final int bfMonth, final double countMoney) {
        final double alloted_money = countMoney * bfMonth;
        final String sql =
                "update sc_bt_acc set alloted_count_month='" + bfMonth + "', alloted_money='"
                        + alloted_money + "' where em_id='" + emId + "' and status='1'";
        
        SqlUtils.executeUpdate("sc_bt_bf_detail", sql);
        SqlUtils.commit();
    }
    
    /**
     * 
     * 保存到住房补贴月发放明细表 (sc_bt_allot_month_detail)
     * */
    private void insertIntoBfDetailMonth(final String emId, final String emName,
            final String identiCode, final String dvId, final String zhijiName,
            final double zhijiArea, final String emtype_name, final String poName,
            final String poZhijiName, final double poZhijiArea, final double actualArea,
            final String yearMonth, final int bfMonth, final double countMoney,
            final double areaFuli, final double poFuliArea) {
        // 计算本次补发金额
        final double allot_money = countMoney * bfMonth;
        // 返回补贴标准
        final double emtypeStd = getBtEmtypeStd(emtype_name);
        // 合计福利房面积
        final double hjFuliArea = areaFuli + poFuliArea;
        // 计算分摊面积
        final double fenTanArea = hjFuliArea * zhijiArea / (poZhijiArea + zhijiArea);
        
        final String sql =
                "insert into sc_bt_allot_month_detail(em_id,em_name,identi_code,dv_id,zhiji_name,zhiji_area,emtype_name,emtype_std,po_name,po_zhiji_name,"
                        + "actual_bt_area,hj_fuli_area,allot_money,yearmonth,notes,alloted_count_month,pre_total_allot_money,total_allot_money,bd_flag,fentan_area,date_allot) values('"
                        + emId
                        + "','"
                        + emName
                        + "','"
                        + identiCode
                        + "','"
                        + dvId
                        + "','"
                        + zhijiName
                        + "','"
                        + zhijiArea
                        + "','"
                        + emtype_name
                        + "','"
                        + emtypeStd
                        + "','"
                        + poName
                        + "','"
                        + poZhijiName
                        + "','"
                        + actualArea
                        + "','"
                        + hjFuliArea
                        + "','"
                        + allot_money
                        + "','"
                        + yearMonth
                        + "','"
                        + "批量导入所引起的补发"
                        + "','"
                        + bfMonth
                        + "','"
                        + 0
                        + "','"
                        + allot_money
                        + "','"
                        + "T" + "','" + fenTanArea + "'," + "sysdate" + " ) ";
        SqlUtils.executeUpdate("sc_bt_allot_month_detail", sql);
        SqlUtils.commit();
    }
    
    /**
     * 检查补贴账户表中是否存在配偶记录
     * 
     * @param poEmId
     * @return
     */
    private boolean checkPoInfoExist(final String poEmId) {
        final String sql = "select em_id from sc_bt_acc  where em_id='" + poEmId + "'";
        final String[] flds = { "em_id" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_bt_acc", flds, sql);
        if (records.size() != 0) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * 检查职工表中是否存在该职工号
     * 
     * @param emId
     * @return
     */
    private boolean checkEmInfoExistEm(final String emId) {
        final String sql = "select em_id from em  where em_id='" + emId + "'";
        final String[] flds = { "em_id" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_bt_acc", flds, sql);
        if (records.size() != 0) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * 检查补贴账户表中是否存在职工记录
     * 
     * @param emId
     * @return
     */
    private boolean checkEmInfoExist(final String emId) {
        final String sql = "select em_id from sc_bt_acc  where em_id='" + emId + "'";
        final String[] flds = { "em_id" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_bt_acc", flds, sql);
        if (records.size() != 0) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * 获取职级标准面积
     * 
     * @param zhijiName
     * @return
     */
    public double getZhijiArea(final String zhijiName) {
        double zhijiArea = 0;
        final String sql =
                "select zhiji_area from sc_bt_zhiji where zhiji_name='" + zhijiName + "'";
        final String[] flds = { "zhiji_area" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_bt_zhiji", flds, sql);
        for (final DataRecord record : records) {
            zhijiArea = Double.parseDouble(record.getValue("sc_bt_zhiji.zhiji_area").toString());
        }
        return zhijiArea;
    }
    
    /**
     * 获取类别标准
     * 
     * @param emtype_name
     * @return
     */
    public double getBtEmtypeStd(final String emtype_name) {
        double zhijiArea = 0;
        final String sql =
                "select emtype_std from sc_bt_emtype where emtype_name='" + emtype_name + "'";
        final String[] flds = { "emtype_std" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_bt_emtype", flds, sql);
        for (final DataRecord record : records) {
            zhijiArea = Double.parseDouble(record.getValue("sc_bt_emtype.emtype_std").toString());
        }
        return zhijiArea;
    }
    
    /**
     * 计算实际补贴面积
     * 
     * @param zhijiArea
     * @param poZhijiArea
     * @param areaFuli
     * @param poFuliArea
     * @return
     */
    private double calcEmActualBtArea(final double zhijiArea, final double poZhijiArea,
            final double areaFuli, final double poFuliArea) {
        double actualBtArea = 0.000;
        actualBtArea =
                sub(zhijiArea, mul(add(areaFuli, poFuliArea), div(zhijiArea, add(zhijiArea,
                    poZhijiArea))));
        return actualBtArea;
    }
    
    /**
     * 计算月补贴金额
     * 
     * @param actualArea
     * @param emtype_name
     * @return
     */
    private double countBtMoney(final double actualArea, final String emtype_name) {
        double countMoney = 0.00;
        final double moneyPerArea = getBtEmtypeStd(emtype_name);
        countMoney = mul(actualArea, moneyPerArea);
        return countMoney;
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
    
    /**
     * 检验当前更新的年月是否晚于数据库基数调整表中变更表最后更新时间
     * 
     * @param yearmonth
     */
    
    private void printErrorRow() {
        this.log.info("正在检验错误……");
        final StringBuffer errorlog = new StringBuffer();
        final long allRows = this.status.getCurrentNumber();
        final int missedRows = this.errorData.size();
        final int finished = (int) allRows - missedRows;
        errorlog.append("导入的记录数:" + allRows);
        errorlog.append(" 共更新记录：" + finished);
        if (missedRows > 0) {
            for (final String row : this.errorData) {
                errorlog.append(" 错误行：" + row);
            }
        }
        this.log.error("errorlog:" + errorlog.toString());
        
    }
}
