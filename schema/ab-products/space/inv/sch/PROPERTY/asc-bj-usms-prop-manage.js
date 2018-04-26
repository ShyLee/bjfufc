var tsPropManageControlller = View.createController('tsPropManageControlller', {
    primaryKey: null,
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
            
            var restriction = new Ab.view.Restriction();
            restriction.addClause("ts_doc_center.target_id", propCode, "=");
            restriction.addClause("ts_doc_center.table_name", "ts_prop_company", "=");
            this.fileupload.refresh(restriction);
            this.fileupload.setTitle("[" + propName + "] 相关文档");
        }
    },
    /**
     * 新建物业公司
     */
    ts_prop_manage_grid_onNew: function(){
        this.ts_prop_manage_form.refresh(null, true);
        this.ts_prop_manage_form.actions.get('delete').enable(false);
        var prop_code = this.ts_prop_manage_form.getFieldValue("ts_prop_company.prop_code");
        var toolRestriction = new Ab.view.Restriction();
        this.toolRestriction.addClause("ts_doc_center.doc_id", prop_code, "=")
        this.fileupload.refresh(toolRestriction);
    },
    
    /**
     * 保存物业公司
     */
    ts_prop_manage_form_onSave: function(){
        var prop_code = this.ts_prop_manage_form.getFieldValue("ts_prop_company.prop_code");
        this.ts_prop_manage_form.save();
        this.ts_prop_manage_grid.refresh();
    },
    /**
     * 删除物业公司及管理的建筑物
     */
    ts_prop_manage_form_onDelete: function(){
        //删除物业公司相关文档
        var prop_code = this.ts_prop_manage_form.getFieldValue("ts_prop_company.prop_code");
        var docDataSource = View.dataSources.get("ts_doc_center_ds");
        var restriction = new Ab.view.Restriction();
        restriction.addClause("ts_doc_center.target_id", prop_code, "=");
        var record = docDataSource.getRecords(restriction);
        AUSC_deleteRecord(docDataSource, record);
        //刷新上传文档
        var toolRestriction = new Ab.view.Restriction();
        toolRestriction.addClause("ts_doc_center.target_id", this.primaryKey, '=');
        this.fileupload.refresh(toolRestriction);
        //删除物业公司负责的建筑物
        var blDataSource = View.dataSources.get("prop_bl_DS");
        var restriction2 = new Ab.view.Restriction();
        restriction2.addClause("ts_prop_bl.bl_id", prop_code, "=");
        var record1 = blDataSource.getRecords(restriction2);
        AUSC_deleteRecord(blDataSource, record1);
        //删除物业公司
        var checkDataSource = View.dataSources.get("propmanageDS");
        var restriction3 = new Ab.view.Restriction();
        restriction3.addClause("ts_prop_bl.prop_code", prop_code, "=");
        var record2 = checkDataSource.getRecords(restriction3);
        AUSC_deleteRecord(checkDataSource, record2);
        this.ts_prop_manage_grid.refresh();
        //删除完之后进入初始化状态
        this.initPrimaryKey(true);
        
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
            'tbn': 'ts_prop_company'
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



