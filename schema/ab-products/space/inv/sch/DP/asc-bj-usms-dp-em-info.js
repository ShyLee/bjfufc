/**
 * @author Lei
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
			
			var restriction = new Ab.view.Restriction();
			if (emId) {
            	restriction.addClause("em.em_id", emId , "=");
        	}
			this.locateEmployee_employees.refresh(restriction);
						
			var grid = View.panels.get('locateEmployee_employees');
			grid.refresh();
    		//var emphoto = View.panels.get('emphoto');
    		var selectedRow = grid.rows[0];
    		var blId = selectedRow["em.bl_id"];
    		var flId = selectedRow["em.fl_id"];
    		var dwgName = selectedRow["rm.dwgname"]
    		
			var dvId = selectedRow["em.dv_id"];
    
   			var locateEmployee = View.panels.get('locateEmployee_cadPanel');
    		var ds = View.dataSources.get('ds_ab-sp-loc-em_drawing_rmHighlight');
    
    		if (emId) {
       			ds.addParameter('emId', "='" + emId + "'");
    		}
    		else {
        		ds.addParameter('emId', 'IS NOT NULL');
    		}
    		if (dvId) {
        		ds.addParameter('dvId', "='" + dvId + "'");
    		}
    		else {
        		ds.addParameter('dvId', 'IS NOT NULL');
    		}
    		var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    		setDrawingTitle(locateEmployee, blId + '-' + flId);
    		locateEmployee.addDrawing(dcl);
    		//show image
    		var empDetails = View.panels.get('empDetails');
    		var restriction = new Ab.view.Restriction();
    		restriction.addClause('em.em_id', emId, '=');
    		empDetails.refresh(restriction);
    
   			emphoto.refresh(restriction);
	
			var empBaseInfo = View.panels.get('empBaseInfo');
			empBaseInfo.refresh(restriction);
	
			var emRmPanel = View.panels.get('emRmInfoPanel');
			emRmPanel.refresh(restriction);	

		}else{
		this.emFilterPanel_onShow();
		}
    },
	
	
	
    emFilterPanel_onShow: function(){ 
        var restriction = new Ab.view.Restriction();
        var name = this.emFilterPanel.getFieldValue("em.name");
        var dvId = this.emFilterPanel.getFieldValue("em.dv_id");
		var zcId = this.emFilterPanel.getFieldValue("em.zc_id");
        if (dvId) {
            restriction.addClause("em.dv_id", dvId + '%', "LIKE");
        }
        if (name) {
            restriction.addClause("em.name", name + '%', "LIKE");
        }
		if (zcId) {
            restriction.addClause("em.zc_id", zcId + '%', "LIKE");
        }
        this.locateEmployee_employees.refresh(restriction);
    },
	
//    emphoto_afterRefresh: function(){
//        var emphoto = View.panels.get('emphoto');
//        var em_photo = emphoto.getFieldValue('em.em_photo').toLowerCase();
//        var em_id = emphoto.getFieldValue('em.em_id');
//        if (!em_photo) {
//            return;
//        }
//        if (valueExistsNotEmpty(emphoto)) {
//            emphoto.showImageDoc('image_field', 'em.em_id', 'em.em_photo');
//        }
//        else {
//            emphoto.fields.get('image_field').dom.src = null;
//            emphoto.fields.get('image_field').dom.alt = getMessage('noImage');
//        }
//    },
	
	locateEmployee_employees_onClickItem:function(row){
        this.showDistinctPhoto(row);
    },
	
	showDistinctPhoto:function(row){
        var emId= row.getFieldValue('em.em_id')
        var addr=View.project.projectGraphicsFolder + '/em/' + emId+'.jpg';
        jQuery.ajax({
              url: addr,
              success: function(){
                  jQuery("#em_photo").attr("src",addr);

              },
              error:function(e){
                  jQuery("#em_photo").removeAttr("src");
                  jQuery("#em_photo").attr("display","none");
              }});
    },
    emFilterPanel_onClear:function(){
    	this.locateEmployee_employees.refreshClearAllFilters();
    	this.empBaseInfo.show(false);
    	this.empDetails.show(false);
    	this.emphoto.show(false);
    	this.locateEmployee_cadPanel.refresh('1<>1');
    	this.emRmInfoPanel.show(false);
    }
    
})
function showRmOfEm(){
    var grid = View.panels.get('locateEmployee_employees');
    var emphoto = View.panels.get('emphoto');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var blId = selectedRow["em.bl_id"];
    var flId = selectedRow["em.fl_id"];
	 var rmId = selectedRow["em.rm_id"];
    var dwgName = selectedRow["rm.dwgname"]
    var emId = selectedRow["em.em_id"];
	var dvId = selectedRow["em.dv_id"];
    
    var locateEmployee = View.panels.get('locateEmployee_cadPanel');
    var ds = View.dataSources.get('ds_ab-sp-loc-em_drawing_rmHighlight');
    
    if (emId) {
        ds.addParameter('emId', "='" + emId + "'");
    }
    else {
        ds.addParameter('emId', 'IS NOT NULL');
    }
    if (dvId) {
        ds.addParameter('dvId', "='" + dvId + "'");
    }
    else {
        ds.addParameter('dvId', 'IS NOT NULL');
    }
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, rmId, dwgName);
    setDrawingTitle(locateEmployee, blId + '-' + flId);
    locateEmployee.clear();
    locateEmployee.addDrawing(dcl);
    //show image
    var empDetails = View.panels.get('empDetails');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('em.em_id', emId, '=');
    empDetails.refresh(restriction);
    
    emphoto.refresh(restriction);
	
	var empBaseInfo = View.panels.get('empBaseInfo');
	empBaseInfo.refresh(restriction);
	
	var emRmPanel = View.panels.get('emRmInfoPanel');
	emRmPanel.addParameter("emId",emId);
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
            width: 750,
            height: 350,
            closeButton: false,
			blId:pk[0],
			flId:pk[1],
			rmId:pk[2]
        });
		
		setDrawingTitle(locateEmployee, pk[0] + '-' + pk[1]);
    }
}
