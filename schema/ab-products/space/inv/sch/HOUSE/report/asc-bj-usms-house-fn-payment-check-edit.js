var editController = View.createController('editController',{
	diffPanel:null,
	uploadPanel:null,
	afterViewLoad:function(){
		this.diffPanel=this.diffRecords;
		this.uploadPanel=this.selectionPanel;
	},
	afterInitialDataFetch:function(){
	},
	//显示不匹配的代扣房租记录
	showCheckedData:function(){
		var restriction = new Ab.view.Restriction(); 
		var month=this.yearMonth.substring(4);
		restriction.addClause("sc_zzfrent_details.actual_payoff","sc_zzfrent_details.month_rent", "!="); 
		restriction.addClause("sc_zzfrent_details.month",month,"=");
		this.diffPanel.refresh(restriction);
		
		var ds = View.dataSources.get('sc_zzfrent_details_ds');
	    var records = ds.getRecords();
	    
	    if(records.toString()==""){
	    	alert("[本月,没有不匹配的代扣房租记录]");
	    	var tabs = View.panels.get('importFileTabs'); 
	    	tabs.selectTab('importFileTabs_selection');
	    	
	    }else{
	    	this.diffPanel.show(true);
	    }
	},
	//调用WFR后的回调函数
	afterDataTransferStarted: function(result) {
	    this.jobId = result.message;
	    if(this.jobId == null){
	    	this.jobId = "错误";
	    }
	    this.showProgress.defer(500, this);
	    window.setTimeout(this.showCheckedData(),5000);   
	},
 	showProgress: function() {
	    this.progressControl.setProgressAndRunTask(this.jobId);
		var restriction = View.getOpenerView().panels.get(this.panel_source).restriction;
		View.getOpenerView().panels.get(this.panel_source).refresh(restriction);
    },
    refreshPanel:function(){
    	var restriction = new Ab.view.Restriction(); 
		restriction.addClause("sc_zzfrent_details.actual_payoff","sc_zzfrent_details.month_rent", "!="); 
		this.diffPanel.refresh(restriction);
    }
});