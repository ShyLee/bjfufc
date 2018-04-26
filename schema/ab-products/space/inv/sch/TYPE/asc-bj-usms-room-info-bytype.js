var abScRptRmInvByFl = View.createController('abScRptRmInvByFlController', {
	
	gridTitle:"",
    tmpTitle:"",
	
	afterViewLoad: function(){
        this.sbfFilterPanel.onKeyPressFilter=function(){
                abScRptRmInvByFl.refreshTreeview();
        };
        this.tmpTitle=getMessage('gridTitle').replace(" :{0}","");
        this.gridTitle=this.tmpTitle;
    },
	
    sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
    },
	
	sbfFilterPanel_onClear:function(){
        this.gridTitle = this.tmpTitle;
        this.abScRptRmInv_SumGrid.refreshClearAllFilters();
    },
	
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        var gridPanel = View.panels.get("abScRptRmInv_SumGrid");
        var restriction = new Ab.view.Restriction();
        var rmUse = consolePanel.getFieldValue('rmuse.rmuse_name');
        if (rmUse != '') {
            restriction.addClause("rm.rmuse_name", rmUse + "%", "like");
			this.gridTitle = String.format(getMessage('gridTitle'), rmUse);
            //var title = String.format(getMessage('gridTitle'), rmUse);
            //setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        var rmCat = consolePanel.getFieldValue('rmcat.rmcat_name');
        if (rmCat != '') {
            restriction.addClause("rm.rmcat_name", rmCat + "%", "like");
			this.gridTitle = String.format(getMessage('gridTitle'), rmCat);
//            var title = String.format(getMessage('gridTitle'), rmCat);
//            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        var rmType = consolePanel.getFieldValue('rmtype.rmtype_name');
        if (rmType != '') {
            restriction.addClause("rm.rmtype_name", rmType + "%", "like");
			this.gridTitle = String.format(getMessage('gridTitle'), rmType);
//            var title = String.format(getMessage('gridTitle'), rmType);
//            setPanelTitle('abScRptRmInv_SumGrid', title);
        }
        
        this.abScRptRmInv_SumGrid.refresh(restriction);
    },
	
	abScRptRmInv_SumGrid_afterRefresh:function(){
         setPanelTitle('abScRptRmInv_SumGrid', this.gridTitle);
    },
    sbfFilterPanel_onClear:function(){
    	this.abScRptRmInv_SumGrid.refreshClearAllFilters();
    }
    
});





