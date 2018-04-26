var defZFAdminEdFcController = View.createController('defZFAdminEdFcController', {
    ARCHIVE_ID: null,
    EM_ID: null,
    IS_ADMIN_ACCOUNT: true,//是否管理员账户
    
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
    
    afterInitialDataFetch: function(){
        this.detailTabs.disable();
        
        var restriction =  "sc_zf_em.archive_id in (select archive_id from SC_ZFBT_PER_FLINFO where fl_num > 0) and sc_zf_em.em_id is not null";
		this.GridForm.restriction = restriction;
		this.GridForm.refresh();
    },
    
    linkToTabs: function(){
        var selectedIndex = this.GridForm.selectedRowIndex;
        this.ARCHIVE_ID = this.GridForm.rows[selectedIndex]["sc_zf_em.archive_id"];
        this.EM_ID = this.GridForm.rows[selectedIndex]["sc_zf_em.em_id"];
        
        if (!valueExistsNotEmpty(this.ARCHIVE_ID)) {
            View.showMessage("此人没有入档!");
            return;
        }
        
        this.detailTabs.SuperController = this;//作为全局变量在tab之间传值
        this.detailTabs.enable();
        
        var res = new Ab.view.Restriction();
        res.addClause("sc_zf_em_po.archive_id", this.ARCHIVE_ID, "=");
        this.emForm.refresh(res, false);
        this.poGrid.refresh(res);
        
        this.detailTabs.findTab("personalTab").loadView();
        this.detailTabs.findTab("cqfTab").loadView();
        this.detailTabs.findTab("hcqflTab").loadView();
        this.detailTabs.findTab("flTab").loadView();
        
        //默认显示福利房信息
		this.detailTabs.selectTab("flTab");
    }
    


});









