var abDataBlMngtChgController = View.createController('abDataBlMngtChgController',{
	openerController:null,
	blId:"",
	blName:"",
	area:"",
	value:"",
	flag:"",//传递一个标记值，如果是change， dialog为变更框，如果为history，dialog显示变更历史列表
	afterInitialDataFetch: function(){
		this.blId  = this.view.parameters['bl_id'];
		this.blName = this.view.parameters['bl_name'];
		this.area = this.view.parameters['area'];
		this.value = this.view.parameters['value'];
		this.flag = this.view.parameters['flag'];
		this.openerController = this.view.parameters['openerController'];
		this.marketForm.setFieldValue("sc_bl_value_chg.bl_id",this.blId);
		this.marketForm.setFieldValue("sc_bl_value_chg.name",this.blName);
		this.marketForm.setFieldValue("sc_bl_value_chg.area_book",this.area);
		this.marketForm.setFieldValue("sc_bl_value_chg.value_book",this.value);
		this.marketForm.setFieldValue("sc_bl_value_chg.area_market",this.area);
		this.marketForm.setFieldValue("sc_bl_value_chg.value_market",this.value);
		this.marketForm.setTitle(getMessage('blName') + this.blName);
		this.marketForm.enableField('sc_bl_value_chg.value_market', false);
	},
	marketForm_onSave: function(){
		if (!this.marketForm.canSave()) {
            return false;
        }else{
        	
    					
        	var area_book=this.marketForm.getFieldValue("sc_bl_value_chg.area_book");
			var area_market=this.marketForm.getFieldValue("sc_bl_value_chg.area_market");
			var area_add = area_market - area_book;
			var value_book=this.marketForm.getFieldValue("sc_bl_value_chg.value_book");
			var value_market=this.marketForm.getFieldValue("sc_bl_value_chg.value_market");
			var value_add = value_market - value_book;
			if(area_add==0 && value_add==0 ){
				   View.showMessage(getMessage('wrongNoChangeValue') + getMessage('wantCancel'));   
			}else{
				   this.marketForm.setFieldValue('sc_bl_value_chg.area_add', area_add);
				   this.marketForm.setFieldValue('sc_bl_value_chg.value_add', value_add);
				   var controller = this;
				   View.confirm("确认保存", function(button){
		    			if (button == 'yes')
		    			{
		    				try {
		    					controller.marketForm.save();
		    					controller.saveValueIntoBl(area_market,value_market);
		    					controller.openerController.tsBlGrid.refresh(null,false);
		    					View.closeThisDialog();
					}catch(e){
		            	return;
		            }
			}
		});
			}
        } 
	},
	saveValueIntoBl: function(area_market,value_market){
		var blDS=View.dataSources.get('blDS');
		var res = new Ab.view.Restriction();
		res.addClause('bl.bl_id',this.blId,'=');
		var record=blDS.getRecord(res);
		record.setValue("bl.area_building_manual",area_market);
		record.setValue("bl.value_book",value_market);
		blDS.saveRecord(record);
	},
	change:function(){
		var panel = View.panels.get("marketForm");
		var valueField = panel.getFieldValue("sc_bl_value_chg.type");
		if(valueField=='2'){
			panel.enableField("sc_bl_value_chg.value_market",true);
			panel.enableField("sc_bl_value_chg.area_market",false);
		}else if(valueField=='3'){
			panel.enableField("sc_bl_value_chg.value_market",true);
			panel.enableField("sc_bl_value_chg.area_market",true);
		}else{
			panel.enableField("sc_bl_value_chg.value_market",false);
			panel.enableField("sc_bl_value_chg.area_market",true);
		}
	}
});