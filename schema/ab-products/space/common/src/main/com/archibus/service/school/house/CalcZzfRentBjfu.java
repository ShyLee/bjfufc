package com.archibus.service.school.house;

import java.text.DecimalFormat;
import java.util.List;

import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;

public class CalcZzfRentBjfu {
    
    private static ZZFEmFlBjfu zzfEmFl = new ZZFEmFlBjfu();
    
    /***
     * 传入日期，生成当月的缴费项目
     *
     * 针对自缴的缴费向信息[ 主要考虑缴费周期的不同 ]
     *
     * @throws Exception
     *
     * */
    public String createFeesForHouse(final String year, final String month) throws Exception {
        
        // 1.判断当前[以当月为起始日期的]是否有已实际缴费的缴费项目信息，若有不能重新生成,可重复利用财务代扣的代码
        final List<DataRecord> feeRecords = queryHouseFee(year, month);
        if (!feeRecords.isEmpty()) {
            return "yjf";// 返回 已缴费
        }
        // 2.删除当月【以当月为起始日期】的缴费项目记录
        doDeleteHouseFee(year, month);
        
        // 3.查询出需要计算租金的合同信息【与财务代扣不一样】
        final List<DataRecord> protocolRecords = queryHouseProtocol(year, month);
        for (int i = 0; i < protocolRecords.size(); i++) {
            final DataRecord protocol = protocolRecords.get(i);
            
            final String card_id = protocol.getValue("sc_zzfcard.card_id").toString();
            final String identi_code = protocol.getValue("sc_zzfcard.identi_code").toString();
            final String date_first_pay = protocol.getValue("sc_zzfcard.date_first_pay").toString();
            final String date_payrent_last =
                    protocol.getValue("sc_zzfcard.date_payrent_last").toString();
            final String rent_period = protocol.getValue("sc_zzfcard.rent_period").toString();
            // String payment_to = protocol.getValue("sc_zzfcard.payment_to").toString();
            final String rent_std = protocol.getValue("sc_zzfcard.rent_std").toString();
            final String area_lease = protocol.getValue("sc_zzfcard.area_lease").toString();
            final double area = Double.valueOf(area_lease);
            final String card_type = protocol.getValue("sc_zzfcard.card_type").toString();// 可能有校外人员
            
            paymentHandleHouse(year, month, identi_code, date_first_pay, date_payrent_last,
                rent_period, rent_std, card_id, area, card_type);
        }
        return "ysc";// 返回生成成功
        
    }
    
    /**
     * 员工缴费项目计算【林业大学】 自缴
     *
     * a. 校内员工 五年内的住户每年租金自动上调上一年租金的10%，五年后每年租金上调上一年租金的50%。 外来人员 一年上调上一年租金的50%。 b.
     * 租金计算：足月按月,非足月按天[这里先简单按足缴费周期,足缴费周期按月，非足缴费周期按天]
     *
     *
     * 财务处代扣,只产生当月租金
     * */
    public void paymentHandleHouse(final String year, final String month, final String identity,
            final String dateBegin, final String dateEnd, final String period,
            final String rent_std, final String cardId, final double area, final String cardType)
            throws Exception {
        final int flag = ChylinDateUtils.getRentMonthsByPeriod(period);// 缴费周期
        
        // 财务代扣只能按月缴费
        final String firstDay = year + "-" + month + "-01";
        final String lastday = ChylinDateUtils.getNMonthLaterLastDay(firstDay, flag);// 缴费周期的最后一天
        
        final String a[] = rent_std.split("\\(");
        double price = Double.valueOf(a[0]);// 租金单价
        double totalPrice = 0.00;
        
        String pay_begin = firstDay;
        String pay_end = lastday;
        if (!ChylinDateUtils.dateCompare(dateBegin, firstDay)) {// 合同的第一条缴费项目
            pay_begin = dateBegin;
        }
        if (ChylinDateUtils.dateCompare(dateEnd, lastday)) {// 合同的最后一条缴费项目
            pay_end = dateEnd;
        }
        int yrzmonths = 0;
        if (a[1].equals("元/套)")) {// 按套收费
            yrzmonths = zzfEmFl.getYRZMonth2(identity);
        } else {// 元/㎡
            yrzmonths = zzfEmFl.getYRZMonth(identity);
        }
        
        /*if (cardType.equals("0")) {// 教职工
            if (yrzmonths % 12 == 0 && yrzmonths != 0) {// 直接涨价
                if ((yrzmonths + 1) < 60) {
                    price = price * 1.1;
                } else {
                    price = price * 1.5;
                }
            }
        } else if (cardType.equals("1")) {// 校外人员
            if (yrzmonths % 12 == 0 && yrzmonths != 0) {// 直接涨价
                if ((yrzmonths + 1) < 60) {
                    price = price * 1.1;
                } else {
                    price = price * 1.5;
                }
            }
        }*/
        
        if (pay_begin != firstDay || pay_end != lastday) {// 按天计费
            final long days1 = ChylinDateUtils.getDays(pay_begin, pay_end);
            final long days2 = ChylinDateUtils.getDays(firstDay, lastday);
            totalPrice = price * days1 / days2 * flag;
        } else {
            totalPrice = price * flag;
        }
        
        String priceStr = "";
        if (a[1].equals("元/套)")) {// 按套收费
            priceStr = Double.toString(price) + "(元/套)";
            yrzmonths = yrzmonths + flag;
            zzfEmFl.updateYRZMonth2(identity, yrzmonths);
        } else {// 元/㎡
            priceStr = Double.toString(price) + "(元/㎡)";
            totalPrice = totalPrice * area;// 乘上面积
            yrzmonths = yrzmonths + flag;
            zzfEmFl.updateYRZMonth(identity, yrzmonths);
        }
        
        final DecimalFormat df = new DecimalFormat("######0.00");
        totalPrice = Double.valueOf(df.format(totalPrice));
        
        totalPrice = Math.round(totalPrice);
        
        saveEmployeeFeeRecord(pay_begin, pay_end, totalPrice, cardId, price, priceStr);
        
    }
    
    /***
     * 查询需要计算租金的合同信息【自缴的费用信息】
     *
     * 1.自缴 2.该合同下不存在缴费截至日期等于合同的缴费截至日期【针对退租情况下的合同，也能生成当前缴费周期的缴费项目】,也就是租金没交清的合同都是有效合同 3.该合同下 不存在
     * 缴费截至日期大于上一月末日期的缴费项目
     *
     * date_payrent_last
     *
     * @throws Exception
     *
     * */
    private List<DataRecord> queryHouseProtocol(final String year, final String month)
            throws Exception {
        final String dateStr = year + "-" + month + "-01";
        final String lastday = ChylinDateUtils.getNMonthLaterLastDay(dateStr, 0);// 上一月的最后一天
        
        final String sql =
                "select card_id,card_type,identi_code,date_first_pay,date_payrent_last,rent_period,payment_to,rent_std,area_lease from sc_zzfcard where payment_to = 'house'"
                        + " and card_id not in (select card_id from sc_zzf_fee where date_pay_end = sc_zzfcard.date_payrent_last)"
                        + " and card_id not in (select card_id from sc_zzf_fee where date_pay_end > to_date('"
                        + lastday + "','yyyy-mm-dd') )";// 排除按季度、年度已交过的
        final String[] flds =
                new String[] { "card_id", "card_type", "identi_code", "date_first_pay",
                        "date_payrent_last", "rent_period", "payment_to", "rent_std", "area_lease" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_zzfcard", flds, sql);
        return records;
    }
    
    /**
     * 删除 当月自缴 生成的记录
     * */
    private void doDeleteHouseFee(final String year, final String month) {
        final String sql =
                "delete from sc_zzf_fee where card_id in (select card_id from sc_zzfcard where payment_to = 'house') "
                        + " and TO_CHAR (sc_zzf_fee.date_pay_begin, 'yyyy') = '"
                        + year
                        + "' "
                        + " and TO_CHAR (sc_zzf_fee.date_pay_begin, 'mm') = '" + month + "' ";
        
        SqlUtils.executeUpdate("sc_zzf_fee", sql.toString());
    }
    
    /**
     * 查询 当月自缴过的记录
     * */
    private List<DataRecord> queryHouseFee(final String year, final String month) {
        final String sql =
                "select fee_id,card_id,pay_ought,pay_actual,date_pay_begin,date_pay_end from sc_zzf_fee where card_id in (select card_id from sc_zzfcard where payment_to = 'house') and pay_actual > 0 "
                        + " and TO_CHAR (sc_zzf_fee.date_pay_begin, 'yyyy') = '"
                        + year
                        + "' "
                        + " and TO_CHAR (sc_zzf_fee.date_pay_begin, 'mm') = '" + month + "' ";
        final String[] flds =
                new String[] { "fee_id", "card_id", "pay_ought", "pay_actual", "date_pay_begin",
                        "date_pay_end" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_zzf_fee", flds, sql);
        return records;
    }
    
    /***
     * 传入日期，生成当月的缴费项目
     *
     * 只针对财务处代扣的记录
     *
     * @throws Exception
     *
     * */
    public String createFeesByMonthFinance(final String year, final String month) throws Exception {
        
        // 1.判断当月财务代扣是否已核定。若核定，不能重新生成
        final List<DataRecord> feeRecords = queryFinanceFee(year, month);
        if (!feeRecords.isEmpty()) {
            return "yhd";// 返回 已核对
        }
        // 2.判断当月财务代扣是否有记录，若有，删除记录
        doDeleteFinanceFee(year, month);
        // 3.查询出需要计算租金的合同信息。
        final List<DataRecord> protocolRecords = queryFinanceProtocol(year, month);
        for (int i = 0; i < protocolRecords.size(); i++) {
            final DataRecord protocol = protocolRecords.get(i);
            
            final String card_id = protocol.getValue("sc_zzfcard.card_id").toString();
            final String identi_code = protocol.getValue("sc_zzfcard.identi_code").toString();
            final String date_first_pay = protocol.getValue("sc_zzfcard.date_first_pay").toString();
            final String date_payrent_last =
                    protocol.getValue("sc_zzfcard.date_payrent_last").toString();
            final String rent_period = protocol.getValue("sc_zzfcard.rent_period").toString();
            // String payment_to = protocol.getValue("sc_zzfcard.payment_to").toString();
            final String rent_std = protocol.getValue("sc_zzfcard.rent_std").toString();
            final String area_lease = protocol.getValue("sc_zzfcard.area_lease").toString();
            final double area = Double.valueOf(area_lease);
            
            employeePaymentHandleFinance(year, month, identi_code, date_first_pay,
                date_payrent_last, rent_period, rent_std, card_id, area);
        }
        return "ysc";// 返回生成成功
    }
    
    /**
     * 查询需要计算租金的合同信息【财务代扣的费用信息】
     *
     * 1.财务代扣 2.该合同下不存在缴费截至日期等于合同的缴费截至日期【针对退租情况下的合同，也能生成当前缴费周期的缴费项目】,也就是租金没交清的合同都是有效合同 3.该合同下 不存在
     * 缴费截至日期大于上一月末日期的缴费项目[其实财务代扣不存在这种情况，因为他都是按月交的]
     *
     * @throws Exception
     *
     * */
    public List<DataRecord> queryFinanceProtocol(final String year, final String month)
            throws Exception {
        final String dateStr = year + "-" + month + "-01";
        final String lastday = ChylinDateUtils.getNMonthLaterLastDay(dateStr, 0);// 上一月的最后一天
        
        final String sql =
                "select card_id,identi_code,date_first_pay,date_payrent_last,rent_period,payment_to,rent_std,area_lease from sc_zzfcard where payment_to = 'finance'"
                        + " and card_id not in (select card_id from sc_zzf_fee where date_pay_end = sc_zzfcard.date_payrent_last)"
                        + " and card_id not in (select card_id from sc_zzf_fee where date_pay_end > to_date('"
                        + lastday + "','yyyy-mm-dd') )";// 排除按季度、年度已交过的
        final String[] flds =
                new String[] { "card_id", "identi_code", "date_first_pay", "date_payrent_last",
                        "rent_period", "payment_to", "rent_std", "area_lease" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_zzfcard", flds, sql);
        return records;
    }
    
    public void doDeleteFinanceFee(final String year, final String month) {
        final String sql =
                "delete from sc_zzf_fee where card_id in (select card_id from sc_zzfcard where payment_to = 'finance') "
                        + " and TO_CHAR (sc_zzf_fee.date_pay_begin, 'yyyy') = '"
                        + year
                        + "' "
                        + " and TO_CHAR (sc_zzf_fee.date_pay_begin, 'mm') = '" + month + "' ";
        
        SqlUtils.executeUpdate("sc_zzf_fee", sql.toString());
    }
    
    /**
     * 查询 当月财务处代扣 核对过的记录
     * */
    public List<DataRecord> queryFinanceFee(final String year, final String month) {
        final String sql =
                "select fee_id,card_id,pay_ought,pay_actual,date_pay_begin,date_pay_end from sc_zzf_fee where card_id in (select card_id from sc_zzfcard where payment_to = 'finance') and pay_actual > 0 "
                        + " and TO_CHAR (sc_zzf_fee.date_pay_begin, 'yyyy') = '"
                        + year
                        + "' "
                        + " and TO_CHAR (sc_zzf_fee.date_pay_begin, 'mm') = '" + month + "' ";
        final String[] flds =
                new String[] { "fee_id", "card_id", "pay_ought", "pay_actual", "date_pay_begin",
                        "date_pay_end" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_zzf_fee", flds, sql);
        return records;
    }
    
    /**
     * 员工缴费项目计算【林业大学】
     *
     * a. 校内员工 五年内的住户每年租金自动上调上一年租金的10%，五年后每年租金上调上一年租金的50%。 外来人员 一年上调上一年租金的50%。 b. 租金计算：足月按月,非足月按天
     *
     *
     * 财务处代扣,只产生当月租金
     * */
    public void employeePaymentHandleFinance(final String year, final String month,
            final String identity, final String dateBegin, final String dateEnd,
            final String period, final String rent_std, final String cardId, final double area)
            throws Exception {
        // 财务代扣只能按月缴费
        final String firstDay = year + "-" + month + "-01";
        final String lastday = ChylinDateUtils.getNMonthLaterLastDay(firstDay, 1);// 当月的最后一天
        
        final String a[] = rent_std.split("\\(");
        double price = Double.valueOf(a[0]);// 租金单价
        double totalPrice = 0.00;
        
        String pay_begin = firstDay;
        String pay_end = lastday;
        if (!ChylinDateUtils.dateCompare(dateBegin, firstDay)) {// 合同的第一条缴费项目
            pay_begin = dateBegin;
        }
        if (ChylinDateUtils.dateCompare(dateEnd, lastday)) {// 合同的最后一条缴费项目
            pay_end = dateEnd;
        }
        int yrzmonths = 0;
        if (a[1].equals("元/套)")) {// 按套收费
            yrzmonths = zzfEmFl.getYRZMonth2(identity);
        } else {// 元/㎡
            yrzmonths = zzfEmFl.getYRZMonth(identity);
        }
        
        /*if (yrzmonths % 12 == 0 && yrzmonths != 0) {// 直接涨价
            if ((yrzmonths + 1) < 60) {
                price = price * 1.1;
            } else {
                price = price * 1.5;
            }
        }*/
        if (pay_begin != firstDay || pay_end != lastday) {// 按天计费
            final long days1 = ChylinDateUtils.getDays(pay_begin, pay_end);
            final long days2 = ChylinDateUtils.getDays(firstDay, lastday);
            totalPrice = price * days1 / days2;
        } else {
            totalPrice = price;
        }
        
        String priceStr = "";
        if (a[1].equals("元/套)")) {// 按套收费
            priceStr = Double.toString(price) + "(元/套)";
            yrzmonths = yrzmonths + 1;
            zzfEmFl.updateYRZMonth2(identity, yrzmonths);
        } else {// 元/㎡
            priceStr = Double.toString(price) + "(元/㎡)";
            totalPrice = totalPrice * area;// 乘上面积
            yrzmonths = yrzmonths + 1;
            zzfEmFl.updateYRZMonth(identity, yrzmonths);
        }
        
        final DecimalFormat df = new DecimalFormat("######0.00");
        totalPrice = Double.valueOf(df.format(totalPrice));
        
        totalPrice = Math.round(totalPrice);
        
        saveEmployeeFeeRecord(pay_begin, pay_end, totalPrice, cardId, price, priceStr);
        
    }
    
    /**
     * a.保存教职工缴费信息
     *
     * b.同步当前租金单价
     */
    public static void saveEmployeeFeeRecord(final String dateBegin, final String dateEnd,
            final double totalPrice, final String cardId, final double price, final String priceStr) {
        final StringBuffer sql = new StringBuffer();
        sql.append("INSERT INTO sc_zzf_fee (card_id,em_id,em_id_z,em_name,identi_code,is_em, is_rc, bl_id, fl_id, rm_id,");
        sql.append(" rm_type, date_checkin, date_checkout,price,area_lease,rent_period,date_pay_begin,date_pay_end,rm_rent_fee,pay_ought,gzbm,address)");
        sql.append(" SELECT sc_zzfcard.card_id,sc_zzfcard.em_id,sc_zzfcard.em_id_z,sc_zzfcard.em_name,sc_zzfcard.identi_code,sc_zzfcard.is_em,sc_zzfcard.is_rc,");
        sql.append(" sc_zzfcard.bl_id,sc_zzfcard.fl_id,sc_zzfcard.rm_id,sc_zzfcard.rm_type,sc_zzfcard.date_checkin,sc_zzfcard.date_checkout_ought,");
        sql.append(" " + price + ",sc_zzfcard.area_lease,");
        sql.append(" sc_zzfcard.rent_period,to_date('"
                + dateBegin
                + "','yyyy-mm-dd'),to_date('"
                + dateEnd
                + "','yyyy-mm-dd'),"
                + totalPrice
                + ","
                + totalPrice
                + ",gzbm,(select address from rm where rm.rm_id=sc_zzfcard.rm_id and rm.fl_id=sc_zzfcard.fl_id and rm.bl_id=sc_zzfcard.bl_id) as address");
        sql.append(" FROM sc_zzfcard WHERE sc_zzfcard.card_id = '" + cardId + "'");
        SqlUtils.executeUpdate("sc_zzf_fee", sql.toString());
        
        final StringBuffer sql2 = new StringBuffer();
        sql2.append("update sc_zzfcard set rent_std = '" + priceStr + "'");
        sql2.append(" WHERE sc_zzfcard.card_id = '" + cardId + "'");
        SqlUtils.executeUpdate("sc_zzfcard", sql2.toString());
    }
  
}






