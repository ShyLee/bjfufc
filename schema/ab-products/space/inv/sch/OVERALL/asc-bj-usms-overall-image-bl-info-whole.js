/**
 * @author Keven.xi
 */
var  imageWholeController = View.createController('ascBjUsmsOverallImageBlInfoWholeController', {
	
	
	siteId:"",
	
	afterViewLoad:function(){
		this.siteId = getMainCampus(); // common function in the asc-bj-usms-overall-common.js
		this.ascBjUsmsOverallOffBlInfoWhole_blGrid.addParameter("classroomRes","教室");
		this.ascBjUsmsOverallOffBlInfoWhole_blGrid.addParameter("labroomRes","实验室");
		this.ascBjUsmsOverallOffBlInfoWhole_blGrid.addParameter("teachOfficeRoomRes","教师办公室");
		this.ascBjUsmsOverallOffBlInfoWhole_blGrid.addParameter("officeRoomRes","办公室");
		this.ascBjUsmsOverallOffBlInfoWhole_blGrid.addParameter("manageDvRes","党政管理办公用房");
		this.ascBjUsmsOverallOffBlInfoWhole_blGrid.addParameter("teachDvRes","教学单位办公用房");
		
		this.ascBjUsmsOverallOffBlInfoWhole_blGrid.buildPostFooterRows = addTotalRowForBl;
		
		this.locateBuilding_cadPanel.appendInstruction("default", "", getMessage("falsh_headerMessage"));
		
	}
	
});


function highlightSelectedBuilding(){
    // Call the drawing control to highlight the selected building
    var blGrid = View.panels.get("ascBjUsmsOverallOffBlInfoWhole_blGrid");
    var selectedRow = blGrid.rows[blGrid.selectedRowIndex];
    
    var highDs = View.dataSources.get("ds_ab-proj-projects-map_drawing_blHighlight");
    highDs.addParameter('blId', selectedRow['bl.bl_id']);
	var drawingPanel = View.getControl('', 'locateBuilding_cadPanel');
	
    var tempDwgname = selectedRow['bl.dwgname'];
    if (drawingPanel.lastLoadedDwgname == tempDwgname) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc('', '', '', selectedRow['bl.dwgname']);
        drawingPanel.addDrawing(dcl, null);
        drawingPanel.lastLoadedDwgname = tempDwgname;
    }
	
	//change the title of drawing panel
    var drawingPanelTitle = getMessage("falsh_headerMessage") + " " + selectedRow['bl.bl_id'];
    drawingPanel.appendInstruction("default", "", drawingPanelTitle);
    drawingPanel.processInstruction("default", "");
}
/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRowForBl(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	
	var totalAreaShiyong = 0.0;
	var totalAreaJianZhu = 0.0;
	var totalManageArea = 0.0;
	var totalTeachArea = 0.0;
	var totalClassroomArea = 0.0;
	var totalLabroomArea = 0.0;
	var totalVacantRoomQuan = 0;
	var totalVacantRmArea = 0.0;
	
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
		
        //shiyong area
		var blAreaShiyong = row['bl.area_rm'];
		if(row['bl.area_rm.raw']){
			blAreaShiyong = row['bl.area_rm.raw'];
		}
		if (!isNaN(parseFloat(blAreaShiyong))) {
			totalAreaShiyong += parseFloat(blAreaShiyong);
		}
		
		//jianzhu area
		var blAreaJianZhu = row['bl.area_building_manual'];	
		if(row['bl.area_building_manual.raw']){
			blAreaJianZhu = row['bl.area_building_manual.raw'];
		}
		if (!isNaN(parseFloat(blAreaJianZhu))) {
			totalAreaJianZhu += parseFloat(blAreaJianZhu);
		}
		
		//party management office room area
		var blManageArea = row['bl.manage_area'];
		if(row['bl.manage_area.raw']){
			blManageArea = row['bl.manage_area.raw'];
		}
		if (!isNaN(parseFloat(blManageArea))) {
			totalManageArea += parseFloat(blManageArea);
		}
		
		//teaching office room area
		var blTeachArea = row['bl.teaching_area'];	
		if(row['bl.teaching_area.raw']){
			blTeachArea = row['bl.teaching_area.raw'];
		}
		if (!isNaN(parseFloat(blTeachArea))) {
			totalTeachArea += parseFloat(blTeachArea);
		}
		
		//class room area
		var blClassroomArea = row['bl.classroom_area'];
		if(row['bl.classroom_area.raw']){
			blClassroomArea = row['bl.classroom_area.raw'];
		}
		if (!isNaN(parseInt(blClassroomArea))) {
			totalClassroomArea += parseFloat(blClassroomArea);
		}
		
		//lab room area
		var blLabroomArea = row['bl.lab_area'];	
		if(row['bl.lab_area.raw']){
			blLabroomArea = row['bl.lab_area.raw'];
		}
		if (!isNaN(parseFloat(blLabroomArea))) {
			totalLabroomArea += parseFloat(blLabroomArea);
		}
		
		//vacant room  quantity
		var blVacantRoomQuan = row['bl.vacant_rm'];
		if(row['bl.vacant_rm.raw']){
			blVacantRoomQuan = row['bl.vacant_rm.raw'];
		}
		if (!isNaN(parseInt(blVacantRoomQuan))) {
			totalVacantRoomQuan += parseInt(blVacantRoomQuan);
		}
		
		//vacant room area
		var blVacantRmArea = row['bl.vacant_area'];	
		if(row['bl.vacant_area.raw']){
			blVacantRmArea = row['bl.vacant_area.raw'];
		}
		if (!isNaN(parseFloat(blVacantRmArea))) {
			totalVacantRmArea += parseFloat(blVacantRmArea);
		}
		
    }
	
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	totalManageArea = totalManageArea.toFixed(2);
	totalTeachArea = totalTeachArea.toFixed(2);
	totalClassroomArea = totalClassroomArea.toFixed(2);
	totalLabroomArea = totalLabroomArea.toFixed(2);
	totalVacantRoomQuan = totalVacantRoomQuan.toFixed(0);
	totalVacantRmArea = totalVacantRmArea.toFixed(2);
	
	var ds = this.getDataSource();
	
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	
	// column 3: empty	
    addColumn(gridRow, 1);
	// column 4: total shiyong area
    addColumn(gridRow, 1, ds.formatValue('bl.area_rm', totalAreaShiyong, true));
    // column 5: total area of Structure
    addColumn(gridRow, 1, ds.formatValue('bl.area_building_manual', totalAreaJianZhu, true));
	// column 6: total manage_area
    addColumn(gridRow, 1, ds.formatValue('bl.manage_area', totalManageArea, true));
	// column 7: total teaching_area
    addColumn(gridRow, 1, ds.formatValue('bl.teaching_area', totalTeachArea, true));
    // column 8: total class room area
    addColumn(gridRow, 1, ds.formatValue('bl.classroom_area', totalClassroomArea, true));
	// column 9: total lab room area
    addColumn(gridRow, 1, ds.formatValue('bl.lab_area', totalLabroomArea, true));
	// column 10: total vacant room quantity
    addColumn(gridRow, 1, ds.formatValue('bl.vacant_rm', totalVacantRoomQuan, true));
	// column 11: total vacant room area
    addColumn(gridRow, 1, ds.formatValue('bl.vacant_area', totalVacantRmArea, true));
    
}


/**
 * add column
 * @param {Object} gridRow
 * @param {int} count
 * @param {String} text
 */
function addColumn(gridRow, count, text){
    for (var i = 0; i < count; i++) {
        var gridCell = document.createElement('th');
        if (text) {
            gridCell.innerHTML = text;
            gridCell.style.textAlign = 'right';
            gridCell.style.color = 'blue';
        }
        gridRow.appendChild(gridCell);
    }
}
