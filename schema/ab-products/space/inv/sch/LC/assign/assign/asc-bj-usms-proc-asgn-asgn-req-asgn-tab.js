var ascBjUsmsProcAsgnAsgnReqAsgnTabController = View.createController("ascBjUsmsProcAsgnAsgnReqAsgnTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
    
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
    },
    
    ascBjUsmsProcAsgnAsgnReqAsgnTabGrid_onOK: function(){
        var grid = this.ascBjUsmsProcAsgnAsgnReqAsgnTabGrid;
        //var records = grid.getPrimaryKeysForSelectedRows();
        var row = grid.gridRows.items[grid.selectedRowIndex];
        var record = row.getRecord();
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        var activityLogRecord = this.tabs.activityLogRecord;
        
        var rmUser = activityLogRecord.getValue('activity_log.rm_user');
        var dvId = activityLogRecord.getValue('activity_log.dv_id');
        var rmcat = activityLogRecord.getValue('activity_log.rm_cat');
        var rmtype = activityLogRecord.getValue('activity_log.rm_type');
        var logId = activityLogRecord.getValue('activity_log.activity_log_id');
		var rmNameAfter = activityLogRecord.getValue('activity_log.rm_name_after');
        
        try {
            if (rmUser) {
                var emRestriction = new Ab.view.Restriction();
                emRestriction.addClause('em.em_id', rmUser, '=');
                var emRecords = this.ascBjUsmsProcAsgnAsgnReqAsgnTabEmDS.getRecords(emRestriction);
                if (emRecords.length > 0) {
                    
                    // update  "EM"
                    var emRecord = emRecords[0];
                    emRecord.isNew = false;
                    emRecord.setValue("em.bl_id", blId);
                    emRecord.setValue("em.fl_id", flId);
                    emRecord.setValue("em.rm_id", rmId);
                    emRecord.setValue("em.dv_id", dvId);
                    this.ascBjUsmsProcAsgnAsgnReqAsgnTabEmDS.saveRecord(emRecord);
                    
                    // update  "RM"
                    record.setValue('rm.count_em', parseInt(record.getValue('rm.count_em')) + 1);
                    record.setValue('rm.rm_cat', rmcat);
                    record.setValue('rm.rm_type', rmtype);
                    record.setValue('rm.dv_id', dvId);
					record.setValue('rm.name', rmNameAfter);
                    this.ascBjUsmsProcAsgnAsgnReqAsgnTabRmDS.saveRecord(record);
                    
					var rmUserName = emRecord.getValue("em.name");
                    // complete request
                    alert(rmUserName + "已经成功分配到：" + blId + "/" + flId + "/" + rmId);
                    this.completeRequest(logId);
                    
                    // write log
                    this.writeLog(logId, blId, flId, rmId, rmUserName);
                    
                    // sum data
                    updateStaticFieldAboutEmOrRm();
                    
                    // change tab
                    var selectTab = this.tabs.findTab('selectTab');
                    selectTab.loadView();
                    this.tabs.selectTab('selectTab');
                }
            }
            else {
                // update "RM"
                record.setValue('rm.dv_id', dvId);
                record.setValue('rm.rm_cat', rmcat);
                record.setValue('rm.rm_type', rmtype);
				record.setValue('rm.name', rmNameAfter);
                this.ascBjUsmsProcAsgnAsgnReqAsgnTabRmDS.saveRecord(record);
                
                // complete request
                alert(blId + "/" + flId + "/" + rmId + " 已经成功分配到 : " + dvId);
                this.completeRequest(logId);
                
                // write log
                this.writeLog(logId, blId, flId, rmId, dvId);
                
                // sum data
                updateStaticFieldAboutEmOrRm();
                
                // change tab
                var selectTab = this.tabs.findTab('selectTab');
                selectTab.loadView();
                this.tabs.selectTab('selectTab');
            }
        } 
        catch (e) {
            View.showMessage('error', '', e.message, e.data);
        }
    },
    
    /**
     * Write record into log table
     *
     * @param {Object} logId
     * @param {Object} blId
     * @param {Object} flId
     * @param {Object} rmId
     * @param {Object} assignTo
     */
    writeLog: function(logId, blId, flId, rmId, assignTo){
        var log = new Object();
        log['activity_log_id'] = logId;
        log['bl_id'] = blId;
        log['fl_id'] = flId;
        log['rm_id'] = rmId;
        log['description'] = assignTo + "已经成功分配到：" + blId + "/" + flId + "/" + rmId;
        USMS_addUpdateLog(log);
    },
    
    /**
     *
     * @param {Object} logId
     */
    completeRequest: function(logId){
        var parameter = {};
        parameter['activity_log.activity_log_id'] = logId;
        parameter['activity_log.comments'] = "成功分配";
        Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-completeRequest', parameter);
    }
});
