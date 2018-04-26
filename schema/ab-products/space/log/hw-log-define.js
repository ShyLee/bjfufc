/**
 * Controller for the main setting.
 * 
 * @author Zhao yongli
 */
jQuery(function(){
    jQuery('#addtable').text("请输入要添加的表名");
    jQuery('#deltable').text("请输入要移除的表名");
    jQuery('#tip1').text("输入小写字母，不包含特殊字符");
    jQuery('#tip2').text("输入小写字母，不包含特殊字符");
})
String.prototype.startWith=function(str){
	var reg=new RegExp("^"+str);
	return reg.test(this);
}
String.prototype.endWith=function(str){
	var reg=new RegExp(str+"$")
	return reg.test(this);
}
String.prototype.trim=function(){
	return this.replace(/(^\s*)|(\s*$)/g,"");
}
function addEvent(ele,evt,fn){
		if(ele.addEventListener){
			ele.addEventListener(evt,fn,false)
		}
		if(ele.attachEvent){
			ele.attachEvent('on'+evt,fn);
		}else{
			ele['on'+evt]=fn(evt);
		}
}
addEvent(document.getElementById("addTableName"),"focus",focusFn);
//addEvent(document.getElementById("addTableName"),"blur",focusOut);
addEvent(document.getElementById("deleteTableName"),"focus",focusFnDel);
//addEvent(document.getElementById("deleteTableName"),"blur",focusOutDel);
addEvent(document.getElementById("addTableName"),"keypress",enterCallFn);
addEvent(document.getElementById("deleteTableName"),"keypress",enterCallDelFn);
var addTableDefineController = View.createController('addTableDefineController', {
    addTableName:null,
	deleteTableName:null,
	afterInitialDataFetch: function(){
	},
    afterViewLoad:function(){
	this.addTableName=document.getElementById("addTableName");
	this.deleteTableName=document.getElementById("deleteTableName");
    this.addTableName.value='请输入表名称';
	this.addTableName.style.backgroundColor='#eee';
	this.addTableName.style.color='#888';
	this.deleteTableName.value='请输入表名称';
	this.deleteTableName.style.backgroundColor='#eee';
	this.deleteTableName.style.color='#888';
	},
	addTablePanel_onConfirm: function() {
		var addTableName=document.getElementById("addTableName");
		var tableValue=addTableName.value;
		tableValue=tableValue.trim();
		if(tableValue==''||tableValue=='请输入表名称'){
			  View.showMessage('error', '请输入有效的表名称');
			  return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_tbls.table_name',tableValue);
		
		var archibusTable=this.archibusTableDefine.getRecord(restriction);
		if(archibusTable.isNew){
			  View.showMessage('error', '请核对表名称，该表在系统中不存在');
			return;
		}
		var paramRecord=this.hw_log_defineTbDs.getRecord();
		var paramValue=paramRecord.getValue('afm_activity_params.param_value');
		if(paramValue!=''){
					if(paramValue.indexOf(tableValue)!=-1){
						 View.showMessage('error', '表[ '+tableValue+' ]已经纳入日志系统管理,无需再次设置');
						return;
					}
					var newParamValue=paramValue+","+tableValue;
					var record=this.hw_log_defineTbDs.getRecord();
					record.setValue('afm_activity_params.param_value',newParamValue);
					this.hw_log_defineTbDs.saveRecord(record);
					var res = {'afm_activity_params.activity_id':'AbSystemAdministration','afm_activity_params.param_id':'HWLogDefineTable'};
					this.hasDefinedPanel.refresh(res);
					View.showMessage('message', '添加成功!');	
					focusOut.call(this);			
		}else{
					var record=this.hw_log_defineTbDs.getRecord();
					record.setValue('afm_activity_params.param_value',tableValue);
					this.hw_log_defineTbDs.saveRecord(record);
				    var res = {'afm_activity_params.activity_id': 'AbSystemAdministration','param_id':'HWLogDefineTable'};
					this.hasDefinedPanel.refresh(res);
					View.showMessage('message', '添加成功!');	
					focusOut.call(this);	
					
		}
	
    },  
    deleteTablePanel_onConfirm: function() {
		var deleteTableName=document.getElementById("deleteTableName");
		var tableValue=deleteTableName.value;
		tableValue=tableValue.trim();
		if(tableValue==''||tableValue=='请输入表名称'){
			  View.showMessage('error', '请输入有效的表名称');
			  return;
		}
		var paramRecord=this.hw_log_defineTbDs.getRecord();
		var paramValue=paramRecord.getValue('afm_activity_params.param_value');
		if(paramValue!=''){
					if(paramValue.indexOf(tableValue)==-1){
						 View.showMessage('error', '表[ '+tableValue+' ]没有纳入日志系统管理,无需删除');
						return;
					}
					paramValue=paramValue.replace(tableValue,'');
					if(paramValue.indexOf(',,')!=-1){
						paramValue=paramValue.replace(',,',',');
					}
					if(paramValue.startWith(',')){
						paramValue=paramValue.substring(1,paramValue.length)
					}
					if(paramValue.endWith(',')){
						paramValue=paramValue.substring(0,paramValue.length-1);
					}
					
					var record=this.hw_log_defineTbDs.getRecord();
					record.setValue('afm_activity_params.param_value',paramValue);
					this.hw_log_defineTbDs.saveRecord(record);
					var res = {'afm_activity_params.activity_id':'AbSystemAdministration','afm_activity_params.param_id':'HWLogDefineTable'};
					this.hasDefinedPanel.refresh(res);
					focusOutDel.call(this);
					View.showMessage('message', '删除成功!');	
		}else{
				 View.showMessage('error', '日志系统中没有管理的表,不能完成删除');	
		}
		
    }
});



function focusFn(){
	document.getElementById("addTableName").value='';
	document.getElementById("addTableName").style.backgroundColor='#fff';
	document.getElementById("addTableName").style.color='#000';
}
function focusOut(){
	document.getElementById("addTableName").value='请输入表名称';
	document.getElementById("addTableName").style.backgroundColor='#eee';
}
function focusFnDel(){
	document.getElementById("deleteTableName").value='';
	document.getElementById("deleteTableName").style.backgroundColor='#fff';
}
function focusOutDel(){
	document.getElementById("deleteTableName").value='请输入表名称';
	document.getElementById("deleteTableName").style.backgroundColor='#eee';
	document.getElementById("deleteTableName").style.color='#000';
}
function enterCallFn(event){
	if(event.keyCode==13){
		addTableDefineController.addTablePanel_onConfirm();
	}
	return false;
}
function enterCallDelFn(event){
	if(event.keyCode==13){
		addTableDefineController.deleteTablePanel_onConfirm();
	}
	return false;
}

