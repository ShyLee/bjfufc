var tsRmKeyController = View.createController('tsRmKeyController', {
    primaryKey: null,
    
    afterInitialDataFetch: function(){
        this.initPrimaryKey(true);
        
    },
    ts_rm_key_grid_onNew: function(){
        this.ts_rm_key_form.refresh(null, true);
        this.ts_rm_key_form.actions.get('delete').enable(false);
    },
    initPrimaryKey: function(afterShow){
        //刷新文档显示标题
        if (this.ts_rm_key_grid.rows.length == 0) {
            this.ts_rm_key_form.show(false);
            return;
        }
        else {
            var panel = this.ts_rm_key_grid;
            
            var selectedIndex = -1;
            if (afterShow) {
                selectedIndex = 0;
            }
            else {
                selectedIndex = panel.selectedRowIndex;
            }
            var blId = panel.rows[selectedIndex]["ts_rm_key.bl_id"];
            var restriction = new Ab.view.Restriction();
            restriction.addClause("ts_rm_key.bl_id", blId, "=");
            this.ts_rm_key_grid.refresh(restriction, false);
            this.ts_rm_key_form.refresh(restriction, false);
            
        }
    },
    
    /**
     * 保存后刷新
     */
    ts_rm_key_form_onSave: function(){
        var blId = this.ts_rm_key_console.getFieldValue("ts_rm_key.bl_id")
        var flId = this.ts_rm_key_console.getFieldValue("ts_rm_key.fl_id")
        var rmId = this.ts_rm_key_console.getFieldValue("ts_rm_key.rm_id")
         this.ts_rm_key_form.save();
		 this.ts_rm_key_grid.refresh();
		 
    },
    
    /**
     * 刷选
     */
    ts_rm_key_console_onShow: function(){
        var blId = this.ts_rm_key_console.getFieldValue("ts_rm_key.bl_id")
        var flId = this.ts_rm_key_console.getFieldValue("ts_rm_key.fl_id")
        var rmId = this.ts_rm_key_console.getFieldValue("ts_rm_key.rm_id")
        var restriction = new Ab.view.Restriction();
        if (blId != "") {
            restriction.addClause("ts_rm_key.bl_id", blId + "%", "like");
        }
        if (flId != "") {
            restriction.addClause("ts_rm_key.fl_id", flId + "%", "like");
        }
        if (rmId != "") {
            restriction.addClause("ts_rm_key.rm_id", rmId + "%", "like");
        }
        
        this.ts_rm_key_grid.refresh(restriction);
        this.ts_rm_key_form.refresh(restriction);
        
    },
    
    
    
    
    
    
    
    
    
    
    /*
     * 把显示建筑物的ID 改为显示建筑物的名称
     */
    ts_rm_key_grid_afterRefresh: function(){
        var rows = this.ts_rm_key_grid.rows;
        for (var i = 0; i < rows.length; i++) {
            var blId = rows[i].row.getFieldValue("ts_rm_key.bl_id");
            var blName = GetEmName(blId);
            rows[i].row.setFieldValue("ts_rm_key.bl_id", blName);
        }
    },

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
