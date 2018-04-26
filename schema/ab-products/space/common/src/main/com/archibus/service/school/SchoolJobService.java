﻿package com.archibus.service.school;

import java.io.*;
import java.util.*;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.ext.datatransfer.DataTransferUtility;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.school.dinge.*;
import com.archibus.utility.*;

public class SchoolJobService extends JobBase {
    
    protected final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * @author Huang Muliang
     * @date 2012-06-11
     * @Fixed bug WUDAHOUSE-51 Building XiaZhang add openJobProgressBar
     */
    public void BuildingOutAcc(final JSONObject record) {
        this.status.setResult(new JobResult("Building XiaZhang"));
        
        this.status.setTotalNumber(100);
        this.status.setCurrentNumber(3);
        final BuildingWholeLifeCycleManage bwlcm = new BuildingWholeLifeCycleManage();
        this.status.setCurrentNumber(7);
        final String blId = record.getString("sc_bl_xz.bl_id");
        
        // 1 将该建筑物数据拷贝到sc_bl_xz表中
        bwlcm.copyBlRecToXZ(blId);
        this.status.setCurrentNumber(30);
        
        // 2 补充保存表sc_bl_xz该建筑物有关下账的数据字段------------------------------HML
        bwlcm.saveDataToScBlXz(record);
        this.status.setCurrentNumber(50);
        
        // 3 将建筑物的房屋分类统计数据写入sc_his_rmcat_bl
        bwlcm.saveBlRmcatHisData(blId);
        this.status.setCurrentNumber(60);
        
        // 4 修改bl.acc_type的值为已下帐。
        bwlcm.setAccTypeToYxz(blId);
        this.status.setCurrentNumber(10);
        
        // 5 将文件目录中该建筑物的图纸文档保存到指定的“已下帐”目录下 -------------------HML
        bwlcm.copyDrawingFileToYiXiaZhang(record);
        this.status.setCurrentNumber(90);
        
        // 6 删除bl表中该建筑物的数据 ？是否要这样做------------------------------------HML
        /*
         * 返回后在asc-bj-usms-data-def-loc-wd.js 回调函数 dialog2_onClose: function(dialogController)
         */
        
        // 7 -更新汇总数据 ------------------------------------------------------------HML
        /*
         * 返回后在asc-bj-usms-data-def-loc-wd.js 回调函数 commonDeleteNoHint: function(dataSourceID,
         * formPanelID, primaryFieldFullName){ 更新汇总数据 updateStaticFieldAboutEmOrRm();
         */
        
        this.status.setCurrentNumber(100);
    }
    
    /**
     * @author
     * @date
     * @Fixed Calculate Area add openJobProgressBar
     */
    
    public void updateDingeAreaSpace(final String year) {
        final CalculateAreaDinge cad = new CalculateAreaDinge(year);
        final String messageEm = cad.verifyDataForEm();
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONObject json = new JSONObject();
        json.put("messageEm", messageEm);
        context.addResponseParameter("jsonExpression", json.toString());
        if (messageEm != "") {
            this.status.addPartialResult(new JobResult(messageEm));
            
            throw new ExceptionBase(String.format(messageEm));
            
        } else {
            this.status.setResult(new JobResult("Calculate Area"));
            
            this.status.setTotalNumber(100);
            this.status.setCurrentNumber(3);
            this.status.setCurrentNumber(7);
            // 三步 更新学院办公用房
            cad.updateAreaDingeBla();
            this.status.setCurrentNumber(10);
            cad.updateAreaDingeBja();
            this.status.setCurrentNumber(30);
            cad.updateAreaDingeBa();
            this.status.setCurrentNumber(40);
            // 两部 学生定额加补贴 jea jba
            cad.updateAreaDingeJea();
            this.status.setCurrentNumber(50);
            cad.updateAreaDingeJa();
            this.status.setCurrentNumber(70);
            
            // 更新表中重点实验室用房
            cad.updateAreaDingeSa();
            this.status.setCurrentNumber(80);
            
            cad.updateAreaDingeAA();
            this.status.setCurrentNumber(90);
            
            this.status.setCurrentNumber(100);
        }
        
    }
    
    public void updateDingeAreaDzgl(final String year) {
        this.status.setResult(new JobResult("Calculate Area DZGL"));
        
        this.status.setTotalNumber(100);
        this.status.setCurrentNumber(3);
        final CalculateAreaDinge cad = new CalculateAreaDinge(year);
        this.status.setCurrentNumber(7);
        // 三步 更新党政机关办公用房
        cad.updateAreaDingeDzBa();
        this.status.setCurrentNumber(60);
        cad.updateAreaDingeDz();
        this.status.setCurrentNumber(90);
        this.status.setCurrentNumber(100);
    }
    
    public void overPriceThread(final String time) {
        this.status.setResult(new JobResult("calculate over price"));
        this.status.setTotalNumber(100);
        this.status.setCurrentNumber(10);
        time.split(",");
        this.status.setCurrentNumber(30);
        final OverPrice op = new OverPrice();
        this.status.setCurrentNumber(60);
        op.calculate();
        this.status.setCurrentNumber(100);
    }
    
    public void updateRoomAreaFromManualArea() {
        this.status.setResult(new JobResult("Update Room Area from Manual Area"));
        this.status.setTotalNumber(100);
        // SqlUtils.executeUpdate("rm",
        // "UPDATE rm SET area = area_manual WHERE area = 0 OR area IS NULL");
        // final UpdateSchoolCount usp = new UpdateSchoolCount();
        // usp.updateCount();
        this.status.setCurrentNumber(30);
        new UpdateSchoolArea();
        // ss.updateByManualArea();
        this.status.setCurrentNumber(100);
    }
    
    public void updateRoomAreaByDefault() {
        this.status.setResult(new JobResult("Update Room Area from CAD Area"));
        this.status.setTotalNumber(100);
        // SqlUtils.executeUpdate("rm",
        // "UPDATE rm SET area = area_manual WHERE area = 0 OR area IS NULL");
        // final UpdateSchoolCount usp = new UpdateSchoolCount();
        // usp.updateCount();
        this.status.setCurrentNumber(40);
        final UpdateSchoolArea ss = new UpdateSchoolArea();
        ss.updateArea();
        this.status.setCurrentNumber(100);
    }
    
    /**
     * 将XlsBuilder对象转换成对应的表格
     * 
     * @param xlsBuilder
     * @param fieldName
     * @return
     */
    protected List<HashMap<String, Object>> getRecords(final ImportExportFileBase xlsBuilder,
            final List<String> fieldName) {
        this.log.info("正在获取xls数据表中数据……");
        final List<HashMap<String, Object>> records = new ArrayList<HashMap<String, Object>>();
        for (int row = 1; row <= xlsBuilder.getLastRowIndex(); row++) {
            final HashMap<String, Object> record = new HashMap<String, Object>();
            for (int col = 0; col <= xlsBuilder.getLastColumnIndex(); col++) {
                final Object data = xlsBuilder.getCellData(row, col);
                if (data == null) {
                    record.put(fieldName.get(col), "");
                    this.log.info("导入的xls数据列中存在空值[Row]：" + row + "[Col]:" + col + "[FieldName]:"
                            + fieldName.get(col));
                } else {
                    record.put(fieldName.get(col), data.toString());
                }
            }
            records.add(record);
        }
        return records;
    }
    
    /**
     * 将XlsBuilder对象转换成对应的表格
     * 
     * @param xlsBuilder
     * @param fieldName
     * @return
     */
    protected List<HashMap<String, Object>> getRecordsByField(
            final ImportExportFileBase xlsBuilder, final List<String> fieldName) {
        this.log.info("正在获取xls数据表中数据……");
        final List<HashMap<String, Object>> records = new ArrayList<HashMap<String, Object>>();
        for (int row = 3; row <= xlsBuilder.getLastRowIndex(); row++) {
            final HashMap<String, Object> record = new HashMap<String, Object>();
            for (int col = 0; col <= xlsBuilder.getLastColumnIndex(); col++) {
                final Object data = xlsBuilder.getCellData(row, col);
                if (data == null) {
                    record.put(fieldName.get(col), "");
                    this.log.info("导入的xls数据列中存在空值[Row]：" + row + "[Col]:" + col + "[FieldName]:"
                            + fieldName.get(col));
                } else {
                    record.put(fieldName.get(col), data.toString());
                }
            }
            records.add(record);
        }
        return records;
    }
    
    /**
     * 获得列名
     * 
     * @param xlsBuilder
     * @return
     */
    protected List<String> getFieldName(final ImportExportFileBase xlsBuilder) {
        this.log.info("正在获取xls数据表中列名……");
        final List<String> fieldName = new ArrayList<String>();
        for (int i = 0; i <= xlsBuilder.getLastColumnIndex(); i++) {
            final Object field = xlsBuilder.getCellData(0, i);
            if (field == null) {
                fieldName.add("");
            } else {
                fieldName.add(field.toString());
            }
        }
        return fieldName;
    }
    
    /**
     * create xls object from input stream
     * 
     * @param serverFileName
     * @param format
     * @return
     */
    protected ImportExportFileBase getXLSBuilder(final String serverFileName, final String format,
            InputStream inputStream) {
        
        if (serverFileName.compareToIgnoreCase("null") != 0
                && StringUtil.notNullOrEmpty(serverFileName)) {
            DataTransferUtility.getFileStoredPath(serverFileName, "");
            FileInputStream fileInputStream = null;
            try {
                fileInputStream = new FileInputStream(serverFileName);
            } catch (final FileNotFoundException e) {
                throw new ExceptionBase(String.format(
                    "Unable to find the file [%s] on the server.", serverFileName));
            } finally {
                inputStream = fileInputStream;
            }
        }
        
        final XlsBuilder.FileFormatType fileFormatType =
                XlsBuilder.FileFormatType.fromString(format);
        final ImportExportFileBase xlsBuilder = new ImportExportFileBase(fileFormatType);
        xlsBuilder.open(inputStream, fileFormatType);
        return xlsBuilder;
    }
    
}