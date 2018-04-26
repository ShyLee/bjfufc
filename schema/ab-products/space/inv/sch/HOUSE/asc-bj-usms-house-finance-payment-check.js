var abCheckRentCtrl = View.createController('abCheckRentCtrl',{
	wf_role_id:'AbSpaceRoomInventoryBAR-financeFeedBackTransfer-financeFeedBackTransferIn',
	//uploaded-checked file 
	importLocalFile: null,
	jobId: null,
	progressControl: null,
	//check month and year 
	yearMonth: null,
	
	
	afterInitialDataFetch:function(){
		View.panels.items[4].setTabVisible('importFileTabs_progress', false);
		var currentDate = ASBT_getCurrentDate_Client();
		var currentYearMonth=ASBT_getYearMonthOfDate(currentDate);
		$("yearMonth").value=currentYearMonth;
		$("time").value=currentDate;
	},
	//import button action
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
		try{
			Workflow.startJobWithUpload(this.wf_role_id, this.importLocalFile, this.afterDataTransferStarted, this,this.yearMonth, serverFileName, fileExt);
		}catch(e){
			e;
		}
		
	},
	//show different datas
	showCheckedData:function(){
		var year=this.yearMonth.substring(0,4);
    	var month=this.yearMonth.substring(4,6);
    	var restriction = new Ab.view.Restriction(); 
    	restriction.addClause("sc_zzf_fee.year",year,"=");
    	restriction.addClause("sc_zzf_fee.month",month,"=");
    	this.diffRecords.refresh(restriction);
		this.diffRecords.show(true);
	},
	//WFR CallBack Function
	afterDataTransferStarted: function(result) {
	    this.jobId = result.message;
	    if(this.jobId == null){
	    	this.jobId = "错误";
	    }
	    this.showProgress.defer(200, this);
	    window.setTimeout(this.showCheckedData(),5000);   
	},
 	showProgress: function() {
	    this.progressControl.setProgressAndRunTask(this.jobId);
		var restriction = View.getOpenerView().panels.get(this.panel_source).restriction;
		View.getOpenerView().panels.get(this.panel_source).refresh(restriction);
    },
    reportProgressPanel_onStartOver: function(){	
		document.getElementById('inLocalFileBrow').value = "";
		View.panels.items[4].setTabVisible('importFileTabs_progress', false);
		View.panels.items[4].selectTab('importFileTabs_selection');
    },
    diffRecords_pay_onClick: function(row){
        var feeId = row.record['sc_zzf_fee.fee_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('sc_zzf_fee.fee_id', feeId);
        View.openDialog('asc-bj-usms-house-assign-card.axvw', restriction, false, {
            width: 700,
            height: 450,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('ascPaymentDetailController');
                dialogController.openerController = abCheckRentCtrl;
            }
        });
    },
    panelRefresh: function(){
    	var year=this.yearMonth.substring(0,4);
    	var month=this.yearMonth.substring(4,6);
    	var restriction = new Ab.view.Restriction(); 
    	restriction.addClause("sc_zzf_fee.year",year,"=");
    	restriction.addClause("sc_zzf_fee.month",month,"=");
    	this.diffRecords.refresh(restriction);
		this.diffRecords.show(true);
    }
});