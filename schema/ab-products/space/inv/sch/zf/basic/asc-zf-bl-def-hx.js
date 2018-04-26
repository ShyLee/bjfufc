var controller = View.createController('controller', {

    blId: null,
    
    afterInitialDataFetch: function(){
		this.blId = this.view.parameters["blId"],
        this.formPanel.refresh(null, true);
        this.formPanel.setFieldValue("sc_bl_hx.bl_id", this.blId, "=");
        this.gridPanel.refresh({"sc_bl_hx.bl_id":this.blId});
    },
    formPanel_onSave: function(){
        var message = "确定要保存";
        var controller = this;
//        var photo = this.formPanel.getFieldValue('sc_bl_hx.photo');
//        if(!photo){
//        	View.showMessage('请上传户型图');
//        }
        View.confirm(message, function(button){
            if (button == "yes") {
                try {
                    var success = controller.formPanel.canSave();
                    if (success) {
                        controller.formPanel.save();
                    }
                    View.showMessage('保存之后请上传户型图纸');
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
    formPanel_onAdd: function(){
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
