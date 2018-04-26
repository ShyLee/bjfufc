/**
 * @author Huang MuLiang
 */
var locEmpController = View.createController('locEmp', {
	  
	  afterViewLoad: function(){
	  	this.locateEmployee_cadPanel.appendInstruction("default", "", '');
        this.locateEmployee_cadPanel.appendInstruction("addDrawing", "", '');
		this.locateEmployee_cadPanel.addEventListener('onclick', onClickDrawingHandler);
	  },
		
      afterInitialDataFetch: function(){
		if (this.view.parameters){
			var record  = this.view.parameters['emRecord'];
        	var empName = record['em.name'];
			var emId = record['em.em_id'];
			this.emFilterPanel.setFieldValue('em.name',empName); 
			
		}
		this.emFilterPanel_onShow();
    },
	
    emFilterPanel_onShow: function(){ 
        var restriction = new Ab.view.Restriction();
        var name = this.emFilterPanel.getFieldValue("em.name");
        var dvId = this.emFilterPanel.getFieldValue("em.dv_id");
		var zhicId = this.emFilterPanel.getFieldValue("em.zhic_id");
        if (dvId) {
            restriction.addClause("em.dv_id", dvId + '%', "LIKE");
        }
        if (name) {
            restriction.addClause("em.name", name + '%', "LIKE");
        }
		if (zhicId) {
            restriction.addClause("em.zhic_id", zhicId + '%', "LIKE");
        }
        this.locateEmployee_employees.refresh(restriction);
        
        this.locateEmployee_rooms.show(false,true);
        this.emphoto.show(false,true);
        this.empDetails.show(false,true);
    },
	
    emphoto_afterRefresh: function(){
        var emphoto = View.panels.get('emphoto');
        var em_photo = emphoto.getFieldValue('em.em_photo').toLowerCase();
        var em_id = emphoto.getFieldValue('em.em_id');
        if (!em_photo) {
            return;
        }
        if (valueExistsNotEmpty(emphoto)) {
            emphoto.showImageDoc('image_field', 'em.em_id', 'em.em_photo');
        }
        else {
            emphoto.fields.get('image_field').dom.src = null;
            emphoto.fields.get('image_field').dom.alt = getMessage('noImage');
        }
    }
    
})


function showRmsOfEm(){
	var emGrid = View.panels.get('locateEmployee_employees');
	var selectedRow = emGrid.rows[emGrid.selectedRowIndex];
	var emId = selectedRow["em.em_id"];
	
	var rmGrid = View.panels.get('locateEmployee_rooms');
	rmGrid.addParameter('emIdRes', emId);
	rmGrid.refresh();
	
	 //show image
    var restriction = new Ab.view.Restriction();
    restriction.addClause('em.em_id', emId, '=');
	
	var empDetails = View.panels.get('empDetails');
    empDetails.refresh(restriction);
    
	var emphoto = View.panels.get('emphoto');
    emphoto.refresh(restriction);
	
	var empBaseInfo = View.panels.get('empBaseInfo');
	empBaseInfo.refresh(restriction);
	
	showRmOfEm(0);
}

function showRmOfEm(rowIndex){
    var grid = View.panels.get('locateEmployee_rooms');
	var locateEmployee = View.panels.get('locateEmployee_cadPanel');
	var emRmPanel = View.panels.get('emRmInfoPanel');
    if (rowIndex >=0){
		grid.selectedRowIndex = rowIndex;
	}
	if (grid.rows.length == 0){
		locateEmployee.clear();
		emRmPanel.refresh("1!=1")
		return;
	} 
    var selectedRow = grid.rows[grid.selectedRowIndex];
	var emId = selectedRow["em.em_id"];
    var blId = selectedRow["em.bl_id"];
    var flId = selectedRow["em.fl_id"];
    var rmId = selectedRow["em.rm_id"];
    var dwgName = selectedRow["rm.dwgname"];
  
    
    
    var ds = View.dataSources.get('ds_ab-sp-loc-em_drawing_rmHighlight');
    
    if (rmId) {
        ds.addParameter('rmId', "='" + rmId + "'");
    }
    else {
        ds.addParameter('rmId', 'IS NOT NULL');
    }

    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, rmId, dwgName);
    setDrawingTitle(locateEmployee, blId + '-' + flId);
    locateEmployee.clear();
    locateEmployee.addDrawing(dcl);
	
	//show image
    var restriction = new Ab.view.Restriction();
    restriction.addClause('em.em_id', emId, '=');
	
	
	emRmPanel.refresh(restriction);
}

/**
 * set drawing panel title
 */
function setDrawingTitle(console, title){
    if (title) {
        console.processInstruction("addDrawing", '', title);
    }
    else {
        console.processInstruction("default", '');
    }
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
		
		setDrawingTitle(locateEmployee, pk[0] + '-' + pk[1]);
    }
}
