var abDefineDvParamsDingeImport = View.createController("abDefineDvParamsDingeImport", {
	wf_role_id:'AbSpaceRoomInventoryBAR-DingeDataTransferService-importData',
	//核查文件 
	importLocalFile: null,
	jobId: null,
	progressControl: null,
	currentTabName:"xy",
	tabs:null,
	tabs_afterTabChange:function(tabPanel,tabName){
		this.currentTabName=tabName;
	},
	afterViewLoad:function(){
        this.tabs =View.panels.get("projectWizard");
        this.tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
	},
	buildProgressReport: function() {
		var configObj = new Ab.view.ConfigObject();
		configObj.setConfigParameter("showResultFile", false);
		this.progressControl = new Ab.progress.ProgressReport('importProgressPanel', configObj);
		this.progressControl.build();
		//this.progressControl.setButtonText("停止导入");
	    this.startTransfer();
	},
	startTransfer: function(){
		var filePath =  "";
		filePath = this.importLocalFile.value.toLowerCase();
		var	fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
		var serverFileName = null;
		Workflow.startJobWithUpload(this.wf_role_id, this.importLocalFile, this.afterDataTransferStarted, this,this.currentTabName, serverFileName, fileExt);
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

});

function submitImport(){

	var fileObj = $('inLocalFileBrow');
	if(fileObj.value == ""){
		View.showMessage('error', "请选择一个文件");
		return;
	}
	this.abDefineDvParamsDingeImport.importLocalFile=fileObj;
	var tabPanel = abDefineDvParamsDingeImport.importFileTabs;
	tabPanel.selectTab('importFileTabs_progress');
	this.abDefineDvParamsDingeImport.buildProgressReport();
};