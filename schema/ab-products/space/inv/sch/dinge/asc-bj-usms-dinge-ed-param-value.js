var abDefineDvParamsController = View.createController("abDefineDvParamsController", {

	afterInitialDataFetch:function(){
		 this.projectWizard.addEventListener('afterTabChange',this.tabChanged.createDelegate(this));   
	
    },
	tabChanged:function(){
		var yearInput=this.consolePanel.getFieldValue("year");
        if(yearInput==""){
            if(arguments[1]=='xy'){
				this.viewDvDingePanel.show(false);
				this.viewDvDingePanel.refresh("1=2");
			}else{
				this.viewDvDingePanelDZ.show(false);
				   this.viewDvDingePanelDZ.refresh("1=2");
			}        
            View.showMessage("请 输入需要操作定额的年份！");
        }
	},
	viewDvDingePanel_onNew:function(){
		this.newDvDingePanel.showInWindow({
			width: 750,
			height: 380,
			closeButton: false
		});
		 this.newDvDingePanel.refresh(null,true);
	},
	viewParams:function(){
			this.viewDvParams.showInWindow({
				width: 1200,
				height: 380,
				closeButton: false
			});
	     this.viewDvParams.refresh();
	},
	consolePanel_onShow:function(){
		var yearInput=this.consolePanel.getFieldValue("year");
		if(yearInput==""){
			View.showMessage("请 输入需要操作定额的年份！");
			this.viewDvDingePanel.show(false);
			this.viewDvDingePanelDZ.show(false);
			return ;
		}else{
			var account = View.dataSources.get("sc_ts_dv_dinge_ds");
			var accountDZ = View.dataSources.get("sc_ts_dv_dinge_ds_dz");
    		var restriction=new Ab.view.Restriction();
    		var restrictionDZ=new Ab.view.Restriction();
    		restriction.addClause("sc_ts_dv_dinge.year_dinge",yearInput,"=");
    		restrictionDZ.addClause("sc_ts_dv_dinge.year_dinge",yearInput,"=");
    		var accountRecord = account.getRecord(restriction);
    		var accountRecordDZ = account.getRecord(restrictionDZ);
    		if(accountRecord!=""&&accountRecordDZ!=""){
    			this.viewDvDingePanel.refresh(restriction);
    			this.viewDvDingePanelDZ.refresh(restrictionDZ);
    			this.viewDvDingePanel.setTitle(yearInput+"年—各学院单位定额");
    			this.viewDvDingePanelDZ.setTitle(yearInput+"年—各党政单位定额");
    		}else{
    			if(confirm("第一次操作【"+yearInput+"】年的定额,需要初始化数据,点击【确定】生成【"+yearInput+"】年定额数据,点击【取消】关闭窗口请重新选择年份!")){
    				if(this.initialDvByYear(yearInput,"NEW","null")){
    					this.viewDvDingePanel.refresh(restriction);
    					this.viewDvDingePanelDZ.refresh(restrictionDZ);
    					
    					this.viewDvDingePanel.setTitle(yearInput+"年—各单位定额");
    					this.viewDvDingePanelDZ.setTitle(yearInput+"年—各单位定额");
    				}else{
    					View.showMessage("初始化定额数据失败！请重新操作！");
    					this.viewDvDingePanel.show(false);
    					this.viewDvDingePanelDZ.show(false);
    					return ;
    				}
    			}else{
    				return ;
    			}
    		}
		}
	},
	consolePanel_onClear:function(){
		this.consolePanel.setFieldValue("year","");
	},
	initialDvByYear:function(year,type,zhonglei){
		 var finish=false;
		 
		 try {
			 var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-VerifyDingeHandler-insertDingeDvByYear',year,type,zhonglei);
			 if(result.code=="executed"){
				 finish= true;
			 }
		 }catch (e) {
	         Workflow.handleError(e);
	      }
		 return finish;
	},
	viewDvDingePanel_onInitinal:function(){
		var year=this.viewDvDingePanel.rows[0]["sc_ts_dv_dinge.year_dinge"];
		if(confirm("确定要重新初始化【"+year+"】年的定额数据吗?点击【确定】将会删除【"+year+"】年学院定额数据操作记录,重新生成定额数据;点击【取消】关闭窗口!")){
			var type="EDIT";
			var zhonglei = "XY";
			if(this.initialDvByYear(year,type,zhonglei)){
				var restriction=new Ab.view.Restriction();
	    		restriction.addClause("sc_ts_dv_dinge.year_dinge",year,"=");
				this.viewDvDingePanel.refresh(restriction);
				this.viewDvDingePanel.setTitle(year+"年—各学院单位定额");
			}else{
				View.showMessage("初始化定额数据失败！请重新操作！");
				return ;
			}
		}else{
			return ;
		}
	},
	viewDvDingePanelDZ_onInitinaldz:function(){
		var year=this.viewDvDingePanelDZ.rows[0]["sc_ts_dv_dinge.year_dinge"];
		if(confirm("确定要重新初始化【"+year+"】年的定额数据吗?点击【确定】将会删除【"+year+"】年党政机关定额数据操作记录,重新生成定额数据;点击【取消】关闭窗口!")){
			var type="EDIT";
			var zhonglei = "DZGL";
			if(this.initialDvByYear(year,type,zhonglei)){
				var restriction=new Ab.view.Restriction();
				restriction.addClause("sc_ts_dv_dinge.year_dinge",year,"=");
				this.viewDvDingePanelDZ.refresh(restriction);
				this.viewDvDingePanelDZ.setTitle(year+"年—各党政机关定额");
			}else{
				View.showMessage("初始化定额数据失败！请重新操作！");
				return ;
			}
		}else{
			return ;
		}
	},
	
	
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
};

function editDvParamsDetailDZ(){
	var gridPanel = View.panels.get("viewDvDingePanelDZ");
	var dvId=gridPanel.rows[gridPanel.selectedRowIndex]["sc_ts_dv_dinge.dv_id"];
	var year=gridPanel.rows[gridPanel.selectedRowIndex]["sc_ts_dv_dinge.year_dinge"];
	
	var panel=View.panels.get("editDvDingePanelDZ");
	panel.showInWindow({
		width: 750,
		height: 380,
		closeButton: false
	});
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("sc_ts_dv_dinge.dv_id", dvId, "=");
	restriction.addClause("sc_ts_dv_dinge.year_dinge", year, "=");
	panel.refresh(restriction);
};
function importDvParamsDetail(){
	 
	 var panel=View.panels.get("importFileTabs");
	 jQuery("#import").attr("value","导入");
	 panel.showInWindow({
	        width: 750,
	        height: 380,
	        closeButton: false
	    });	 
	 panel.refresh();
};



