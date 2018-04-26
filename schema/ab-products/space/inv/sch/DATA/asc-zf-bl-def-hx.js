var controller = View.createController('controller', {

    blId: null,
    
    afterInitialDataFetch: function(){
		this.blId = this.view.parameters["blId"],
        this.formPanel.refresh(null, true);
        this.formPanel.setFieldValue("sc_bl_hx.bl_id", this.blId, "=");
        //刷新gridPanel
        var res = new Ab.view.Restriction();
        res.addClause("sc_bl_hx.bl_id",this.blId,"=");
        this.gridPanel.refresh(res);
    },
    formPanel_onSave: function(){
        var message = "确定要保存";
        var controller = this;
        View.confirm(message, function(button){
            if (button == "yes") {
                try {
                    var success = controller.formPanel.canSave();
                    if (success) {
                        controller.formPanel.save();
                    }
                    controller.gridPanel.refresh();
                } 
                catch (e) {
                    return;
                }
            }
        });
    },
    gridPanel_onRefresh: function(){
        this.gridPanel.refresh();
    },
    gridPanel_onAdd: function(){
        this.formPanel.refresh(null, true);
        this.formPanel.setFieldValue('sc_bl_hx.bl_id', this.blId);
    },
    gridPanel_onDelete: function(){
        var selectedRows = this.gridPanel.getSelectedRecords();
        var len = selectedRows.length;
        if (len == 0) {
            View.showMessage('请选择要删除的户型');
        }
        else {
            var message = "确定要删除";
            var controller = this;
            View.confirm(message, function(button){
                if (button == "yes") {
                    try {
                        for (var i = 0; i < len; i++) {
                            var dataRow = selectedRows[i];
                            controller.scBlHxDs.deleteRecord(dataRow);
                        }
                        controller.gridPanel.refresh();
                        controller.formPanel.refresh(null, true);
                        controller.formPanel.setFieldValue('sc_bl_hx.bl_id', controller.blId);
                    } 
                    catch (e) {
                        return;
                    }
                }
            });
        }
    }
});
