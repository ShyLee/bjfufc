var tsPropManageControlller = View.createController('tsPropManageControlller', {

    primaryKey: null,
    /**
     * 页面加载后刷新显示建筑物的panel
     */
    afterViewLoad: function(){
        var tabs = View.getControl('', 'propTabs');
    },
    afterInitialDataFetch: function(){
        this.initPrimaryKey(true);
        
    },
    initPrimaryKey: function(afterShow){
        //刷新文档显示标题
        if (this.ts_prop_manage_grid.rows.length == 0) {
            this.ts_prop_manage_form.show(false);
            this.fileupload.show(false);
            return;
        }
        else {
            var panel = this.ts_prop_manage_grid;
            
            var selectedIndex = -1;
            if (afterShow) {
                selectedIndex = 0;
            }
            else {
                selectedIndex = panel.selectedRowIndex;
            }
            
            var propCode = panel.rows[selectedIndex]["ts_prop_company.prop_code"];
            var propName = panel.rows[selectedIndex]["ts_prop_company.prop_name"];
            this.primaryKey = panel.rows[selectedIndex]["ts_prop_company.prop_code"];
            
            var restriction = new Ab.view.Restriction();
            restriction.addClause("ts_prop_company.prop_code", propCode, "=");
            this.ts_prop_manage_form.refresh(restriction, false);
            this.ts_bl_grid.refresh(restriction, false);
            this.ts_bl_grid.setTitle("[" + propName + "] 管理的建筑物");
            
            var restriction = new Ab.view.Restriction();
            restriction.addClause("ts_doc_center.target_id", propCode, "=");
            restriction.addClause("ts_doc_center.table_name", "ts_prop_bl", "=");
            this.fileupload.refresh(restriction);
            this.fileupload.setTitle("[" + propName + "] 与建筑物的相关文档");
        }
    },
    /**
     * filter
     */
    ts_prop_manage_console_onFilter: function(){
        var prop_code = this.ts_prop_manage_console.getFieldValue("ts_prop_company.prop_code");
        var prop_name = this.ts_prop_manage_console.getFieldValue("ts_prop_company.prop_name");
        var bl_id = this.ts_prop_manage_console.getFieldValue("ts_prop_bl.bl_id");
        var restriction = new Ab.view.Restriction();
        var restriction2 = new Ab.view.Restriction();
        if (prop_code != "") {
            restriction.addClause('ts_prop_company.prop_code', prop_code + "%", 'like');
            restriction2.addClause('ts_prop_bl.prop_code', prop_code + "%", 'like');
        }
        if (prop_name != "") {
            restriction.addClause('ts_prop_company.prop_name', prop_name + "%", 'like');
            restriction2.addClause('ts_prop_bl.prop_name', prop_name + "%", 'like');
        }
        
        if (bl_id != "") {
        
            restriction2.addClause('ts_prop_bl.bl_id', bl_id + "%", 'like');
        }
        this.ts_prop_manage_grid.refresh(restriction);
        this.ts_prop_manage_form.refresh(restriction);
        this.ts_bl_grid.refresh(restriction2);
        this.ts_bl_grid.setTitle("[" + prop_name + "] 管理的建筑物");
    },
    /**
     * New
     */
    ts_bl_grid_onAdd: function(){
        var objectId = this.ts_prop_manage_form.getFieldValue("ts_prop_company.prop_code");
        var objectName = this.ts_prop_manage_form.getFieldValue("ts_prop_company.prop_name");
        if (objectId != "") {
            this.ts_add_bl_form.show(true);
            this.ts_add_bl_form.showInWindow({
                width: 800,
                height: 500
            });
            this.ts_add_bl_form.refresh();
            this.ts_add_bl_form.setFieldValue("ts_prop_bl.prop_code", objectId)
            this.ts_add_bl_form.setFieldValue("ts_prop_bl.prop_name", objectName)
            this.ts_add_bl_form.setFieldValue("ts_prop_bl.date_sign", "")
            this.ts_add_bl_form.setFieldValue("ts_prop_bl.date_valid_to", "")
            this.ts_add_bl_form.setFieldValue("ts_prop_bl.prop_amount", "")
            this.ts_add_bl_form.setFieldValue("ts_prop_bl.pay_period", "")
            this.ts_add_bl_form.setFieldValue("ts_prop_bl.comments", "")
        }
    },
    /**
     * Delete
     */
    ts_bl_grid_onDelete: function(){
        var pmsGrid = this.ts_bl_grid;
        var dataRows = pmsGrid.getSelectedRows();
        if (dataRows.length == 0) {
            View.alert("请选择要删除的记录！");
        }
        else {
            var controller = this;
            var message = getMessage('您确定要删除吗？');
            View.confirm(message, function(button){
                if (button == 'yes') {
                    try {
                        if (dataRows.length == 0) {
                            View.alert("请选择要删除的记录！");
                        }
                        for (var i = 0; i < dataRows.length; i++) {
                            var dataRow = dataRows[i];
                            var record = new Ab.data.Record({
                                'ts_prop_bl.bl_id': dataRow['ts_prop_bl.bl_id'],
                                'ts_prop_bl.prop_code': dataRow['ts_prop_bl.prop_code']
                            }, false);
                            controller.prop_bl_DS.deleteRecord(record);
                        }
                        pmsGrid.refresh();
                        
                    } 
                    catch (e) {
                        Ab.workflow.Workflow.handleError(e);
                    }
                }
            });
            
        }
    },
    /**
     * 录入建筑物
     */
    ts_add_bl_form_onSave: function(){
        var prop_code = this.ts_add_bl_form.getFieldValue("ts_prop_bl.prop_code");
        var date_sign = this.ts_add_bl_form.getFieldValue("ts_prop_bl.date_sign");
        this.ts_add_bl_form.setFieldValue("ts_prop_bl.date_payrent_last", date_sign);
        this.ts_add_bl_form.save();
        this.ts_add_bl_form.closeWindow();
        this.ts_bl_grid.refresh();
    },
    /**
     * 查看建筑物
     */
    select: function(){
        var index = this.ts_bl_grid.selectedRowIndex;
        var gridRowRecord = this.ts_bl_grid.gridRows.get(index).getRecord();
        var prop_code = gridRowRecord.getValue('ts_prop_bl.prop_code');
        if (prop_code != "") {
            this.ts_add_bl_form.show(false);
            this.ts_add_bl_form.showInWindow({
                width: 800,
                height: 500
            });
            var restriction = new Ab.view.Restriction();
            restriction.addClause("ts_prop_bl.prop_code", prop_code, "=");
            this.ts_add_bl_form.refresh(restriction);
        }
    },
    /*
     * 把显示建筑物的ID 改为显示建筑物的名称
     */
    ts_bl_grid_afterRefresh: function(){
        var rows = this.ts_bl_grid.rows;
        for (var i = 0; i < rows.length; i++) {
            var blId = rows[i].row.getFieldValue("ts_prop_bl.bl_id");
            var blName = GetEmName(blId);
            rows[i].row.setFieldValue("ts_prop_bl.bl_id", blName);
        }
    },
    /**
     * 上传文档
     */
    fileupload_afterRefresh: function(){
        this.fileupload.gridRows.each(function(row){
            var record = row.getRecord();
            var downLink = record.getValue('ts_doc_center.doc_download');
            var downName = record.getValue('ts_doc_center.doc_name');
            var docId = record.getValue('ts_doc_center.doc_id');
            var cellElement = document.createElement('td');
            var param = {
                'downLink': downLink,
                'name': downName
            };
            var imgElement = document.createElement('img');
            imgElement.src = "/archibus/schema/ab-products/space/inv/sch/fileDownLoad/img/ab-icon-download.png";
            addEventHandler(imgElement, 'click', download, param);
            var imgElement2 = document.createElement('img');
            imgElement2.src = "/archibus/schema/ab-products/space/inv/sch/fileDownLoad/img/ab-icon-task-cancel.png";
            var param2 = {
                'downLink': downLink,
                'name': deleteFileOnServer,
                'docId': docId
            };
            addEventHandler(imgElement2, 'click', deleteFileOnServer, param2);
            cellElement.appendChild(imgElement);
            cellElement.appendChild(imgElement2);
            row.dom.appendChild(cellElement);
        });
    },
    fileupload_onUpload: function(){
        var controller = this;
        var restriction = {
            'pk': controller.primaryKey,
            'tbn': 'ts_prop_bl'
        };
        View.openDialog('asc_bj_ts_file_upload.axvw', restriction, false, {
            width: 630,
            height: 450,
            closeButton: false,
            afterViewLoad: function(dialogView){
                var dialogController = dialogView.controllers.get('uploadFileController');
                dialogController.onClose = controller.openerDialogonClose.createDelegate(controller);
            }
        });
    },
    openerDialogonClose: function(){
        this.fileupload.refresh();
    }
    
    
    
});

/**
 * 获取建筑物的姓名
 */
function GetEmName(blId){
    var parameters = {
        tableName: 'bl',
        fieldNames: toJSON(['bl.name']),
        restriction: "bl.bl_id ='" + blId + "'"
    };
    
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    var dataList = [];
    if (result.data.records.length > 0) {
        var blName = result.data.records[0]['bl.name'];
        return blName;
    }
    else {
        return null;
    }
}

/**
 * 判断物业公司负责的建筑是否有重复的
 */
function onChangeVendor(fieldName, newValue, oldValue){
    var blId = '';
    if (fieldName == 'ts_prop_bl.bl_id') {
        blId = newValue;
        var docDataSource = View.dataSources.get("prop_bl_DS");
        var restriction = new Ab.view.Restriction();
        restriction.addClause("ts_prop_bl.bl_id", blId, "=");
        var record = docDataSource.getRecords(restriction);
        if (record.length > 0) {
            View.alert("此建筑已有物业公司！");
			return false;
        }
            var panel = View.panels.get('ts_add_bl_form');
            panel.setFieldValue('ts_prop_bl', blId);
	
    }
	
}

































