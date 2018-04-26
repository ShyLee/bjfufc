var defZFEmEdFcController = View.createController('defZFEmEdFcController', {
	ARCHIVE_ID: null,
	EM_ID:null,
	IS_ADMIN_ACCOUNT: false,//是否管理员账户
	 wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
	 xmlName: "",
	 parameters:{},
	    
	afterInitialDataFetch:function(){
		this.detailTabs.disable();
	},
	afterViewLoad:function(){
		this.detailTabs.addEventListener('afterTabChange', this.onTabsChange);
	},
	onTabsChange:function(tabPanel, selectedTabName, newTabName){
//		console.log(tabPanel);
//		console.log(selectedTabName);
//		console.log(newTabName);
		var currentTab=tabPanel.findTab(selectedTabName);
		currentTab.loadView();
	},
   
	linkToTabs: function(){
		var selectedIndex = this.GridForm.selectedRowIndex;
	    this.ARCHIVE_ID = this.GridForm.rows[selectedIndex]["sc_zf_em.archive_id"];
	    this.EM_ID = this.GridForm.rows[selectedIndex]["sc_zf_em.em_id"];
		
	    if(!valueExistsNotEmpty(this.ARCHIVE_ID)){
	    	View.showMessage("此人没有入档!");
	    	return;
	    }
	    
	    this.detailTabs.SuperController = this;//作为全局变量在tab之间传值
	    this.detailTabs.enable();
		
	    var res = new Ab.view.Restriction();
        res.addClause("sc_zf_em_po.archive_id", this.ARCHIVE_ID, "=");
        this.emForm.refresh(res,false);
        this.poGrid.refresh(res);
        
        this.detailTabs.findTab("personalTab").loadView();
        this.detailTabs.findTab("cqfTab").loadView();
        this.detailTabs.findTab("hcqflTab").loadView();
	},
	emForm_onPrint: function(){
	        var archiveId = this.emForm.getFieldValue("sc_zf_em.archive_id");
			var emId = this.emForm.getFieldValue("sc_zf_em.em_id");
			if(!valueExistsNotEmpty(emId)){
				emId = '-1';
			}
			xmlName= "emZfReg";
	        parameters= {
	            'archiveId': archiveId,
				'emId': emId,
	            'subReports':"emZfReg_sub,emZfReg_ycx,emZfReg_subZfjy,emZfReg_subHcq,emZfReg_jc"
	        };
			try {
	            var result = Workflow.callMethod(this.wfrId, xmlName, 0, parameters);
	            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
	                result.data = eval('(' + result.jsonExpression + ')');
	                this.jobId = result.data.jobId;
	                var url = 'ab-ireport-example.axvw?jobId=' + this.jobId;
	                window.open(url);
	            }
	        } 
	        catch (e) {
	            Workflow.handleError(e);
	        }
	    }

	
	
});









