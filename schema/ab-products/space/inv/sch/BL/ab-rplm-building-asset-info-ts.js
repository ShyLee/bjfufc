var rplmBuildingBuildAssetController = View.createController('rplmBuildingAssetBuild', {
    openerPanel: null,
    openerController: null,
    type: null,
    action: null,
    actionType: null,
    itemId: null,
    itemType: null,
    itemIsOwned: null,
    leaseId: null,
    leaseType: null,
    wizard: null,
    contentDisabled: null,
	firstSave: true,
    afterInitialDataFetch: function(){
        if (View.getOpenerView().controllers.get('portfAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
        }
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
		
		
		var blId=this.tsBlForm0.getFieldValue("bl.bl_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("asset_source.bl_id",blId,'=');
		this.assetGrid.refresh(restriction);
		
    },
    //返回到首界面
    returnToIndex: function(){
    	this.openerController.navigate('home_page');
    },
   /* tsBlForm0_onReturn: function(){
    	this.openerController.navigate('backward');
    },
    
    Finish: function(){
    	//this.tsBlForm1.show(false);
    	View.showMessage("记录:" + this.itemId + "保存成功!");
    	//重新载入页面
    	//location.reload();
    	this.openerController.navigate('home_page');
    },
    */
    initVariables: function(openerPanel, openerController){
        this.openerController = openerController;
        this.openerPanel = openerPanel;
        this.wizard = this.openerPanel.wizard;
        this.type = this.wizard.getType();
        this.action = this.wizard.getAction();
        this.actionType = this.wizard.getActionType();
        this.itemId = this.wizard.getItemId();
        this.itemType = this.wizard.getItemType();
        this.itemIsOwned = this.wizard.getItemIsOwned();
        this.leaseId = this.wizard.getLeaseId();
        this.leaseType = this.wizard.getLeaseType();
        this.contentDisabled = false;//this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
    },
    restoreSettings: function(){
        if (this.action == 'ADD' && this.itemId == null) {
            //this.tsBlForm1.refresh(null, true);//new record
            //this.rplmPropertyOwnershipForm.refresh(null, true);
        }else{
        	this.tsBlForm0.refresh({'bl.bl_id' : this.itemId}, false);
        	this.tsBlForm1.refresh({'bl.bl_id' : this.itemId}, false);
        }
     
    },
	 assetGrid_onAdd: function(){
        this.assetForm.showInWindow({
            width: 400,
            height: 300
        });
        this.assetForm.refresh(null, true);
        this.assetForm.setFieldValue("asset_source.asset_code", "");
        this.assetForm.setFieldValue("asset_source.code", "");
        this.assetForm.setFieldValue("asset_source.asset_count", "");
        this.assetForm.setFieldValue("asset_source.asset_type", "");
        this.assetForm.setFieldValue("asset_source.description", "");
        
        
    },
	assetGrid_onDel:function(){
		 var pmsGrid = this.assetGrid;
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
                                'asset_source.id': dataRow['asset_source.id'],
                            }, false);
                            controller.assetDs.deleteRecord(record);
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
 	assetForm_onSave: function(){
     var blId = this.tsBlForm0.getFieldValue("bl.bl_id");
		if(blId==""){
			View.alert("请先填写建筑物基本信息,保存后  再填写资金来源信息");
			return;
		}
        var assetCode = this.assetForm.getFieldValue("asset_source.asset_code");
        var count = this.assetForm.getFieldValue("asset_source.asset_count");
        var type = this.assetForm.getFieldValue("asset_source.asset_type");
        var desc = this.assetForm.getFieldValue("asset_source.description");
        if(assetCode=="" || count == "" || type==""){
        	View.alert("请填入必填项");
        	return;
        }
        
        this.assetForm.setFieldValue("asset_source.bl_id", blId);
        this.assetForm.setFieldValue("asset_source.asset_code", assetCode);
        this.assetForm.setFieldValue("asset_source.asset_count", count);
        this.assetForm.setFieldValue("asset_source.asset_type", type);
        this.assetForm.setFieldValue("asset_source.description", desc);
        this.assetForm.save();
        this.assetForm.closeWindow();
        this.assetGrid.refresh();
    }
    
});