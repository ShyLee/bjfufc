/**
 * @author keven.xi
 */
var controller = View.createController('hlblController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.locateBuilding_cadPanel.appendInstruction("default", "", getMessage("falsh_headerMessage"));
    },
    sbfFilterPanel_onShow: function(){
	var rm_cat = this.sbfFilterPanel.getFieldValue("rmcat.rm_cat");
    
	if (rm_cat == ''){
		alert("请输入房屋类别!")
		return;
	}
	
    this.blGrid.addParameter("rmOfNullRmcat","='" + rm_cat+"'");
    this.blGrid.refresh();
    
    var grid = View.panels.get('blGrid');
    //var grid = View.dataSources.get("ds_ab-campus-map_grid_bl");
 //   var blIdR = grid.getDataRows();
  //  var blIdR = blGridDS.getRecords();
    //var BlIdParam = new Array();
    var BlIdParam ="bl_id  IN (";
    var dwgname;
    
    for (var i = 0; i <  grid.rows.length; i++) {
    	 var dataRow =  grid.rows[i];
    	// var blId = grid.getPrimaryKeysForRow(grid.rows[i]);
      //  var blId = blIdR[i].getValue('bl.bl_id');
      //  BlIdParam.push(blId);
    	 var blId = dataRow['bl.bl_id'];
    	 
    	// var blId = dataRow["bl.bl_id"]
    	 if(i==grid.rows.length-1){
    		 BlIdParam=BlIdParam+"'"+blId+"')";
    	 }else{
    	 BlIdParam=BlIdParam+"'"+blId+"',";
    	 }
        if(dwgname=='undefined' || dwgname=='' || dwgname==""){
        	dwgname =dataRow['bl.dwgname'];
        	// dataRow.cells['1'].innerHTML = r + 1;
        }
    }
    this.highlightBuilding(BlIdParam,'UIBE');
    
    },
    
    highlightBuilding: function(BlIdParam,dwgname) {
    	  var highDs = View.dataSources.get("ds_ab-campus-map_drawing_blHighlight");
    	    highDs.addParameter('blId',BlIdParam);
    		var drawingPanel = View.getControl('', 'locateBuilding_cadPanel');
    		
    		  //var tempDwgname = 'UIBE';
    		    if (drawingPanel.lastLoadedDwgname == dwgname) {
    		        drawingPanel.clearHighlights();
    		        drawingPanel.applyDS('highlight');
    		    }
    		    else {
    		        var dcl = new Ab.drawing.DwgCtrlLoc('', '', '', dwgname);
    		        drawingPanel.addDrawing(dcl, null);
    		        drawingPanel.lastLoadedDwgname = dwgname;
    		    }
    }
    
});

function highlightSelectedBuilding(){
    // Call the drawing control to highlight the selected building
    var blGrid = View.panels.get("blGrid");
    var selectedRow = blGrid.rows[blGrid.selectedRowIndex];
    var blId = selectedRow['bl.bl_id'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("bl.bl_id", blId, "=");
    
    var blDetailPanel = View.panels.get('bl_detail');
    blDetailPanel.refresh(restriction);
    blDetailPanel.show(true);
    blDetailPanel.showInWindow({
        width: 400,
        height: 550
    });

}


