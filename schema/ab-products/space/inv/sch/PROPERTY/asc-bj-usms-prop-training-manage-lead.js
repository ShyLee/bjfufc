var TsingHouseRelicManageController = View.createController('TsingHouseRelicManageController' , {
	afterInitialDataFetch: function(){
		Ext.get("ts_relic_manage_console_ts_relic_manage.mg_name").dom.readOnly=true;
	},
	showDailog : function(row){
		var index=this.ts_relic_manage_grid.selectedRowIndex;
		var gridRowRecord=this.ts_relic_manage_grid.gridRows.get(index).getRecord();
		var mgId=gridRowRecord.getValue('ts_relic_manage.mg_id');
		var pkId=gridRowRecord.getValue('ts_train_read.pk_id');
		var mgName=gridRowRecord.getValue('ts_relic_manage.mg_name');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ts_relic_manage.mg_id',mgId,'=');
		this.ts_relic_manage_form.refresh(restriction);
		var title = String.format(getMessage('formTitle'),mgName);
		this.ts_relic_manage_form.setTitle(title);
		this.ts_relic_manage_form.showInWindow({
			width: 400,
			height: 150
		});
		return pkId;
	},
	showDailogIsRead : function(row){
		var index=this.ts_relic_manage_isread_grid.selectedRowIndex;
		var gridRowRecord=this.ts_relic_manage_isread_grid.gridRows.get(index).getRecord();
		var mgId=gridRowRecord.getValue('ts_relic_manage.mg_id');
		var pkId=gridRowRecord.getValue('ts_train_read.pk_id');
		var mgName=gridRowRecord.getValue('ts_relic_manage.mg_name');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ts_relic_manage.mg_id',mgId,'=');
		this.ts_relic_manage_form.refresh(restriction);
		var title = String.format(getMessage('formTitle'),mgName);
		this.ts_relic_manage_form.setTitle(title);
		this.ts_relic_manage_form.showInWindow({
			width: 400,
			height: 150
		});
		return pkId;
	},
	saveRead : function(){
		var pkId=this.showDailog();
		var userName=View.user.name;
		if(pkId!=""){
			var restriction = new Ab.view.Restriction();
			restriction.addClause('ts_train_read.pk_id',pkId,'=');
			var tstrainReadDS=this.tstrainReadDS;
			var record=tstrainReadDS.getRecord(restriction);
			record.setValue('ts_train_read.is_read','Y');
			record.setValue('ts_train_read.date_read',new Date());
			record.setValue('ts_train_read.em_id',userName);
			tstrainReadDS.saveRecord(record);
//			this.ts_relic_manage_grid.refresh();
//			this.ts_relic_manage_isread_grid.refresh();
		}
	},
	//ts_relic_manage_grid生成序列号
	ts_relic_manage_grid_afterRefresh: function(){
	        var rows = this.ts_relic_manage_grid.rows;
	        for (var i = 0; i < rows.length; i++) {
	            this.ts_relic_manage_grid.gridRows.items[i].cells.items[0].dom.innerHTML = i + 1;
	        }
	    },
	  //ts_relic_manage_isread_grid生成序列号
	    ts_relic_manage_isread_grid_afterRefresh: function(){
		        var rows = this.ts_relic_manage_isread_grid.rows;
		        for (var i = 0; i < rows.length; i++) {
		            this.ts_relic_manage_isread_grid.gridRows.items[i].cells.items[0].dom.innerHTML = i + 1;
		        }
		    },
});

