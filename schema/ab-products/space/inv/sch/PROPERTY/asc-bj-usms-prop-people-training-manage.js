var tsingHouseRelicSafeTabController = View.createController('tsingHouseRelicSafeTabController', {

    primaryKey: null,
    afterInitialDataFetch: function(){
        this.initPrimaryKey(true);
    },
    initPrimaryKey: function(afterShow){
        //刷新文档显示标题
        if (this.ts_prop_train_log_grid.rows.length == 0) {
            this.ts_prop_train_log_form.show(false);
            this.fileupload.show(false);
            return;
        }
        else {
            var panel = this.ts_prop_train_log_grid;
            
            var selectedIndex = -1;
            if (afterShow) {
                selectedIndex = 0;
            }
            else {
                selectedIndex = panel.selectedRowIndex;
            }
            
            this.primaryKey = panel.rows[selectedIndex]["ts_prop_train_log.train_id"];
            var train_title = panel.rows[selectedIndex]["ts_prop_train_log.train_title"];
            var restriction = new Ab.view.Restriction();
            restriction.addClause("ts_prop_train_log.train_id", this.primaryKey, "=");
            this.ts_prop_train_log_form.refresh(restriction, false);
            //刷新上传文档
            var toolRestriction = new Ab.view.Restriction();
            toolRestriction.addClause("ts_doc_center.target_id", this.primaryKey, '=');
            toolRestriction.addClause("ts_doc_center.table_name", "ts_prop_train_log", '=');
            this.fileupload.refresh(toolRestriction, false);
            this.fileupload.setTitle("[" + train_title + "]相关文档")
        }
        
    },
    /**
     * 刷选
     */
    ts_prop_train_log_console_onShow: function(){
        var train_title = this.ts_prop_train_log_console.getFieldValue("ts_prop_train_log.train_title");
        var tr_train_type = this.ts_prop_train_log_console.getFieldValue("ts_prop_train_log.tr_train_type");
        var restriction = new Ab.view.Restriction();
        if (train_title != '') {
            restriction.addClause("ts_prop_train_log.train_title", train_title + "%", "like");
        }
        if (tr_train_type != '') {
            restriction.addClause("ts_prop_train_log.tr_train_type", tr_train_type + "%", "like");
        }
        this.ts_prop_train_log_grid.refresh(restriction);
        this.ts_prop_train_log_form.refresh(restriction);
    },
    /**
     *上传文档
     */
    fileupload_onUpload: function(){
        var controller = this;
        var restriction = {
            'pk': controller.primaryKey,
            'tbn': 'ts_prop_train_log'
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
    },
    
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
            
            //对每个按钮注册点击事件
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
    
    /*
     * 新增
     */
    ts_prop_train_log_grid_onNew: function(){
        this.ts_prop_train_log_form.refresh(null, true);
        this.ts_prop_train_log_form.actions.get('delete').enable(false);
    },
    /*
     * 保存
     */
    ts_prop_train_log_form_onSave: function(){
        var train_id = this.ts_prop_train_log_form.getFieldValue('ts_prop_train_log.train_id')
        this.ts_prop_train_log_form.save();
        this.ts_prop_train_log_grid.refresh();
        
        
    },
    /**
     * 删除
     */
    deleteForm: function(){
        this.ts_prop_train_log_grid.refresh();
        this.ts_prop_train_log_form.show(true);
    },
    /*
     *生成序列号
     */
    ts_prop_train_log_grid_afterRefresh: function(){
        AUSC_AddRowNum(this.ts_prop_train_log_grid);
    }
    
    
});
