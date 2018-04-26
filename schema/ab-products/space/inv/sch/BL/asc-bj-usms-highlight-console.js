var abScHlRmByCatAndTypeController = View.createController('abScHlRmByCatAndTypeController', {
	lastClickedDwgName:null,
	lastClickedBlName:null,
	lastClickedFl:null,
    afterViewLoad: function(){
    	this.abScHlRmByDv_SiteTree.createRestrictionForLevel = createRestrictionForLevel;
    	this.drawingPanel.appendInstruction("default", "", "");
        this.drawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abScHlRmByDv_SumGrid.show(true);
//        this.abScHlRmByDv_SiteTree.addParameter('sitetIdSql', "");
//        this.abScHlRmByDv_SiteTree.addParameter('blId', "IS NOT NULL");
        jQuery('#sbfFilterPanel input').each(function(){
			jQuery(this).keydown( function (e) {
				if(e.keyCode == 13){
					this.blur();
					abScHlRmByCatAndTypeController.refreshTreeview();
					this.focus();					
				}
			});
		});
    },
    afterInitialDataFetch:function(){
    	 //var toExpand = View.getLayoutAndRegionById("treePosition");
    	 //var panel = toExpand.layoutManager.getRegionPanel(toExpand.region);
         //panel.collapse(false);
    	 //console.log(toExpand);
    	var mainlayout=View.getLayoutManager('mainLayout');
   	 	var drawingLayoutSub=View.getLayoutManager('drawingLayoutSub');
   	 	var drawingLayout=View.getLayoutManager('drawingLayout');
   	 	var treeLayout=View.getLayoutManager('treeLayout');
   	 	var navigationRegion = View.getOpenerView().getLayoutAndRegionById('navigatorRegion');
   	 	var toolBarRegion = View.getOpenerView().getLayoutAndRegionById('toolbarRegion');
	   	var navigationPanel = navigationRegion.layoutManager.getRegionPanel(navigationRegion.region);
		var toolBarPanel = toolBarRegion.layoutManager.getRegionPanel(toolBarRegion.region);
   	 	var expandView = this.drawingPanel.actions.get('showDwgView');
    	 jQuery(expandView.button.el.dom).toggle(function(){
    		 mainlayout.collapseRegion('north');
        	 treeLayout.collapseRegion('west');
        	 drawingLayout.collapseRegion('south');
        	 drawingLayoutSub.collapseRegion('west');
        	 
        	 navigationPanel.collapse(false);
        	 toolBarPanel.collapse(false);
        	 expandView.setTitle("返回");
        	 fullScreen();
    	 },function(){
    		 mainlayout.expandRegion('north');
        	 treeLayout.expandRegion('west');
        	 drawingLayout.expandRegion('south');
        	 drawingLayoutSub.expandRegion('west');
        	 
        	 navigationPanel.expand(false);
        	 toolBarPanel.expand(false);
        	 expandView.setTitle("全屏显示");
        	 fullScreen();
    	 });
    	 
    	
    	 //layout.expandRegion('north');
    },
    sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
    },
//	drawingPanel_onShowDwgView:function(){
//		   if (this.drawingPanel.dwgLoaded)
//		   {
//		   	  var recValue = this.drawingPanel.getRecValues(0);
//			  var blId = recValue["rm.bl_id"];
//			  var flId = recValue["rm.fl_id"];
//			  var dwgName = recValue["rm.dwgname"];
//			  if(typeof(dwgName)=='undefined'){
//				  dwgName=this.lastClickedDwgName;
//			  }
//			  
//			  	View.openDialog('asc-bj-usms-show-fl-dwg.axvw', null, false, {
//			  		maximize:true,
//			  		closeButton: false,
//			  		blId: blId,
//			  		flId: flId,
//			  		dwgName: dwgName
//			  	});
//			  
//		   }
//	},
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        var treePanel = View.panels.get("abScHlRmByDv_SiteTree");
        var siteId = consolePanel.getFieldValue('property.site_id');
        if (siteId) {
            treePanel.addParameter('siteId', " like'" + siteId + "%'");
        }
        else {
            treePanel.addParameter('siteId', "IS NOT NULL");
        }
        
        var propertyId = consolePanel.getFieldValue('bl.pr_id');
        if (propertyId) {
            treePanel.addParameter('prId', " like'" + propertyId + "%'");
        }
        else {
            treePanel.addParameter('prId', " IS NOT NULL ");
        }
		
        var buildingId = consolePanel.getFieldValue('bl.name');
        if (buildingId) {
            treePanel.addParameter('blId', " like '" + buildingId + "%'");
        }
        else {
            treePanel.addParameter('blId', "IS NOT NULL");
        }
        
        var bl_use = consolePanel.getFieldValue('bl.use1');
		if (bl_use) {
			treePanel.addParameter('blUseFor',
					" = '" + bl_use + "'");
		} else {
			treePanel.addParameter('blUseFor', "IS NOT NULL");
		}
       
        
        treePanel.refresh();
//        this.curTreeNode = null;
    },
    sbfFilterPanel_onClear:function(){
    	this.abScHlRmByDv_SiteTree.refreshClearAllFilters();
    },
    abScHlRmByDv_SumGrid_afterRefresh:function(){
    	var title
    	if(this.lastClickedBlName!=null){
    		 title=this.lastClickedBlName;
    	}
    	if(this.lastClickedFl!=null){
    		title+=' - ' +this.lastClickedFl;
    	}
    	
    	setPanelTitle('abScHlRmByDv_SumGrid', title);
    }
});



function onblTreeClick(){
    var currentNode = View.panels.get('abScHlRmByDv_SiteTree').lastNodeClicked;
    var blId = currentNode.data['bl.bl_id'];
    var blName = currentNode.data['bl.name'];
    var siteId = currentNode.data['bl.site_id']; 
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.site_id", siteId, "=");
    abScHlRmByCatAndTypeController.lastClickedBlName=blName;
    var facultySumGrid = View.panels.get('abScHlRmByDv_SumGrid');
    facultySumGrid.show(true);
    facultySumGrid.refresh(restriction);
}
/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abScHlRmByDv_SiteTree').lastNodeClicked;
	var siteName = currentNode.parent.parent.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScHlRmByDv_SiteTree', title);
	
	
    var blId = currentNode.data['fl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dwgName = currentNode.data['fl.dwgname']
    var blName = currentNode.parent.data['bl.name'];
    spaceExpressConsoleDrawing.selectedFloors=[];
    spaceExpressConsoleDrawing.selectedFloors.push({
        bl_id: blId,
        fl_id: flId,
        dwgname: dwgName
    });
    abScHlRmByCatAndTypeController.lastClickedDwgName=dwgName;
    abScHlRmByCatAndTypeController.lastClickedBlName=blName;
    abScHlRmByCatAndTypeController.lastClickedFl=flId;
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    var drawingPanel = View.panels.get('drawingPanel');
    title = blName + "-" + flId;
    displayFloor(drawingPanel, currentNode, title);
    
    var facultySumGrid = View.panels.get('abScHlRmByDv_SumGrid');
    facultySumGrid.show(true);
    facultySumGrid.refresh(restriction);
}

/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
    if (selected) {
		View.openDialog('asc-bj-usms-bl-rm-em-eq-info.axvw', null, false, {
            width: 700,
            height: 350,
            closeButton: false,
			blId:pk[0],
			flId:pk[1],
			rmId:pk[2]
        });
		
		var drawingPanel = View.panels.get('drawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScHlRmByDv_SiteTree') {
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
        var prId = treeNode.data['property.pr_id'];
        var prName = treeNode.data['property.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + prId + prName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var buildingId = treeNode.data['bl.bl_id'];
		var buildingName = treeNode.data['bl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingId+" "+buildingName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
	
	 if (treeNode.level.levelIndex == 3) {
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
function displayFloor(drawingPanel, currentNode, title){
    var blId = currentNode.data['fl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dwgName = currentNode.data['fl.dwgname'];
	
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

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        var siteId = parentNode.data['site.site_id'];
        if (!siteId && level == 1) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('property.site_id', '', 'IS NULL', 'AND', true);
        }
		var prId = parentNode.data['property.pr_id'];
		if (level == 2) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('bl.pr_id', prId, '=', 'AND', true);
        }
    }
    return restriction;
}


var spaceExpressConsoleDrawing = View.createController('spaceExpressConsoleDrawing', {
	 selectedFloors:[],
	 drawingPanel:null,
	 afterViewLoad:function(){
		this.drawingPanel=this.drawingPanel; 
	 },
	 onExportDrawing: function(exportType) {
			if (exportType == 'pdf') {
				this.onExportingDrawingPdf();
			} else if (exportType == 'docx') {
				this.onExportingDrawingDOCX();
			} else {
				View.showMessage( getMessage("notSupportedExportingFormat") );
			}
	    },
	    
	    /**
	     * Export the drawings in the location list to pdf format.
	     */
	    onExportingDrawingPdf: function() {
	    	if ("None" == this.drawingPanel.currentHighlightDS) {
	    		View.showMessage( getMessage("noHighlight") );
	    	} else if ("highlightRoomStandard" == this.drawingPanel.currentHighlightDS || "labelRoomStandardDs" == this.drawingPanel.currentLabelsDS) {
	    		View.showMessage( getMessage("noHighlightOnRoomStandard") );
	    	} else {
	    		this.exportDocxReport(null, this.drawingPanel, this.selectedFloors);
	    	}
	    },
	    
	    /**
	     * Export the drawings in the location list to docx format.
	     */
	    onExportingDrawingDOCX: function() {
	    	if ("None" == this.drawingPanel.currentHighlightDS) {
	    		View.showMessage( getMessage("noHighlightDOCX") );
	    	} else if ("highlightRoomStandard" == this.drawingPanel.currentHighlightDS || "labelRoomStandardDs" == this.drawingPanel.currentLabelsDS) {
	    		View.showMessage( getMessage("noHighlightOnRoomStandardDOCX") );
	    	} else {
	    		this.exportDocxReport(null, this.drawingPanel, this.selectedFloors);
	    	}
	    },
	    exportDocxReport: function(filter,drawingPanel,selectedFloors) {
			this.printReport( filter,drawingPanel,selectedFloors, 'docx') ; 
	    }, 

		/**
	     * Print the drawing Pdf report.
	     */
	    printReport: function(filter,drawingPanel,selectedFloors,exportType) {
	    	var pdfRestrictions = {};
	    	var pdfParameters = {};
	    	pdfParameters.legends = {};
	    	
			//get highlight and label dataSource ids from drawing control
	    	var highligtDS = drawingPanel.currentHighlightDS;
	    	var labelDS = drawingPanel.currentLabelsDS;
	    	var legendDS = highligtDS+ '_legend';
	    	
			//prepare restriction from filter and selected floors
			//var passedRestrictions = {	};
			//passedRestrictions[highligtDS] =  filter.restriction;
			//passedRestrictions[labelDS] =  filter.restriction;

			//highlight dataSource is required for paginated report
	    	if(highligtDS === '' || highligtDS === 'None'){
	    		highligtDS = 'dummyDs';
	    	}

			//pass drawingName to skip core's expensive process to get it
			//pdfParameters.drawingName = selectedFloor.dwgName;
			//dataSources defined in a separate axvw which is shared with drawing control axvw
			pdfParameters.dataSources = {viewName:'ab-sp-console-export-drawing-share-ds.axvw', required:highligtDS + ';' + labelDS};	
			
			pdfParameters.highlightDataSource = 'rm:'+highligtDS;
			if(labelDS !== '' && labelDS !== 'None'){
				pdfParameters.labelsDataSource = 'rm:'+labelDS;
				pdfParameters.labelHeight = "rm:3";
			}
			
			if(highligtDS !== 'dummyDs'){
				//add legend dataSource to required list
				pdfParameters.dataSources.required = pdfParameters.dataSources.required +  ';' + legendDS;
				
				//if legend panels are not defined in paginated report view, you could define legend panels dynamically
				//pdfParameters.legends.panelDefs= [this.getLegendPanel(legendDS)];
				
				//required legend panel
				pdfParameters.legends.required = 'panel_'+legendDS;
				
				//show room border highlight in PDF
				//pdfParameters.borderHighlight='rm:5';
			}
			
		  //prepare parameters from filter's parameters
//			for ( attrubute in filter.parameters ) {
//				if ('totalArea' == attrubute) {
//					var value = filter.parameters[attrubute];
//					var indexOfTotalArea = value.indexOf("total_area");
//					var indexOfTotalCount = value.indexOf("total_count");
//					if (indexOfTotalArea>0 && indexOfTotalCount>0) {
//						pdfParameters['totalArea'] = value.substring(11,indexOfTotalCount-5);
//						pdfParameters['totalCount'] = value.substring(indexOfTotalCount+12);  
//					} else if (indexOfTotalCount>0) {
//						pdfParameters['totalCount'] = value.substring(12);  									
//					} else if (indexOfTotalArea>0) {
//						pdfParameters['totalArea'] = value.substring(11);  																		
//					}
//				} else	{
//					pdfParameters[attrubute+'ForTotalCal']=filter.parameters[attrubute].replace(/rm\./g,"r.");
//					pdfParameters[attrubute] = filter.parameters[attrubute];
//				}
//		   }

			if(valueExistsNotEmpty(pdfParameters.highlightDataSource)){
				var viewName = "ab-sp-console-export-drawing-"+exportType+".axvw";
				View.openPaginatedReportDialog(viewName, null, pdfParameters);	
	    	}
	    }
});

function fullScreen() { 
	var el = document.documentElement; 
	var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen; 

	if (typeof rfs != "undefined" && rfs) { 
	rfs.call(el); 
	} else if (typeof window.ActiveXObject != "undefined") { 
	// for Internet Explorer 
	var wscript = new ActiveXObject("WScript.Shell"); 
		if (wscript != null) { 
		wscript.SendKeys("{F11}"); 
		} 
	} 
} 