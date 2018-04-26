var abdashBoard_Control = View.createController('abdashBoard_Control', {


    /**
     *筛选
     */
    dashBoardConsole_onShow: function(){
        var satrtDate = this.dashBoardConsole.getFieldValue("bh_zzf_protocal.date_begin");
        var endDate = this.dashBoardConsole.getFieldValue("bh_zzf_protocal.date_end");
        if (satrtDate == "" && endDate == "") {
            View.showMessage("请至少输入一个查询条件!");
            return;
        }
        if (Date.parse(satrtDate.replace(/-/g, "/")) > Date.parse(endDate.replace(/-/g, "/"))) {
            View.showMessage("截止时间不能小于起始时间！");
            return false;
        }
        var restriction = new Ab.view.Restriction();
        if (valueExistsNotEmpty(endDate)) {
            restriction.addClause('bh_zzf_fees.practical_fees_date', endDate , "like");
        }
        if (valueExistsNotEmpty(satrtDate)) {
            restriction.addClause('bh_zzf_fees.should_fees_date', satrtDate , "like");
        }
        this.feesInfo.refresh(restriction);
        if (this.feesInfo.rows.length == 0) {
            View.showMessage("没有符合条件的缴费信息！");
            return;
        }
        
    },
    
    /**
     * 删除
     * @param {Object} row
     */
    feesInfo_onDelete: function(row){
        var pmsGrid = this.feesInfo;
        var dataRows = pmsGrid.getSelectedRows();
        {
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
                                    'bh_zzf_fees.protocal_id': dataRow['bh_zzf_fees.protocal_id'],
                                    'bh_zzf_fees.fees_id': dataRow['bh_zzf_fees.fees_id']
                                }, false);
                                controller.zzf_fees_ds.deleteRecord(record);
                            }
                            pmsGrid.refresh();
                        } 
                        catch (e) {
                            Ab.workflow.Workflow.handleError(e);
                        }
                    }
                });
                
            }
            
            
        }
        
    }
    
});


