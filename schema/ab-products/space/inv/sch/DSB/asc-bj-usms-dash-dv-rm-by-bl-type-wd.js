/**
 * @author zhaoyongli
 */
var controller = View.createController('aschlRmByDpController', {
    dvId: "",
    dvName: "",
    //----------------event handle--------------------
    afterViewLoad: function(){
        var res = this.view.restriction;
        if (valueExistsNotEmpty(res)) {
            if (valueExistsNotEmpty(res['dv.dv_id'])) {
                this.dvId = res['dv.dv_id'];
            }
            else {
                this.dvId = res.findClause('dv.dv_id').value;
            }
        }
        else {
            var employee = AUSC_getEmployeeDivisionIdByEmail(View.user.email);
            if (valueExists(employee)) {
                this.dvId = employee.organization.divisionId;
            }
        }
        
        
        this.dvName = this.getDvNameById(this.dvId);
        
        var titleForDv = String.format(getMessage('drawingPanelTitle1'), this.dvId);
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
        document.getElementById("viewToolbar_title").innerHTML = this.dvName + "公房情况";
        
        
    },
	abScSearchRmLayoutByBuGridReport_onChangeRmName:function(){
	    var selectedRecordList = this.abScSearchRmLayoutByBuGridReport.getSelectedRecords();
        if (selectedRecordList.length == 0) {
            View.alert('请选择要修改的房间');
            return;
        }
        this.rmNameChangePanel.refresh(null, true);
        this.rmNameChangePanel.showInWindow({
            width: 650,
            height: 250
        });
	},
    getDvNameById:function(dvId){
		var dvName = "";
		var parameters = {
            tableName: 'dv',
            fieldNames: toJSON(['dv.dv_name']),
            restriction: "dv.dv_id = '" + dvId + "' "
        
        };
        try {
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
        if (result.data.records.length > 0) {
            dvName = result.dataSet.records[0].getValue("dv.dv_name");
        }
		return dvName;
	},
    
    afterInitialDataFetch: function(){
    
        res = {
            "dv.dv_id": this.dvId
        }
        this.abScSearchRmLayoutByDvCountPeopleGrid.refresh(res);
        
        this.abSpHlRmByDp_flGrid.enableSelectAll(false);
        this.onShowDpGrid();
        var dvId = this.dvId;
        var highlightResc = "";
        if (dvId) {
            highlightResc += " AND rm.dv_id = '" + dvId + "'";
        }
        else {
            highlightResc += " AND rm.dv_id IS NOT NULL";
        }
        var grid = View.panels.get("abSpHlRmByDp_flGrid");
        if (grid.rows[0]) {
            grid.rows[0].row.select();
            View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(grid.rows[0], null);
            View.dataSources.get('ds_ab-sp-hl-rm-by-dp_drawing_rmHighlight').addParameter('rmDv', highlightResc);
            
            View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(grid.rows[0], null);
        }
        
        var mainlayout=View.getLayoutManager('mainLayout');
 	 	var nestedCenterWest=View.getLayoutManager('nested_center_west');
 	 	var nestedCenter=View.getLayoutManager('nested_center');
 	 	var nestedCenterLeft=View.getLayoutManager('nested_center_left');
     	var navigationRegion = View.getOpenerView().getLayoutAndRegionById('navigatorRegion');
  	 	var toolBarRegion = View.getOpenerView().getLayoutAndRegionById('toolbarRegion');
  	 	var dashboardTabsRegion = View.getOpenerView().getLayoutAndRegionById('dashboardTabsRegion');
  	 	var toolBarPanel;
  	 	if(toolBarRegion){
  	 		toolBarPanel=toolBarRegion.layoutManager.getRegionPanel(toolBarRegion.region);
  	 	}
     		
  	 	if(dashboardTabsRegion){
  	 		dashboardTabsPanel=dashboardTabsRegion.layoutManager.getRegionPanel(dashboardTabsRegion.region);
  	 	}
     	var expandView = this.abSpHlRmByDp_DrawingPanel.actions.get('showDwgView');
      	 jQuery(expandView.button.el.dom).toggle(function(){
      		 mainlayout.collapseRegion('south');
      		 nestedCenterWest.collapseRegion('west');
      		 nestedCenterLeft.collapseRegion('north');
      		 nestedCenter.collapseRegion('east');
      		 //nestedNorth.collapseRegion('east');
          	 expandView.setTitle("返回");
          	 if(toolBarPanel){
          		 toolBarPanel.collapse(false);
          	 }
          	 if(dashboardTabsRegion){
          		 dashboardTabsRegion.layoutManager.collapseRegion("north");
          	 }
          	
      	 },function(){
      		 mainlayout.expandRegion('south');
      		 nestedCenterWest.expandRegion('west');
      		 nestedCenterLeft.expandRegion('north');
      		 nestedCenter.expandRegion('east');
          	 
          	 expandView.setTitle("全屏");
          	 if(toolBarPanel){
          		 toolBarPanel.expand(false);
          	 }
          	 if(dashboardTabsRegion){
          		 dashboardTabsRegion.layoutManager.expandRegion("north");
          	 }
      	 });
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
        
        View.openDialog('asc-bj-usms-data-edit-org-dialog-wd.axvw', '', false, {
            width: 600,
            height: 500,
            closeButton: false,
            maxsize: false,
            dvId: controller.dvId,
            callback: function(){
                grid.refresh();
            }
        });
        
    },
    rmNameChangePanel_onSave:function(){
		 var selectedRecordList = this.abScSearchRmLayoutByBuGridReport.getSelectedRecords();
	        var rmName = this.rmNameChangePanel.getFieldValue('rm.name');
	        var controller = this;
	        View.confirm("确定修改?", function(button){
	            if (button == 'yes') {
	                for (var i = 0; i < selectedRecordList.length; i++) {
	                    var record = selectedRecordList[i];
	                    var blId = record.getValue('rm.bl_id');
	                    var flId = record.getValue('rm.fl_id');
	                    var rmId = record.getValue('rm.rm_id');
	                    controller.updateRmName(blId, flId, rmId,rmName);
	                    controller.insertIntoChangeHistory(blId, flId, rmId,rmName);
	                }
	                controller.rmNameChangePanel.closeWindow();
	                controller.abScSearchRmLayoutByBuGridReport.refresh();
	            }
	        });
	},
	updateRmName: function(blId, flId, rmId, rmName){
			var restriction = {
		            "rm.bl_id": blId,
		            "rm.fl_id": flId,
		            "rm.rm_id": rmId
		        };
		    var record = this.abScSearchRmLayoutByBuGridReportDS.getRecord(restriction);
		    record.isNew=false;
		    record.setValue("rm.name", rmName);
		    this.abScSearchRmLayoutByBuGridReportDS.saveRecord(record);
		    
   	},
	insertIntoChangeHistory:function(blId, flId, rmId, rmName){
		var record = new Ab.data.Record({
			'rm_change_history.name': rmName,
			'rm_change_history.bl_id':blId,
			'rm_change_history.fl_id': flId,
			'rm_change_history.rm_id': rmId
		}, true);
		try{
			this.rmNameChangeDs.saveRecord(record)
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
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
            width: 814,
            height: 420,
            closeButton: false,
            blId: pk[0],
            flId: pk[1],
            rmId: pk[2]
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
        var title = String.format(getMessage('drawingPanelTitle1'), dvId);
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
        if (row['rm.area_shiyong.raw']) {
            areaShiyong = row['rm.area_shiyong.raw'];
        }
        if (!isNaN(parseFloat(areaShiyong))) {
            totalAreaShiyong += parseFloat(areaShiyong);
        }
        
        
        
        var countRm = row['rm.count_rm'];
        if (!isNaN(parseInt(countRm))) {
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
    addColumn(gridRow, 1, ds.formatValue('rm.area_shiyong', totalAreaShiyong + "", false));
    
}


