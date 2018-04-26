var azfReqController = View.createController('azfReqController', {

    archiveId: null,
	gzbm:null,
    wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
    xmlName: "",
    parameters:{},
	
    afterViewLoad: function(){
        this.reqEmDetail.actions.get('print').enable(true);
        this.reqEmDetail.actions.get('next').enable(true);
        this.cqfDetail.refresh('1<>1');
        this.azfEmDetail.refresh(null, true);
    },
    
    showDetail: function(archiveId){
        var existRes = "sc_azf_em.archive_id = '" + archiveId + "'";
        var records = this.azfEmDs.getRecords(existRes);
        
        var emRes = "sc_zf_em.archive_id = '" + archiveId + "'";
        var cqfRes = "sc_zf_cq.archive_id = '" + archiveId + "'";
        this.reqEmDetail.refresh(emRes, false);
        this.cqfDetail.refresh(cqfRes);
        
        if (records.length != 0) {
            View.showMessage('已申请过安置费');
            this.reqEmDetail.actions.get('print').enable(true);
            this.reqEmDetail.actions.get('next').enable(false);
        }else{
        	this.reqEmDetail.actions.get('print').enable(false);
            this.reqEmDetail.actions.get('next').enable(true);
        }
    },
    
    reqEmDetail_onPrint: function(){
        var archiveId = this.reqEmDetail.getFieldValue("sc_zf_em.archive_id");
        if (valueExistsNotEmpty(archiveId)) {
			xmlName="azf_apply_report";
            parameters= {
                'parameter2': archiveId
            };
			try {
	            var result = Workflow.callMethod(this.wfrId, xmlName, 0, parameters);
	            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
	                result.data = eval('(' + result.jsonExpression + ')');
	                this.jobId = result.data.jobId;
	                var url = 'ab-ireport-example.axvw?jobId=' + this.jobId;
	                window.open(url);
	            }
	        } 
	        catch (e) {
	            Workflow.handleError(e);
	        }
//            View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
//                width: 470,
//                height: 200,
//                xmlName: "azf_apply_report",
//                parameters: {
//                    'parameter2': archiveId
//                },
//                closeButton: false
//            });
        }
        else {
			View.showMessage('请先选择档案号');
			return;
        }
    },
    
    reqEmDetail_onNext: function(){
        this.archiveId = this.reqEmDetail.getFieldValue('sc_zf_em.archive_id');
        this.gzbm = this.reqEmDetail.getFieldValue('sc_zf_em.gzbm');
        if (valueExistsNotEmpty(this.archiveId)) {
            //var tabs = View.getControlsByType(parent, 'tabs')[0];
			var tabs = View.panels.get("printTabs");
            var nextTabName = 'checkTab';
            var nextTab = tabs.findTab(nextTabName);
            tabs.selectTab(nextTabName);
            nextTab.loadView();
            nextTab.show(true);
            this.azfEmDetail.refresh(null, true);
            this.azfEmDetail.setFieldValue('sc_azf_em.archive_id', this.archiveId);
            this.azfEmDetail.setFieldValue('sc_azf_em.gzbm', this.gzbm);
        }
        else {
            View.showMessage('请输入档案编号');
            return;
        }
    },
    
    azfEmDetail_onPrev: function(){
        var tabName = 'reqTab';
        //var tabs = View.getControlsByType(parent, 'tabs')[0];
		var tabs = View.panels.get("printTabs");
        var tab = tabs.findTab(tabName);
        tab.loadView();
        tabs.selectTab(tabName);
        this.showDetail(this.azfEmDetail.getFieldValue('sc_azf_em.archive_id'));
    },
    
    azfEmDetail_onSave: function(){
        this.azfEmDetail.save();
        this.insertAzfEm();
    },
    
    dateChange: function(){
        var dateBegin = this.azfEmDetail.getFieldValue('sc_azf_em.date_azf_begin');
        var dateEnd = getEndDate(dateBegin, 3);
        this.azfEmDetail.setFieldValue('sc_azf_em.date_azf_end_ought', dateEnd);
    },
    
    insertAzfEm: function(){
        var id = this.azfEmDetail.getFieldValue('sc_azf_em.id');
        var res = "sc_azf_em.id = '" + id + "'";
        var recordInsert = this.azfEmDs.getRecord(res);
        recordInsert.setValue('sc_azf_em.archive_id', this.reqEmDetail.getFieldValue('sc_zf_em.archive_id'));
        recordInsert.setValue('sc_azf_em.em_id', this.reqEmDetail.getFieldValue('sc_zf_em.em_id'));
        recordInsert.setValue('sc_azf_em.xm', this.reqEmDetail.getFieldValue('sc_zf_em.xm'));
        recordInsert.setValue('sc_azf_em.sfzh', this.reqEmDetail.getFieldValue('sc_zf_em.sfzh'));
        recordInsert.setValue('sc_azf_em.gzbm', this.reqEmDetail.getFieldValue('sc_zf_em.gzbm'));
        recordInsert.setValue('sc_azf_em.dv_id', this.reqEmDetail.getFieldValue('sc_zf_em.dv_id'));
        recordInsert.setValue('sc_azf_em.dv_name', this.reqEmDetail.getFieldValue('sc_zf_em.dv_name'));
        recordInsert.setValue('sc_azf_em.po_name', this.reqEmDetail.getFieldValue('sc_zf_em.po_xm'));
        recordInsert.setValue('sc_azf_em.po_sfzh', this.reqEmDetail.getFieldValue('sc_zf_em.po_sfzh'));
        recordInsert.setValue('sc_azf_em.emial', this.reqEmDetail.getFieldValue('sc_zf_em.emial'));
        recordInsert.setValue('sc_azf_em.zc_id', this.reqEmDetail.getFieldValue('sc_zf_em.zc_id'));
        recordInsert.setValue('sc_azf_em.zc_name', this.reqEmDetail.getFieldValue('sc_zf_em.zc_name'));
        recordInsert.setValue('sc_azf_em.zw_id', this.reqEmDetail.getFieldValue('sc_zf_em.zw_id'));
        recordInsert.setValue('sc_azf_em.zw_name', this.reqEmDetail.getFieldValue('sc_zf_em.zw_name'));
        this.azfEmDs.saveRecord(recordInsert);
    }
})

function onSelectEm(){

    View.selectValue({
        formId: 'reqEmDetail',
        title: "档案号",
        fieldNames: ['sc_zf_em.archive_id'],
        selectTableName: 'sc_zf_em',
        selectFieldNames: ['sc_zf_em.archive_id'],
        visibleFieldNames: ['sc_zf_em.archive_id', 'sc_zf_em.em_id','sc_zf_em.xm','sc_zf_em.gzbm','sc_zf_em.sfzh'],
        restriction: null,
        actionListener: afterSelectEm
    });
}

function afterSelectEm(fieldName, selectedValue, previousValue){
    if (fieldName == "sc_zf_em.archive_id") {
        azfReqController.showDetail(selectedValue);
    }
}

function ieDateFormat(date){
    var array = date.split("-");
    var bTime = array[0] + '/' + array[1] + '/' + array[2];
    var later = new Date(bTime);
    return later;
}

function getPrevMonthLastDay(date){
    var yyyy = date.getFullYear();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    if (mm - 1 == 0) {
        yyyy -= 1;
        mm = 12;
    }
    else {
        mm -= 1;
    }
    dd = GetMonthMaxDays(mm, yyyy);
    return yyyy + "-" + mm + "-" + dd;
}

function getEndDate(dateBegin, n){
    var date = ieDateFormat(dateBegin);
    var strYear = date.getFullYear();
    var strDay = date.getDate();
    var strMonth = date.getMonth() + 1;
    var yyyy = strYear + parseInt(n, 10);
    var dd = GetMonthMaxDays(strMonth, yyyy);
    var datestr = yyyy + "-" + strMonth + "-" + dd;
    var date2 = ieDateFormat(datestr);
    var dateEnd = getPrevMonthLastDay(date2);
    return dateEnd;
}
