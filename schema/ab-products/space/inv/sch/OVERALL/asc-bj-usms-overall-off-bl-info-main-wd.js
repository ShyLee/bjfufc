/**
 * @author Keven.xi
 */

View.createController('ascBjUsmsOverallOffBlInfoMainController', {
	
	siteId:"",
	mainTabs : null,

	
	afterViewLoad:function(){
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;		
		
		this.ascBjUsmsOverallOffBlInfoMain_blGrid.addParameter("classroomRes","教室");
		this.ascBjUsmsOverallOffBlInfoMain_blGrid.addParameter("labroomRes","实验室、实习场所");
		this.ascBjUsmsOverallOffBlInfoMain_blGrid.addParameter("manageDvRes","机关单位办公用房");
		this.ascBjUsmsOverallOffBlInfoMain_blGrid.addParameter("teachDvRes","教学单位办公用房");
		this.ascBjUsmsOverallOffBlInfoMain_blGrid.addParameter("vacantRmRes","空置房");
		this.ascBjUsmsOverallOffBlInfoMain_blGrid.addParameter("siteIdRes",this.siteId);
		
		this.ascBjUsmsOverallOffBlInfoMain_blGrid.buildPostFooterRows = addTotalRowForBl;
		
		this.ascBjUsmsOverallOffBlInfoMain_siteBasicGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallOffBlInfoMain_blGrid.addParameter('siteIdRes',this.siteId);

	},
	
	ascBjUsmsOverallOffBlInfoMain_siteBasicGrid_onShowSiteImage:function(){
		View.openDialog('asc-bj-usms-overall-image-bl-info.axvw', null, false, {width:1000, height:1200, closeButton:false});
		
	},
	
	ascBjUsmsOverallOffBlInfoMain_blGrid_afterRefresh:function(){
		this.setStyle();
	},
	
	setStyle:function(){
		var rows = this.ascBjUsmsOverallOffBlInfoMain_blGrid.rows;
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			for (var j=4;j<8;j++){
				row.row.cells.items[j].dom.bgColor = '#fff5d1';
			}
		}
	}
	
});

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




