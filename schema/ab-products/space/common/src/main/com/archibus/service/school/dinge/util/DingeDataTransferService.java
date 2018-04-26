package com.archibus.service.school.dinge.util;

import java.io.InputStream;
import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.utility.ExceptionBase;

public class DingeDataTransferService extends DataTransferBase {
    
    public void importData(final String type, final String serverFileName, final String format,
            final InputStream inputStream) {
        try {
            final ImportExportFileBase xlsBuilder =
                    getXLSBuilder(serverFileName, format, inputStream);
            
            XlsBuilder.FileFormatType.fromString(format);
            if (xlsBuilder.getLastRowIndex() < 1) {
                throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
            }
            this.status.setTotalNumber(xlsBuilder.getLastRowIndex());
            final List<String> fieldName = getFieldName(xlsBuilder);
            final List<HashMap<String, Object>> actualRecords = getRecords(xlsBuilder, fieldName);
            
            // 检查文件中是否记录
            if (xlsBuilder.getLastRowIndex() < 1) {
                throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
            }
            if (type.equals("xy")) {
                for (final HashMap<String, Object> map : actualRecords) {
                    
                    updateRecord(map);
                }
            } else if (type.equals("dzjg")) {
                for (final HashMap<String, Object> map : actualRecords) {
                    
                    updateRecordDz(map);
                }
            }
            
        } catch (final ExceptionBase e) {
            System.out.println(e.toString());
        } catch (final Exception e) {
            System.out.println(e.toString());
        }
        
    }
    
    private void updateRecord(final HashMap<String, Object> map) {
        
        final String dv_id = map.get("单位编码").toString();
        final String count_stu_bk = map.get("本科生人数").toString();
        final String count_stu_bs = map.get("博士生人数").toString();
        final String count_stu_ss = map.get("硕士生人数").toString();
        
        final String area_jba = map.get("面向其他学院的实验、实习补贴面积").toString();
        final String area_da = map.get("超大型专用实验设备用房补贴").toString();
        // final String area_dz_za = map.get("党政机关面向师生服务接待用房").toString();
        
        final String year_dinge = map.get("年度").toString();
        
        final StringBuffer sql = new StringBuffer();
        sql.append(" UPDATE sc_ts_dv_dinge SET count_stu_bk = '" + count_stu_bk + "',");
        sql.append(" count_stu_bs = '" + count_stu_bs + "',");
        sql.append(" count_stu_ss = '" + count_stu_ss + "',");
        sql.append(" area_jba = '" + area_jba + "',");
        sql.append(" area_da = '" + area_da + "'");
        // sql.append(" area_dz_za = '" + area_dz_za + "'");
        sql.append(" WHERE sc_ts_dv_dinge.dv_id = '" + dv_id + "' ");
        sql.append(" AND year_dinge = '" + year_dinge + "' ");
        try {
            SqlUtils.executeUpdate("sc_ts_dv_dinge", sql.toString());
        } catch (final Exception e) {
            this.log.info("[SQL String]：" + sql.toString());
            this.log.error("更新定额表失败！[message]:" + e.toString());
        }
        
    }
    
    private void updateRecordDz(final HashMap<String, Object> map) {
        
        final String dv_id = map.get("单位编码").toString();
        final String area_dz_za = map.get("党政机关面向师生服务接待用房").toString();
        final String year_dinge = map.get("年度").toString();
        final StringBuffer sql = new StringBuffer();
        sql.append(" UPDATE sc_ts_dv_dinge SET area_dz_za = '" + area_dz_za + "'");
        
        sql.append(" WHERE sc_ts_dv_dinge.dv_id = '" + dv_id + "' ");
        sql.append(" AND year_dinge = '" + year_dinge + "' ");
        try {
            SqlUtils.executeUpdate("sc_ts_dv_dinge", sql.toString());
        } catch (final Exception e) {
            this.log.info("[SQL String]：" + sql.toString());
            this.log.error("更新定额表失败！[message]:" + e.toString());
        }
        
    }
    
    private String checkNumToString(final Object obj) {
        final String str = obj.toString();
        final int index = str.indexOf(".");
        System.err.println(index);
        if (index != -1) {
            return str.substring(0, index);
        }
        return str;
    }
    
}
