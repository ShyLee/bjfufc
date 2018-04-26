//Ab.form.Form.prototype.onKeyPressFilter=function(){
//	abScRptRmInvByFl.refreshTreeview();
//}


var abScRptRmInvByFl = View.createController('abScRptRmInvByFlController', {
	gridTitle:"",
	tmpTitle:"",
    afterViewLoad: function(){
    	this.sbfFilterPanel.onKeyPressFilter=function(){
    			abScRptRmInvByFl.refreshTreeview();
    	};
    	this.tmpTitle=getMessage('gridTitle').replace(":{0}","");
    	this.gridTitle=this.tmpTitle;
    },
    sbfFilterPanel_onClear:function(){
    	this.gridTitle = this.tmpTitle;
    	this.abScRptRmInv_SumGrid.refreshClearAllFilters();
    },
    
    sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        
    },
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        var gridPanel = View.panels.get("abScRptRmInv_SumGrid");
        var restriction = new Ab.view.Restriction();
        var rmCat = consolePanel.getFieldValue('rm.rm_cat');
        if (rmCat != '') {
            restriction.addClause("rm.rm_cat", rmCat + "%", "like");
            this.gridTitle = String.format(getMessage('gridTitle'), rmCat);
        }
        var rmType = consolePanel.getFieldValue('rm.rm_type');
        if (rmType != '') {
            restriction.addClause("rm.rm_type", rmType + "%", "like");
            this.gridTitle = String.format(getMessage('gridTitle'), rmType);
        }
        var dvId = consolePanel.getFieldValue('dv.dv_id');
        if (dvId != '') {
            restriction.addClause("rm.dv_id", dvId + "%", "like");
            this.gridTitle = String.format(getMessage('gridTitle'), dvId);
        }
        var buId = consolePanel.getFieldValue('dv.bu_id');
        if (buId != '') {
            restriction.addClause("rm.bu_id", buId + "%", "like");
            this.gridTitle = String.format(getMessage('gridTitle'), buId);
        }
        var siteId = consolePanel.getFieldValue('bl.site_id');
        if (siteId != '') {
            restriction.addClause("rm.site_id", siteId + "%", "like");
            this.gridTitle = String.format(getMessage('gridTitle'), siteId);
        }
        var blName = consolePanel.getFieldValue('bl.name');
        if (blName != '') {
            restriction.addClause("rm.blname", blName + "%", "like");
            this.gridTitle = String.format(getMessage('gridTitle'), blName);
           
        }

        this.abScRptRmInv_SumGrid.refresh(restriction);
    },
    addTotalRow: function(){
        for (var i = 0; i < this.rows.length; i++) {
            var row = this.rows[i];
            var fntstdCountValue = row['rm.area'];
            if (row['bu.area_rm.raw']) {
                fntstdCountValue = row['rm.area.raw'];
            }
            if (!isNaN(parseInt(fntstdCountValue))) {
                totalAreaShiyong += parseFloat(fntstdCountValue);
            }
        }
    },
    abScRptRmInv_SumGrid_afterRefresh:function(){
    	 setPanelTitle('abScRptRmInv_SumGrid', this.gridTitle);
    }
    
});





