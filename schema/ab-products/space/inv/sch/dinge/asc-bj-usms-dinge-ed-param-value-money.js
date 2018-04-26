var abDefineDvParamsController = View.createController("abDefineDvParamsController", {
	
	consolePanel_onShow:function(){
		var yearInput=this.consolePanel.getFieldValue("year");
		if(yearInput==""){
			View.showMessage("请 输入需要操作定额的年份！");
			this.viewDvDingePanel.show(false);
			return ;
		}else{
			if(!this.verifyYearIsExist(yearInput)){
				View.showMessage("没有初始化【"+yearInput+"】年的定额数据，请转到【分配公式】界面进行初始化操作！");
				this.viewDvDingePanel.show(false);
		        return;
			}else{
				var restriction=new Ab.view.Restriction();
	    		restriction.addClause("sc_ts_dv_dinge.year_dinge",yearInput,"=");
	    		this.viewDvDingePanel.refresh(restriction);
	    		this.viewDvDingePanel.setTitle(yearInput+"年—各单位定额");
			}
		}
	},
	viewParams:function(){
		this.viewDvParams.showInWindow({
			width: 700,
			height: 380,
			closeButton: false
		});
		var restriction=new Ab.view.Restriction();
		var dvId=this.editDvDingePanel.getFieldValue("sc_ts_dv_dinge.dv_id");
		var dvName=this.editDvDingePanel.getFieldValue("sc_ts_dv_dinge.dv_name");
		var year=this.editDvDingePanel.getFieldValue("sc_ts_dv_dinge.year_dinge");
		var areaDinge=this.editDvDingePanel.getFieldValue("sc_ts_dv_dinge.area_dinge");
		restriction.addClause("sc_dv_area_log.dv_id",dvId,"=");
		restriction.addClause("sc_dv_area_log.year",year,"=");
     this.viewDvParams.refresh(restriction);
     this.viewDvParams.setTitle("【"+dvName+"】的定额面积是："+areaDinge);
	},
	consolePanel_onClear:function(){
		this.consolePanel.setFieldValue("year","");
	},
	verifyYearIsExist:function(year){
	    var restriction="year_dinge='"+year+"'";
	  	var parameters = {
	 			tableName: 'sc_ts_dv_dinge',
	 			fieldNames: toJSON(['sc_ts_dv_dinge.year_dinge']),
	 			restriction: toJSON(restriction)
	 		};
	  	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var value="";
		if (result.data.records.length > 0) {
			return true;
		}else{
			return false;
		}
	}

});

function editDvParamsDetail(){
	 var gridPanel = View.panels.get("viewDvDingePanel");
	 var dvId=gridPanel.rows[gridPanel.selectedRowIndex]["sc_ts_dv_dinge.dv_id"];
	 var year=gridPanel.rows[gridPanel.selectedRowIndex]["sc_ts_dv_dinge.year_dinge"];
	 
	 var panel=View.panels.get("editDvDingePanel");
	 panel.showInWindow({
	        width: 750,
	        height: 380,
	        closeButton: false
	    });
	 
	 var restriction = new Ab.view.Restriction();
	 restriction.addClause("sc_ts_dv_dinge.dv_id", dvId, "=");
	 restriction.addClause("sc_ts_dv_dinge.year_dinge", year, "=");
	 panel.refresh(restriction);
}

