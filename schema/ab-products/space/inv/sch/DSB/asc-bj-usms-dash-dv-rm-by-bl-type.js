/**
 * @author Huangmuliang
 */
var controller = View.createController('aschlRmByDpController', {
	dvId:"",
	
    //----------------event handle--------------------
    afterViewLoad: function(){
    	var countPeopleGrid=this.abScSearchRmLayoutByDvCountPeopleGrid;
    	countPeopleGrid.addParameter('gb', "='干部'");
    	countPeopleGrid.addParameter('jiaoshi', "='教师'");
    	countPeopleGrid.addParameter('gongren', "='工人'");
    	countPeopleGrid.addParameter('fudaoyuan', "='辅导员'");
    	countPeopleGrid.addParameter('boshihou', "='博士后'");
		var res=this.view.restriction;
		if (valueExistsNotEmpty(res)) {
			if (valueExistsNotEmpty(res['dv.dv_id'])) {
				this.dvId = res['dv.dv_id'];
			}
			else {
				this.dvId = res.findClause('dv.dv_id').value;
			}
		}else{
			var employee= AUSC_getEmployeeDivisionIdByEmail(View.user.email);
			if(valueExists(employee))
			{
				this.dvId = employee.organization.divisionId;
			}
		}
    
    	var dvId=this.dvId;
		
		var titleForDv = String.format(getMessage('drawingPanelTitle1'),this.dvId );
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle'));
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("addDrawing", "", titleForDv);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('ondwgload', setDrawingTitle);
		
        this.abSpHlRmByDp_flGrid.addEventListener('onMultipleSelectionChange', function(row){
        
            var highlightResc = "";
            if (valueExistsNotEmpty(dvId)) {
                highlightResc += " AND rm.dv_id = '" + dvId + "'";
            }
            else {
                highlightResc += " AND rm.dv_id IS NOT NULL";
            }
            View.dataSources.get('ds_ab-sp-hl-rm-by-dp_drawing_rmHighlight').addParameter('rmDv', highlightResc);
           
            View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(row, null);
           
        });
            
    	this.abScSearchRmLayoutByDvGrid.buildPostFooterRows = addTotalRowForBu;
    	 document.getElementById("viewToolbar_title").innerHTML = this.dvId+"公房情况";
    	
    	
    },
    
    afterInitialDataFetch: function(){
        this.abSpHlRmByDp_flGrid.enableSelectAll(false);
		this.onShowDpGrid();
		var dvId=this.dvId;
		var highlightResc = "";
		if (dvId) {
            highlightResc += " AND rm.dv_id = '" + dvId + "'";
        }
        else {
            highlightResc += " AND rm.dv_id IS NOT NULL";
        }
		var grid = View.panels.get("abSpHlRmByDp_flGrid");
		if(grid.rows[0]){
			grid.rows[0].row.select();
			View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(grid.rows[0], null);
			
            
            View.dataSources.get('ds_ab-sp-hl-rm-by-dp_drawing_rmHighlight').addParameter('rmDv', highlightResc);
           
            View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(grid.rows[0], null);
    	}
    },
    
    onShowDpGrid: function(){
        blId = "";
        var dvRes = " IS NOT NULL";
        var blRes = " IS NOT NULL";
        if (dvId) {
            dvRes = " = '" + dvId + "'";
        }
        if (blId) {
            blRes = " = '" + blId + "'";
        }
        
        this.abSpHlRmByDp_flGrid.addParameter('dvRes', dvRes);
        this.abSpHlRmByDp_flGrid.addParameter('blRes', blRes);
        this.abSpHlRmByDp_flGrid.refresh();
    },
    
    abScSearchRmLayoutByBuGridReport_viewUser_onClick: function(row){
        viewUser(row);
    },
   
    abScSearchRmLayoutByDvCountPeopleGrid_onEdit: function(){
        var controller = this;
		
		var grid = View.getControl('self', "abScSearchRmLayoutByDvCountPeopleGrid");
	   
        View.openDialog('asc-bj-usms-data-edit-org-dialog.axvw', '', false, {
			width:600, 
			height:500,
			closeButton:false,
			maxsize:false,
			dvId:controller.dvId,
			callback: function() {
                grid.refresh();
            }
		});
        
    }
});

var dvId;
var blId;



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
		
		var drawingPanel = View.panels.get('abSpHlRmByDp_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
	
}

/**
 * set drawing panel title
 */
function setDrawingTitle(){
    if (dvId) {
		var title = String.format(getMessage('drawingPanelTitle1'),dvId );
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("addDrawing", '', title);
    }
    else {
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("default", '');
    }
}

function viewUser(row){
    var blId = row.record['rm.bl_id'];
    var flId = row.record['rm.fl_id'];
    var rmId = row.record['rm.rm_id'];
    var restriction = new Ab.view.Restriction();
    restriction.addClause('em.bl_id', blId, '=');
    restriction.addClause('em.fl_id', flId, '=');
    restriction.addClause('em.rm_id', rmId, '=');
    
    var detailPanel = View.panels.get('abScSearchRmLayoutByBuGridReportShow');
    detailPanel.refresh(restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 800,
        height: 600
    });
}


function viewBuilding(row){
    var buId = row.record['dv.bu_id'];
    var dvId = row.record['dv.dv_id'];
    
    View.openDialog('asc-bj-usms-hl-rm-by-dp.axvw', null, false, {
        width: 800,
        height: 600,
        closeButton: false,
        dvId: dvId
    });
    
    
}

/**
* add total row if there are more lines
* @param {Object} parentElement
*/
function addTotalRowForBu(parentElement){
   if (this.rows.length < 2) {
       return;
   }
	
	var totalAreaShiyong = 0.0;
	var totalCountRm = 0;
   for (var i = 0; i < this.rows.length; i++) {
       var row = this.rows[i];
       
		var areaShiyong = row['rm.area_shiyong'];
		if(row['rm.area_shiyong.raw']){
			areaShiyong = row['rm.area_shiyong.raw'];
		}
		if (!isNaN(parseFloat(areaShiyong))) {
			totalAreaShiyong += parseFloat(areaShiyong);
		}
		
		
		
		var countRm = row['rm.count_rm'];
		if (!isNaN(parseInt(countRm))){
			totalCountRm += parseInt(countRm);
		}
   }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);

	var ds = this.getDataSource();
	
	
   // create new grid row and cells containing statistics
   var gridRow = document.createElement('tr');
   parentElement.appendChild(gridRow);
   // column 1: 'Total' title
   addColumn(gridRow, 1, '');
	// column 2: total area
   addColumn(gridRow, 1, '合计');
   // column 3: total area of Structure
   addColumn(gridRow, 1, ds.formatValue('rm.count_rm', totalCountRm, false));
   // column 4: 'Total' title
   addColumn(gridRow, 1,ds.formatValue('rm.area_shiyong', totalAreaShiyong+"", false));
	
}
