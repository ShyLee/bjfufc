/**
 *@kevenin
 */
var abScZZFRmDetailRpt = View.createController('abScZZFRmDetailRpt', {

    tabSelected: "",
    zhuhuCount: 0,
    zhuhuTabs: null,
    blId: "",
    flId: "",
    rmId: "",
    tabNum: "",
    
    
    afterViewLoad: function(){
        this.zhuhuTabs = View.getControl('', 'ruzhuTabs');
    },
    afterInitialDataFetch: function(){
        this.inherit();
        this.zhuhuTabs.addEventListener('afterTabChange', this.zhuhuTabs_afterTabChange.createDelegate(this));
    },
    
    createRuZhuTabs: function(){
        this.hideAllTab();
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zzfcard.bl_id", this.blId, '=');
        restriction.addClause("sc_zzfcard.fl_id", this.flId, '=');
        restriction.addClause("sc_zzfcard.rm_id", this.rmId, '=');
        var ds = View.dataSources.get("ds_asc-bj-usms-zzf-rm-card_tab_card");
        var records = ds.getRecords(restriction);
        this.zhuhuCount = records.length;
        if (this.zhuhuCount > 0) {
            var firstCardId;
            for (var i = 0; i < this.zhuhuCount; i++) {
                var cardId = records[i].getValue("sc_zzfcard.card_id");
                if (i == 0) 
                    firstCardId = cardId;
                var tab = this.zhuhuTabs.findTab('zhuhu_tab_' + cardId);
                if (!tab) {
                    var emName = records[i].getValue("sc_zzfcard.em_name");
                    createRuZhuTab(i, emName, cardId);
                }else{
					tab.show(true);
				}
            }
            this.consolePanel.clear();
            this.zhuhuTabs.findTab('tempTab').clearRestriction = true;
            this.zhuhuTabs.findTab('tempTab').show(false);
            this.zhuhuTabs.findTab('zhuhu_tab_' + firstCardId).clearRestriction = true;
            this.zhuhuTabs.selectTab('zhuhu_tab_' + firstCardId);
            //this.zhuhuTabs.selectTab('zhuhu_tab_' + firstCardId, null, false, true) 
        }
        
    },
    
    hideAllTab: function(){
        var tabCount = this.zhuhuTabs.tabs.length;
		this.zhuhuTabs.findTab('tempTab').show(true);
        for (var i = 0; i < tabCount; i++) {
			var tabName = this.zhuhuTabs.tabs[i].name;
			if (tabName != 'tempTab'){
				this.zhuhuTabs.findTab(tabName).show(false);
			}
        }
    },
    
    consolePanel_onShow: function(){
        var prId = this.consolePanel.getFieldValue("bl.pr_id");
        var blId = this.consolePanel.getFieldValue("bl.bl_id");
        var rmId = this.consolePanel.getFieldValue("rm.rm_id");
       
        /*sqlRes = "(select bl_id from rm where rm_id='"+rmId"'");*/
        if(valueExistsNotEmpty(rmId)){
        	var rmsql = "rm_id='"+rmId+"'";
        }else{
        	var rmsql = '1=1';
        };
        
        if(valueExistsNotEmpty(blId)){
        	var blsql = "bl_id='"+blId+"'";
        }else{
        	var blsql = '1=1';
        };
        
        if(valueExistsNotEmpty(prId)){
        	var prsql = "pr_id='"+prId+"'";
        }else{
        	var prsql = '1=1';
        };
        
        this.site_bl.addParameter("rmId",rmsql);
        this.site_bl.addParameter("blId",blsql);
        this.site_bl.addParameter("prId",prsql);
        this.site_bl.refresh();
    },
    consolePanel_onClear:function(){
    	this.consolePanel.setFieldValue("bl.pr_id","");
    	this.consolePanel.setFieldValue("bl.bl_id","");
    	this.consolePanel.setFieldValue("property.name","");
    	this.consolePanel.setFieldValue("bl.name","");
    	this.consolePanel.setFieldValue("rm.rm_id","");
    },
    
    zhuhuTabs_afterTabChange: function(tabPanel, selectedTabName, newTabName){
        this.zhuhuTabs.curSelectedTabName = selectedTabName;
		var tabCount = this.zhuhuTabs.tabs.length;
        for (var i = 0; i < tabCount; i++) {
            if (selectedTabName == this.zhuhuTabs.tabs[i].name) {
                var cardId = this.zhuhuTabs.findTab(selectedTabName).cardId;
                this.zhuhuTabs.currentCardId = cardId;
            }
        }
        
    },
    
    abScZzfRmPhoto_afterRefresh: function(){
        showRmPhoto();
    }
    
})

function createRuZhuTab(level, zhuhuTitle, cardId){
    // create Tab object
    
    var tab = new Ab.tabs.Tab({
        name: "zhuhu_tab_" + cardId,
        title: zhuhuTitle,
        fileName: 'asc-bj-usms-zzf-rpt-rm-card.axvw',
        selected: false,
        enabled: true,
        hidden: false,
        useParentRestriction: false,
        isDynamic: false,
        useFrame: true,
        createTabPanel: createRuZhuTabPanel
    });
    tab.cardId = cardId;
    abScZZFRmDetailRpt.ruzhuTabs.addTab(tab);
    tab.createTabPanel();
    
    
    
}

function createRuZhuTabPanel(){
    // create managed iframe
    this.frame = new Ext.ux.ManagedIFrame({
        autoCreate: {
            width: '100%',
            height: '100%'
        }
    });
    this.frame.setStyle('border', 'none');
    
    //this.loadView();
    
    // create Ext.Panel with the iframe as content
    var tabPanel = this.parentPanel.tabPanel.add({
        id: this.name,
        title: this.title,
        contentEl: this.frame,
        autoWidth: true,
        autoHeight: true,
        border: false,
        closable: false
    });
    this.tabPanel = tabPanel;
    this.id = this.name;
}


function onClickRmNode(){
    var curTreeNode = View.panels.get("site_bl").lastNodeClicked;
    abScZZFRmDetailRpt.blId = curTreeNode.data['rm.bl_id'];
    abScZZFRmDetailRpt.flId = curTreeNode.data['rm.fl_id'];
    abScZZFRmDetailRpt.rmId = curTreeNode.data['rm.rm_id'];
    
    // show history
    var restriction = new Ab.view.Restriction();
    
    restriction.addClause("sc_zzfcard.bl_id", abScZZFRmDetailRpt.blId, '=');
    restriction.addClause("sc_zzfcard.fl_id", abScZZFRmDetailRpt.flId, '=');
    restriction.addClause("sc_zzfcard.rm_id", abScZZFRmDetailRpt.rmId, '=');
    
    abScZZFRmDetailRpt.abScZzfRmUseHistoryGrid.refresh(restriction);
    
    /*var hisGrid = View.panels.get("abScZzfRmUseHistoryGrid");
    hisGrid.refresh(restriction);*/
    
    //show rm photo 
    var blID = abScZZFRmDetailRpt.blId;
    restriction = new Ab.view.Restriction();
    restriction.addClause('sc_bl_hx.bl_id', blID, '=');
    var records = View.dataSources.get('dsAbSpDefLocRmFormRmPhoto').getRecords(restriction);
    if (records.length == 0) {
        abScZZFRmDetailRpt.exitRmPhoto = false;
    }
    var rmPhotoPanel = View.panels.get("abScZzfRmPhoto");
    rmPhotoPanel.refresh(restriction);
    
    //show rm detail info
    var rmDetailInfoPanel = View.panels.get("abScZzfRmDetailInfoPanel");
    restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", abScZZFRmDetailRpt.blId, '=');
    restriction.addClause("rm.fl_id", abScZZFRmDetailRpt.flId, '=');
    restriction.addClause("rm.rm_id", abScZZFRmDetailRpt.rmId, '=');
    rmDetailInfoPanel.refresh(restriction);
    //show tabs 
    abScZZFRmDetailRpt.createRuZhuTabs();
}



function showRmPhoto(){
    var rmPhotoPanel = View.panels.get('abScZzfRmPhoto');
    
    var em_photo = rmPhotoPanel.getFieldValue('sc_bl_hx.photo').toLowerCase();
    var em_id = rmPhotoPanel.getFieldValue('sc_bl_hx.id');
    
    if (valueExistsNotEmpty(em_photo)) {
        rmPhotoPanel.showImageDoc('image_field', 'sc_bl_hx.id', 'sc_bl_hx.photo');
    }
    else {
        rmPhotoPanel.fields.get('image_field').dom.src = null;
        rmPhotoPanel.fields.get('image_field').dom.alt = getMessage('noImage');
    }
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'site_bl') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var buildingName = treeNode.data['bl.name'];
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingId + "</span> ";
        labelText1 = labelText1 + buildingName;
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 1) {
        var floorId = treeNode.data['fl.fl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + floorId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var roomId = treeNode.data['rm.rm_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + roomId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}





