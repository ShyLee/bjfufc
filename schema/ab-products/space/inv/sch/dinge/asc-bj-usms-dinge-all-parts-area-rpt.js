var abViewDingeAreaController = View.createController("abViewDingeAreaController", {
	
    buClass: '',
    c_dangzhengguanli:"",
    c_jiaoxuekeyan:"",
    
	afterViewLoad:function(){
		this.c_dangzhengguanli= ascBjUsmsConstantControl.BU_CLASS_DZGL;
		this.c_jiaoxuekeyan= ascBjUsmsConstantControl.BU_CLASS_JXKY;
	},
	
    afterInitialDataFetch: function(){
        var detailPanel = View.panels.get('ascBjUsmsSearchAreaDingeJiaoXueKeYanGrid');
        $('dv.bu_id').options[0].selected=true;
        resetBuClass(this.c_jiaoxuekeyan);
    },
    consolePanel_onSearch: function(){
        var dvName = $('dv.name').value;
        var year = $("year").value;
        var panel = this.gridPanel;
        if(year==""){
			View.showMessage("请选择一个年份！");
	        return;
		}
        if (year != '') {
        	panel.addParameter('year', " AND sc_ts_dv_dinge.year_dinge='" + year + "'");
        }
        if (dvName != '') {
            panel.addParameter('dvId', " AND dv.name='" + dvName + "'");
        }
        else {
        	panel.addParameter('dvId', " AND 1=1");
        }
        if (this.buClass != '' && this.buClass == this.c_dangzhengguanli) {
        	panel.addParameter('buClass',  this.buClass);
            panel.refresh();
            this.gridPanel.setTitle("党政管理");
        }
        else {
            this.buClass = this.c_jiaoxuekeyan;
            panel.addParameter('buClass',  this.buClass);
            panel.refresh();
            this.gridPanel.setTitle("教学科研");
        }
       
    },
    consolePanel_onClear: function(){
      document.getElementById("dv.bu_id").options[0].selected=true;
	  document.getElementById("dv.name").value="";
    }
});

function getSelectedBuClass(selectedvalue){
    var selectedbuClass;
    if (selectedvalue == 'DZGL') {
        selectedbuClass = abViewDingeAreaController.c_dangzhengguanli;
    }
    if (selectedvalue == 'JXKY') {
        selectedbuClass = abViewDingeAreaController.c_jiaoxuekeyan;
    }
    return selectedbuClass;
}

function resetBuClass(selectedvalue){
    var selectedbuClass = getSelectedBuClass(selectedvalue);
    abViewDingeAreaController.buClass = selectedbuClass;
    ASC_showFieldValuesInComboxList("dv", "name", "dv.bu_id in (SELECT bu_id FROM bu WHERE bu_class ='" + selectedbuClass + "')", "dv.name");
}
