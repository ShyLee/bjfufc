var ascBjUsmsHouseQryRentableRm = View.createController('ascBjUsmsHouseQryRentableRm', {

    restriction: "",
    propertyId: "",
    blId: "",
    rmId: "",
    huxing: "",
    defaultWhere: " rm.rm_type in  (SELECT rmtype.rm_type FROM rmtype WHERE  rmtype.is_zzf=1) and rm.ruzhu_status=0 and rm.is_req=0",
    consoleRmRes: "",
    
    afterViewLoad: function(){
    
    },
    rmConsole_onShow: function(){
        this.getConsoleRestriction();
        if (this.propertyId) {
            this.propertyTree.addParameter("paraPrId", "pr_id ='" + this.propertyId + "' ");
        }
        if (this.consoleRmRes) {
            this.propertyTree.addParameter("consoleRmRes", this.consoleRmRes);
        }
        else {
            this.propertyTree.addParameter("consoleRmRes", " 1=1 ");
        }
        this.propertyTree.refresh();
        
        // 隐藏panel
        this.gridRmTotal.show(false);
        this.gridRmDetails.show(false);
    },
    
    getConsoleRestriction: function(){
        this.consoleRmRes = "";
        var consolePanel = View.panels.get("rmConsole");
        this.propertyId = consolePanel.getFieldValue('bl.pr_id');
        this.blId = consolePanel.getFieldValue('bl.bl_id');
        this.rmId = consolePanel.getFieldValue('rm.rm_id');
        this.huxing = consolePanel.getFieldValue('rm.huxing');
        this.restriction = new Ab.view.Restriction();
        if (this.propertyId) {
            this.restriction.addClause("bl.pr_id", this.propertyId, "=");
        }
        if (this.blId) {
            this.restriction.addClause("bl.bl_id", this.blId, "=");
            //this.consoleRmRes += " bl.bl_id ='" + this.blId + "' 1=1  ";
        }
        if (this.rmId) {
            this.restriction.addClause("rm.rm_id", this.rmId, "=");
            //this.consoleRmRes += " rm.rm_id ='" + this.rmId + "' 1=1 ";
        }
        if (this.huxing) {
            this.restriction.addClause("rm.huxing", this.huxing, "=");
            //this.consoleRmRes += " rm.huxing ='" + this.huxing + "' 1=1 ";
        }
    },
    
    onPropertyTreeClick: function(){
        var currentNode = View.panels.get('propertyTree').lastNodeClicked;
        var prId = currentNode.data['property.pr_id'];
        setPanelTitle('gridRmTotal', "[" + prId +
        ']的可租房间');
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bl.pr_id", prId, "=");
        var consoleWhere = this.defaultWhere;
        
        if (this.blId) {
            consoleWhere += " and rm.bl_id='" + this.blId + "'";
        }
        if (this.rmId) {
            consoleWhere += " and rm.rm_id='" + this.rmId + "'";
        }
        if (this.huxing) {
            consoleWhere += " and rm.huxing='" + this.huxing + "'";
        }
        this.gridRmTotal.addParameter("consoleWhere", consoleWhere);
        this.gridRmTotal.refresh(restriction);
    },
    onBlTreeClick: function(){
        var currentNode = View.panels.get('propertyTree').lastNodeClicked;
        var blId = currentNode.data['bl.bl_id'];
        var name = currentNode.data['bl.name'];
        setPanelTitle('gridRmTotal', "[" + name +
        ']的可租房间');
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", blId, "=");
        var consoleWhere = this.defaultWhere;
        if (this.rmId) {
            consoleWhere += " and rm.rm_id='" + this.rmId + "'";
        }
        if (this.huxing) {
            consoleWhere += " and rm.huxing='" + this.huxing + "'";
        }
        this.gridRmTotal.addParameter("consoleWhere", consoleWhere);
        this.gridRmTotal.refresh(restriction);
    },
    onClickShowDetail: function(row){
        var rmGrid = View.panels.get("gridRmTotal");
        var selectedIndex = rmGrid.selectedRowIndex;
        var blId = rmGrid.rows[selectedIndex]["rm.bl_id"];
        var name = rmGrid.rows[selectedIndex]["bl.name"];
        var huxing = rmGrid.rows[selectedIndex]["rm.huxing"];
        var huxingValue = rmGrid.rows[selectedIndex]["rm.huxing.raw"];
        var restriction = new Ab.view.Restriction();
        if (this.rmId) {
            restriction.addClause('rm.rm_id', this.rmId, '=');
        }
        restriction.addClause('rm.bl_id', blId, '=');
        restriction.addClause('rm.huxing', huxingValue, '=');
        
        var report = View.panels.get('gridRmDetails');
        
        setPanelTitle('gridRmDetails', "[" + name + "][" + huxing + ']的可租房间');
        report.refresh(restriction);
        report.show(true);
    }
});

function afterGeneratingTreeNode(treeNode){

    if (treeNode.tree.id != 'propertyTree') {
        return;
    }
    var labelText0 = "";
    
    if (treeNode.level.levelIndex == 0) {
        var prId = treeNode.data['bl.pr_id'];
        labelText0 = "<span class='" + treeNode.level.cssClassName + "'>" +
        prId +
        " </span> ";
        treeNode.setUpLabel(labelText0);
    }
    
    if (treeNode.level.levelIndex == 1) {
        var blId = treeNode.data['bl.bl_id'];
        var blName = treeNode.data['bl.name'];
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" +
        blId +
        " " +
        blName +
        "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function clearValue1(){
    var rmConsole = View.panels.get("rmConsole");
    rmConsole.setFieldValue("bl.bl_id", "");
    rmConsole.setFieldValue("rm.rm_id", "");
    
}

function clearValue2(){
    var rmConsole = View.panels.get("rmConsole");
    rmConsole.setFieldValue("rm.rm_id", "");
}

function afterGeneratingTreeNode(treeNode){

    if (treeNode.tree.id != 'propertyTree') {
        return;
    }
    
    var labelText0 = "";
    if (treeNode.level.levelIndex == 0) {
        var prId = treeNode.data['property.pr_id'];
        labelText0 = "<span class='" + treeNode.level.cssClassName + "'>" +
        prId +
        "</span> ";
        treeNode.setUpLabel(labelText0);
    }
    
    var labelText1 = "";
    
    if (treeNode.level.levelIndex == 1) {
        var blId = treeNode.data['bl.bl_id'];
        var blName = treeNode.data['bl.name'];
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" +
        blId +
        " " +
        blName +
        "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function showDetail(row){
    var gridRmDetails = View.panels.get('gridRmDetails');
    var index = gridRmDetails.selectedRowIndex;
    var selectRow = gridRmDetails.rows[index];
    
    var rmId = selectRow['rm.rm_id'];
    var flId = selectRow['rm.fl_id'];
    var blId = selectRow['rm.bl_id'];
    var dwgname = selectRow['rm.dwgname'];
    
    var restriction = new Ab.view.Restriction();
    
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    restriction.addClause("rm.rm_id", rmId, "=");
    restriction.addClause("rm.dwgname", dwgname, '=');
    var drawingPanel = View.panels.get('drawingPanel');
    title = blId + "-" + flId;
    displayFloor(drawingPanel, selectRow, title, restriction);
}

function displayFloor(drawingPanel, selectRow, title, restriction){
    var blId = selectRow['rm.bl_id'];
    var flId = selectRow['rm.fl_id'];
    var rmId = selectRow['rm.rm_id'];
    var dwgName = selectRow['rm.dwgname'];
    
    // if the seleted floor is same as the current drawing panel, just reset the
    // highlight
    if (drawingPanel.lastLoadedBldgFloor == dwgName) {
        drawingPanel.clearHighlights();
        var opts_selectable = new DwgOpts();
        opts_selectable.rawDwgName = dwgName;
        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
        drawingPanel.setSelectColor('#FFD700');
        drawingPanel.highlightAssets(opts_selectable);
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, rmId, dwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = dwgName;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
    
    // var report = View.panels.get('drawingPanel');
    //drawingPanel.refresh(restriction);
    drawingPanel.showInWindow({
        width: 800,
        height: 600
    });
}
