var tsPropBiddingControlller = View.createController('tsPropBiddingControlller', {
    primaryKey:null,
    /**
     *当页面加载完刷新投标公司列表
     */
    afterInitialDataFetch: function(){
        this.initPrimaryKey(true);
    },
    
    /**
     * 显示当前登录人
     */
    biddingInfo_form_afterRefresh: function(){
        var currentUser = View.user.name;
        var consolePanel = this.biddingInfo_form;
        consolePanel.setFieldValue("ts_bidding.td_operator", currentUser);
    },
    /**
     * 获取grid选中的记录
     */
    initPrimaryKey: function(afterShow){
        //刷新文档显示标题
        if (this.biddingInfo_grid.rows.length == 0) {
            this.biddingInfo_form.show(false);
            this.docInfo_grid.show(false);
            return;
        }
        else {
            var panel = this.biddingInfo_grid;
            
            var selectedIndex = -1;
            if (afterShow) {
                selectedIndex = 0;
            }
            else {
                selectedIndex = panel.selectedRowIndex;
            }
            var bidId = panel.rows[selectedIndex]["ts_bidding.bid_id"];
            var bidName = panel.rows[selectedIndex]["ts_bidding.bid_name"];
            this.primaryKey = panel.rows[selectedIndex]["ts_bidding.bid_id"];
			
            var toolRestriction = new Ab.view.Restriction();
            toolRestriction.addClause("ts_bid_company.bid_id", bidId, '=');
            this.biddingInfo_form.refresh(toolRestriction, false);
            this.docInfo_grid.refresh(toolRestriction, false);
			
            var restriction = new Ab.view.Restriction();
            restriction.addClause("ts_doc_center.target_id", bidId, '=');
            restriction.addClause("ts_doc_center.table_name", "ts_bidding", "=");
            this.fileupload.refresh(restriction,false);
            this.fileupload.setTitle("[" + bidName + "] 标书的相关信息");
        }
    },
    /**
     * Filter
     */
    biddingInfo_console_onFilter: function(){
        var bid_id = this.biddingInfo_console.getFieldValue("ts_bidding.bid_id")
        var bidding_company = this.biddingInfo_console.getFieldValue("ts_bidding.bidding_company")
        var bidding_price = this.biddingInfo_console.getFieldValue("ts_bidding.bidding_price")
        var bid_company = this.biddingInfo_console.getFieldValue("ts_bidding.bid_company")
        var bid_price = this.biddingInfo_console.getFieldValue("ts_bidding.bid_price")
        var date_from = this.biddingInfo_console.getFieldValue("ts_bidding.date_from")
        var date_to = this.biddingInfo_console.getFieldValue("ts_bidding.date_to")
        var restriction = new Ab.view.Restriction();
        if (bidding_company != '') {
            restriction.addClause('ts_bidding.bidding_company', bidding_company, 'like');
            
        }
        if (bidding_price != '') {
            restriction.addClause('ts_bidding.bidding_company', bidding_price, 'like');
        }
        if (bid_company != '') {
            restriction.addClause('ts_bidding.bidding_company', bid_company, 'like');
        }
        if (bid_price != '') {
            restriction.addClause('ts_bidding.bidding_company', bid_price, 'like');
        }
        if (date_from != '') {
            restriction.addClause('ts_bidding.bidding_company', date_from, 'like');
        }
        if (date_to != '') {
            restriction.addClause('ts_bidding.bidding_company', date_to, 'like');
        }
        this.biddingInfo_grid.refresh(restriction);
        this.biddingInfo_form.refresh(restriction);
        this.initPrimaryKey(true);
        
    },
    /**
     * 保存评委
     */
    bid_experts_form_onSave: function(){
        var bid_id = this.biddingInfo_form.getFieldValue("ts_bidding.bid_id");
        var expert_name = this.biddingInfo_form.getFieldValue("ts_bid_experts.expert_name");
        this.bid_experts_form.save();
        this.bid_experts_form.closeWindow();
        View.showMessage("保存成功！");
    },
    
    /**
     * 查看评委
     */
    biddingInfo_form_onLookup_Experts: function(){
        var bid_id = this.biddingInfo_form.getFieldValue("ts_bidding.bid_id");
        var toolRestriction = new Ab.view.Restriction();
        toolRestriction.addClause("ts_bid_experts.bid_id", bid_id, '=');
        this.show_experts_grid.refresh(toolRestriction);
        this.show_experts_grid.showInWindow({
            width: 600,
            height: 300
        });
        
    },
    /**
     *删除评委
     */
    show_experts_grid_onDelete: function(){
        var pmsGrid = this.show_experts_grid;
        var dataRows = pmsGrid.getSelectedRows();
        if (dataRows.length == 0) {
            View.alert("请选择要删除的记录！");
        }
        else {
            var controller = this;
            var message = getMessage('您是否要删除此记录!');
            View.confirm(message, function(button){
                if (button == 'yes') {
                    try {
                        if (dataRows.length == 0) {
                            View.alert("请选择要删除的记录！");
                        }
                        for (var i = 0; i < dataRows.length; i++) {
                            var dataRow = dataRows[i];
                            var record = new Ab.data.Record({
                                'ts_bid_experts.bid_id': dataRow['ts_bid_experts.bid_id'],
                                'ts_bid_experts.expert_name': dataRow['ts_bid_experts.expert_name']
                            }, false);
                            controller.expertsDS.deleteRecord(record);
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
     * 录入投标公司
     */
    docInfo_grid_onAdd: function(){
        var objectName = this.biddingInfo_form.getFieldValue("ts_bidding.bid_name");
        var objectId = this.biddingInfo_form.getFieldValue("ts_bidding.bid_id");
        this.add_bid_company_form.showInWindow({
            width: 600,
            height: 300
        });
        this.add_bid_company_form.refresh(null, true);
        this.add_bid_company_form.setTitle("添加 [" + objectName + "] 投标的公司");
        this.add_bid_company_form.setFieldValue("ts_bid_company.bid_id", objectId)
        this.add_bid_company_form.setFieldValue("ts_bid_company.bid_company", "")
        this.add_bid_company_form.setFieldValue("ts_bid_company.bid_price", "")
        this.add_bid_company_form.setFieldValue("ts_bid_company.is_win", "")
        this.add_bid_company_form.setFieldValue("ts_bid_company.bid_people", "")
        this.add_bid_company_form.setFieldValue("ts_bid_company.people_phone", "")
        this.add_bid_company_form.setFieldValue("ts_bid_company.comments", "")
    },
    
    
    /**
     * 保存一个投标文件所投的公司
     */
    add_bid_company_form_onSave: function(){
        var bid_id = this.biddingInfo_form.getFieldValue("ts_bidding.bid_id");
        this.add_bid_company_form.save();
        this.docInfo_grid.refresh();
        var TDNumber = this.docInfo_grid.rows;
        var TDCount = TDNumber.length;
        var bid_id = this.biddingInfo_form.getFieldValue("ts_bidding.bid_id");
        //保存一个投标文件所投的公司个数（ts_bidding）
        var restriction = new Ab.view.Restriction();
        restriction.addClause('ts_bidding.bid_id', bid_id, '=');
        var bidDataSource = View.dataSources.get('bidding_DS');
        var record = bidDataSource.getRecord(restriction);
        record.setValue('ts_bidding.td_nums', TDCount);
        bidDataSource.saveRecord(record);
        this.add_bid_company_form.closeWindow();
        this.biddingInfo_form.refresh();
        
    },
    
    
    
    /**
     * 删除一个投标文件所投的公司
     */
    docInfo_grid_onDelete: function(){
        var pmsGrid = this.docInfo_grid;
        var dataRows = pmsGrid.getSelectedRows();
        if (dataRows.length == 0) {
            View.alert("请选择要删除的记录！");
        }
        else {
            var controller = this;
            var message = getMessage('您是否要删除此记录!');
            View.confirm(message, function(button){
                if (button == 'yes') {
                    try {
                        if (dataRows.length == 0) {
                            View.alert("请选择要删除的记录！");
                        }
                        for (var i = 0; i < dataRows.length; i++) {
                            var dataRow = dataRows[i];
                            var record = new Ab.data.Record({
                                'ts_bid_company.bid_id': dataRow['ts_bid_company.bid_id'],
                                'ts_bid_company.bid_company': dataRow['ts_bid_company.bid_company']
                            }, false);
                            controller.bid_companyDS.deleteRecord(record);
                        }
                        pmsGrid.refresh();
                        //删除投标公司及刷新个数
                        var bid_id = controller.biddingInfo_form.getFieldValue("ts_bidding.bid_id");
                        var TDNumber = pmsGrid.rows;
                        var TDCount = TDNumber.length;
                        var restriction = new Ab.view.Restriction();
                        restriction.addClause('ts_bidding.bid_id', bid_id, '=');
                        var bidDataSource = View.dataSources.get('bidding_DS');
                        var record = bidDataSource.getRecord(restriction);
                        record.setValue('ts_bidding.td_nums', TDCount);
                        bidDataSource.saveRecord(record);
                        controller.biddingInfo_form.refresh();
                    } 
                    catch (e) {
                        Ab.workflow.Workflow.handleError(e);
                    }
                }
            });
            
        }
    },
    
    
    /**
     * save bidCompany
     */
    biddingInfo_form_onSave: function(){
        this.biddingInfo_form.save();
        this.biddingInfo_grid.refresh();
        //       this.biddingInfo_form.refresh();
    },
    
    docInfo_grid_afterRefresh: function(){
        var rows = this.docInfo_grid.rows;
        for (var i = 0; i < rows.length; i++) {
            var blId = rows[i].row.getFieldValue("ts_bid_company.bid_id");
            var blName = GetEmName(blId);
            rows[i].row.setFieldValue("ts_bid_company.bid_id", blName);
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
            'tbn': 'ts_bidding'
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
 * 更改投标文件名称
 */
function GetEmName(blId){
    var parameters = {
        tableName: 'ts_bidding',
        fieldNames: toJSON(['bid_name']),
        restriction: "ts_bidding.bid_id ='" + blId + "'"
    };
    
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    if (result.data.records.length > 0) {
        var blName = result.data.records[0]['ts_bidding.bid_name'];
        return blName;
    }
    else {
        return null;
    }
}

















