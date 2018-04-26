var abCheckRentCtrl = View.createController('abCheckRentCtrl',{
	wf_role_id:'AbSpaceRoomInventoryBAR-HouseService-checkDiffOfActualAndCalculateRent',
	//核查文件 
	importLocalFile: null,
	jobId: null,
	progressControl: null,
	//核查年月
	yearMonth: null,
	diffPanel:null,
	uploadPanel:null,
	afterViewLoad:function(){
		this.diffPanel=this.diffRecords;
		this.uploadPanel=this.selectionPanel;
	},
	afterInitialDataFetch:function(){
		var currentDate = ASBT_getCurrentDate_Client();
		var currentYearMonth=ASBT_getYearMonthOfDate(currentDate);
		$("yearMonth").value=currentYearMonth;
		$("time").value=currentDate;
	},
	selectionPanel_onHistory:function(){
		alert(1);
		var tabs =  View.panels.get('importFileTabs'); 
	    var nextTabName = 'checkhistoryPanel';
	    var tab = tabs.findTab(nextTabName);
        tab.loadView();
        tabs.selectTab(nextTabName);
	}
	,
	//导入文件
	selectionPanel_onImport: function(){
		var fileObj = $('inLocalFileBrow');
		if(fileObj.value == ""){
			View.showMessage('error', "请选择一个文件");
			return;
		}
		var yearMonthV = $("yearMonth").value;
		this.yearMonth = yearMonthV;
		this.importLocalFile = fileObj;
		var tabPanel = this.importFileTabs;
		tabPanel.selectTab('importFileTabs_progress');
		this.buildProgressReport();
	},
	buildProgressReport: function() {
		// use all default configObj parameters
		var configObj = new Ab.view.ConfigObject();
		configObj.setConfigParameter("showResultFile", false);
		this.progressControl = new Ab.progress.ProgressReport('reportProgressPanel', configObj);
		this.progressControl.build();
		this.progressControl.setButtonText("停止导入");
	    this.startTransfer();
	},
	startTransfer: function(){
		var filePath =  "";
		filePath = this.importLocalFile.value.toLowerCase();
		var	fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
		var serverFileName = null;
		Workflow.startJobWithUpload(this.wf_role_id, this.importLocalFile, this.afterDataTransferStarted, this,this.yearMonth, serverFileName, fileExt);
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
	    window.setTimeout(this.showCheckedData(),500);   
	},
 	showProgress: function() {
	    this.progressControl.setProgressAndRunTask(this.jobId);
		var restriction = View.getOpenerView().panels.get(this.panel_source).restriction;
		View.getOpenerView().panels.get(this.panel_source).refresh(restriction);
    },
    refreshHistoryPanel:function(){
		var restriction = new Ab.view.Restriction(); 
		var month=this.yearMonth.substring(4);
		restriction.addClause("sc_zzfrent_details.actual_payoff","sc_zzfrent_details.month_rent", "!="); 
		restriction.addClause("sc_zzfrent_details.month",month,"=");
		this.diffPanel.refresh(restriction);
		
		var ds = View.dataSources.get('sc_zzfrent_details_ds');
	    var records = ds.getRecords();
	    
	    if(records.toString()==""){
	    	View.alert("[本月,没有不匹配的代扣房租记录]");
	    	var tabs = View.panels.get('importFileTabs');
	    	tabs.selectTab('importFileTabs_selection');
	    	
	    }else{
	    	this.diffPanel.show(true);
	    }
    }
});