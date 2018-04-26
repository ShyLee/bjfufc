/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsOverallDeptOccuWholeController', {
	
	total_office_area:0.0,
	total_meeting_area:0.0,
	siteId:"",
	
	afterViewLoad:function(){
		//restriction : Main Campus
		this.siteId = getMainCampus(); // common function in the asc-bj-usms-overall-common.js
		this.ascBjUsmsOverallDeptOccuWhole_siteBasicGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallDeptOccuWhole_typeSumGrid.addParameter('officeTypeRes','办公室');
		this.ascBjUsmsOverallDeptOccuWhole_typeSumGrid.addParameter('meetingTypeRes','会议室');
		
	},
	
	ascBjUsmsOverallDeptOccuWhole_dvGrid_afterRefresh:function(){
		this.setStyle();
		this.setTypeRoomArea();
		//this.setSumTypeAreaInSite();
	},
	
	setTypeRoomArea:function(){
		var dataSource = View.dataSources.get('ds_asc-bj-usms-overall-dept-occu-whole_grid_dvTypeSum');
	    dataSource.addParameter('officeTypeRes', '办公室');
		dataSource.addParameter('meetingTypeRes', '会议室');
		try {
	        var records = dataSource.getRecords();
			var rows = this.ascBjUsmsOverallDeptOccuWhole_dvGrid.rows;
			
			for(var i=0;i<rows.length;i++){
				var row = rows[i];
				var rowEl = Ext.get(row.row.dom).dom;
				
				var dv_id = row['dv.dv_id'];	
				var record = this.getRecord(records,dv_id);
				if (valueExists(record)) {
					
					var totalOfficeAreaValue = record.getValue("rm.dv_office_area");
					if (!isNaN(parseFloat(totalOfficeAreaValue))) {
						this.total_office_area += parseFloat(totalOfficeAreaValue);
					}
					var totalMeetingAreaValue = record.getValue("rm.dv_meeting_area");
					if (!isNaN(parseFloat(totalMeetingAreaValue))) {
						this.total_meeting_area += parseFloat(totalMeetingAreaValue);
					}
					
					//office area
					rowEl.cells[6].innerHTML = record.getValue("rm.dv_office_area");
					//meeting area
					rowEl.cells[7].innerHTML = record.getValue("rm.dv_meeting_area");
				}else{
					//office area
					rowEl.cells[6].innerHTML = "0.00";
					//meeting area
					rowEl.cells[7].innerHTML = "0.00";
				}
				
			}
	        
	    } catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	getRecord:function(records,dv_id){
		var record = null;
		for(var i=0;i<records.length;i++){
				record = records[i];
				var tempDv = record.getValue("dv.dv_id");
				if (dv_id == tempDv){
					return record;
				}
	    }
		return null;
	},
	
	setStyle:function(){
		var rows = this.ascBjUsmsOverallDeptOccuWhole_dvGrid.rows;
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			for (var j=6;j<8;j++){
				row.row.cells.items[j].dom.bgColor = '#fff5d1';
			}
		}
	},
	setSumTypeAreaInSite:function(){
		this.ascBjUsmsOverallDeptOccuWhole_typeSumGrid.setFieldValue("rm.dv_office_area",this.total_office_area);
		this.ascBjUsmsOverallDeptOccuWhole_typeSumGrid.setFieldValue("rm.dv_meeting_area",this.total_meeting_area);
	},
	
	ascBjUsmsOverallDeptOccuWhole_siteBasicGrid_onFixedReport:function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"dpReport",closeButton:false});
	}
	
});


