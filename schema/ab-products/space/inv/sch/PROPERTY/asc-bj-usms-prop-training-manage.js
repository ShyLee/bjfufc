var TsingHouseRelicManageController = View.createController('TsingHouseRelicManageController' , {
	afterInitialDataFetch: function(){
//		if(this.ts_relic_manage_grid.rows.length!=0){
//			var mg_id = this.ts_relic_manage_grid.rows[0]["ts_relic_manage.mg_id"];
//			var restriction = new Ab.view.Restriction();
//			restriction.addClause('ts_relic_manage.mg_id',mg_id,'=');
//			this.ts_relic_manage_form.refresh(restriction);
//		}
		
		Ext.get("ts_relic_manage_console_ts_relic_manage.mg_name").dom.readOnly=true;
	},
	ts_relic_manage_console_onShow:function(){
		
		var mg_name = this.ts_relic_manage_console.getFieldValue('ts_relic_manage.mg_name');
		var mg_type = this.ts_relic_manage_console.getFieldValue('ts_relic_manage.mg_type');
		var mg_date = this.ts_relic_manage_console.getFieldValue('ts_relic_manage.mg_date');
		var mg_people = this.ts_relic_manage_console.getFieldValue('ts_relic_manage.mg_people');
		var restriction = new Ab.view.Restriction();
		
		if(mg_name != "")
			restriction.addClause('ts_relic_manage.mg_name' , mg_name , '=');	
		if(mg_type != "")
			restriction.addClause('ts_relic_manage.mg_type' , mg_type , '=');
		if(mg_date != "")
			restriction.addClause('ts_relic_manage.mg_date' , mg_date , '=');
		if(mg_people)
			restriction.addClause('ts_relic_manage.mg_people' , mg_people , '=');	
		this.ts_relic_manage_grid.refresh();
		this.ts_relic_manage_form.refresh();
		
	},
	ts_relic_manage_grid_onNew:function(){
		this.ts_relic_manage_form.show(true);
		var arcRec = new Ab.data.Record({
			'ts_relic_manage.mg_people':View.user.name,
			'ts_relic_manage.read_type':'1'
		} , true);
		
		try{
			var ds = this.tsRelicManageDS;
		 	var result = ds.saveRecord(arcRec);
		 	
		 	var pkeyId = result.getValue('ts_relic_manage.mg_id');
	    	this.ts_relic_manage_form_refresh(pkeyId);
//			this.ts_relic_manage_form_setRecord(result);
		}catch(e){
			View.showMessage('error' , message , e.message , e.data);
		}
	},
	ts_relic_manage_form_refresh:function(pkid){
		var res = new Ab.view.Restriction();
		res.addClause('ts_relic_manage.mg_id',pkid,'=');
		this.ts_relic_manage_form.refresh(res);
		this.ts_relic_manage_form.setFieldValue('ts_relic_manage.mg_date',new Date());
	},
	ts_relic_manage_form_setRecord:function(record){
		this.ts_relic_manage_form.setRecord(record);
		
		this.ts_relic_manage_form.setFieldValue('ts_relic_manage.mg_name',"");
		this.ts_relic_manage_form.setFieldValue('ts_relic_manage.mg_type',"");
		this.ts_relic_manage_form.setFieldValue('ts_relic_manage.doc1',"");
		this.ts_relic_manage_form.setFieldValue('ts_relic_manage.mg_date',new Date());
		this.ts_relic_manage_form.setFieldValue('ts_relic_manage.mg_text',"");
		this.ts_relic_manage_form.setFieldValue('ts_relic_manage.beizhu',"");
		this.ts_relic_manage_form.setFieldValue('ts_relic_manage.mg_people',View.user.name);
	},
	ts_relic_manage_form_onSave:function(){
		
		var mg_id = this.ts_relic_manage_form.getFieldValue('ts_relic_manage.mg_id');
		if(mg_id=="")
		{
			View.showMessage("请先点击新增！");return false;
		}
		var mg_type = this.ts_relic_manage_form.getFieldValue('ts_relic_manage.mg_type');
		var mg_date = this.ts_relic_manage_form.getFieldValue('ts_relic_manage.mg_date');
		var mg_name = this.ts_relic_manage_form.getFieldValue('ts_relic_manage.mg_name');
		var doc1 = this.ts_relic_manage_form.getFieldValue('ts_relic_manage.doc1');
		if(mg_type == ""){
			View.showMessage("类型不能为空!") ; return false ;
		}
		if(mg_date == ""){
			View.showMessage("上传日期不能为空!") ; return false ;
		}
		if(mg_name == ""){
			View.showMessage("文档名称不能为空!") ; return false ;
		}
		if(doc1 == ""){
			View.showMessage("附件不能为空!") ; return false ;
		}
//		this.ts_relic_manage_form.setFieldValue('ts_relic_manage.mg_name',doc1);
		this.ts_relic_manage_form.save();
	    this.saveDv(mg_id);
		this.ts_relic_manage_grid.refresh();
		
	},
	//ts_relic_manage_form标题栏显示文档名称
	showDocName: function(row){
		var index=this.ts_relic_manage_grid.selectedRowIndex;
		var gridRowRecord=this.ts_relic_manage_grid.gridRows.get(index).getRecord();
		var mgName=gridRowRecord.getValue('ts_relic_manage.mg_name');
		var title = String.format(getMessage('formTitle'),mgName);
		this.ts_relic_manage_form.setTitle(title);
	},
	//文件赋给所有单位
	 saveDv: function(mg_id){
		 try{
	    		var result = Workflow.callMethod('AbBldgOpsHelpDesk-TrainDocManage-saveDoc',mg_id);
	    		
	    		
	    	} catch (e) {
	            Workflow.handleError(e);
	            return null;
	        }
	 },
	 
	 //删除所有单位的此文件
	 ts_relic_manage_form_onDelete: function(){
		 this.deleteDv();
	 },
	 deleteDv: function(mg_id){
		 try{
	    		var result = Workflow.callMethod('AbBldgOpsHelpDesk-TrainDocManage-deleteDoc',mg_id);
	    		
	    		
	    	} catch (e) {
	            Workflow.handleError(e);
	            return null;
	        }
	 },
	

	gridRefresh:function()
	{
		this.ts_relic_manage_grid.refresh();
		this.ts_relic_manage_form.show(false);
	},
	ts_relic_manage_grid_afterRefresh: function(){
	        var rows = this.ts_relic_manage_grid.rows;
	        for (var i = 0; i < rows.length; i++) {
	            this.ts_relic_manage_grid.gridRows.items[i].cells.items[0].dom.innerHTML = i + 1;
	        }
	}
});

