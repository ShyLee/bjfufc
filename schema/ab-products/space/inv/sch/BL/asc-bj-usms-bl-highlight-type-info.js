/**
 * @author Keven.xi
 */


var abScHlRmByCatAndType = View.createController('abScHlRmByCatAndTypeController', {
	blId:"",
	flId:"",
	
    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abScHlRmByRmcatRmtype_DrawingPanel.appendInstruction("default", "", "");
        this.abScHlRmByRmcatRmtype_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abScHlRmByRmcatRmtype_TypeSumGrid.show(true);
    },
    
	afterInitialDataFetch:function(){
		this.getParentViewParameter();
		if (this.blId && this.flId && this.dwgname){
			displayFloor('abScHlRmByRmcatRmtype_DrawingPanel', this.blId,this.flId,this.dwgname);
			showSumGrid(this.blId,this.flId);
		}
	},
	
    abScHlRmByRmcatRmtype_TypeSumGrid_afterRefresh: function(){
		var title = String.format(getMessage('crossPanelTitle'), this.blId+"-"+this.flId);
	 	this.abScHlRmByRmcatRmtype_TypeSumGrid.setTitle(title);
		
        resetColorFieldValue('abScHlRmByRmcatRmtype_TypeSumGrid', 'abScHlRmByRmcatRmtype_DrawingPanel', 'rmtype.rm_type', 'rmtype.hpattern_acad', 'abScHlRmByRmcatRmtype_TypeSumGrid_legend');
    },
	
	getParentViewParameter:function(){
		if (valueExists(this.view.parameters)) {
			if (!this.blId) 
				this.blId = this.view.parameters['blId'];
			if (!this.flId) 
				this.flId = this.view.parameters['flId'];
			if (!this.dwgname) 
				this.dwgname = this.getFloorDwgName(this.blId, this.flId);
		}
	},
	
	getFloorDwgName:function(blId,flId){
		var res = new Ab.view.Restriction();
		res.addClause('fl.bl_id',blId,'=');
		res.addClause('fl.fl_id',flId,'=');
		var flDs = View.dataSources.get('ds_ab-sc-hl-rm-by-rmcat-rmtype_tree_fl');
		var rec = flDs.getRecord(res);
		var dwgname = rec.getValue('fl.dwgname');
		return dwgname;
		
	}
    
    
});

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abScHlRmByRmcatRmtype_SiteTree').lastNodeClicked;
	var siteName = currentNode.parent.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScHlRmByRmcatRmtype_SiteTree', title);
	
    var blId = currentNode.data['fl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dwgName = currentNode.data['fl.dwgname']
	
	abScHlRmByCatAndType.blId = blId;
	abScHlRmByCatAndType.flId = flId;
	
    displayFloor('abScHlRmByRmcatRmtype_DrawingPanel', blId,flId,dwgName);
    showSumGrid(blId,flId);
	
}

function showSumGrid(blId,flId){
	var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    var typeSumGrid = View.panels.get('abScHlRmByRmcatRmtype_TypeSumGrid');
    typeSumGrid.show(true);
    typeSumGrid.refresh(restriction);
}
/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
    if (selected) {
        View.openDialog('asc-bj-usms-bl-rm-em-eq-info.axvw', null, false, {
            width: 500,
            height: 350,
            closeButton: false,
			blId:pk[0],
			flId:pk[1],
			rmId:pk[2]
        });
        
        var drawingPanel = View.panels.get('abScHlRmByRmcatRmtype_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScHlRmByRmcatRmtype_SiteTree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noSite") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
	
	 if (treeNode.level.levelIndex == 2) {
        var floorId = treeNode.data['fl.fl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + floorId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

/**
 * display floor drawing for highlight report
 * @param {Object} drawingPanel
 * @param {Object} res
 * @param {String} title
 */
function displayFloor(drawingPanelId, blId,flId,dwgName){
	
    var drawingPanel = View.panels.get(drawingPanelId);
	var title = blId + "-" + flId;
	
    //if the seleted floor is same as the current drawing panel, just reset the highlight
    if (drawingPanel.lastLoadedBldgFloor == dwgName) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = dwgName;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}
/**
 * reset color field of the sumary grid
 * @param {string} gridPanelId
 * @param {string} drawingPanelId
 * @param {string} filedName
 * @param {string} hpFieldName
 * @param {string} colorfieldName
 */
function resetColorFieldValue(gridPanelId, drawingPanelId, filedName, hpFieldName, colorfieldName){
    var panel = View.panels.get(gridPanelId);
    var rows = panel.rows;
    var opacity = View.panels.get(drawingPanelId).getFillOpacity();
    
    for (var i = 0; i < rows.length; i++) {
        var val = rows[i][filedName];
        var color = '#FFFFFF';
        var hpval = rows[i][hpFieldName];
        if (hpval.length) 
            color = gAcadColorMgr.getRGBFromPattern(hpval, true);
        
        var cellEl = Ext.get(rows[i].row.cells.get(colorfieldName).dom);
        
        if (!hpval.length)
        	cellEl.setStyle('background-color', color);
        
        cellEl.setOpacity(opacity);
    }
}

