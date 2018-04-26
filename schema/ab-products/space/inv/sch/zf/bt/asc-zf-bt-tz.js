var ascZfbtTZController = View.createController('ascZfbtTZController', {
	selectedRow: null,
	afterInitialDataFetch:function(){
		var restriction = "sc_zfbt.money != (select money_std from sc_zf_em where sc_zf_em.em_id = sc_zfbt.em_id)";
		this.tzList.restriction = restriction;
        this.tzList.refresh();
		
		 $('select').outerHTML = '<select id="select" onchange="ascZfbtTZController.changeApplyList()">'
				+ '<option value="未处理列表">未处理列表</option>'
				+ '<option value="已处理列表">已处理列表</option></select>';
		
		jQuery("#applyForm input").each(function(){
			jQuery(this).attr("disabled","disabled");
		});
        
        jQuery("#currentBtInfo input").each(function(){
			jQuery(this).attr("disabled","disabled");
		});
        
        jQuery("#tzForm input").each(function(){
			jQuery(this).attr("disabled","disabled");
		});
	},
	
	/**
	 * 根据选择框的值，自动刷新申请列表中的内容
	 * */
	changeApplyList: function(selecter){
		var	selectedName =  $('select').options[$('select').selectedIndex].value;
		
		if(selectedName == "未处理列表"){
			var restriction = "sc_zfbt.money != (select money_std from sc_zf_em where sc_zf_em.em_id = sc_zfbt.em_id)";
			this.tzList.restriction = restriction;
	        this.tzList.refresh();
	        this.tzList.setTitle("待处理列表");
		}else if(selectedName == "已处理列表"){
			var restriction = "sc_zfbt.em_id in (select em_id from sc_zfbt_tz)";
			this.tzList.restriction = restriction;
	        this.tzList.refresh();
			this.tzList.setTitle("已处理列表");
		}
		this.selectedRow = null;
	},
	
	tzList_afterRefresh: function(){
		this.tzList.enableSelectAll(false);
	},
	tzList_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},
	tzList_onManage: function(){
		if(this.selectedRow == null){
			View.showMessage("您必须要选择一条记录！");
			return;
		}
		
		var id = this.selectedRow.getFieldValue('sc_zfbt.id');
		var em_id = this.selectedRow.getFieldValue('sc_zfbt.em_id');
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt.id", id, "=");
        
        this.applyForm.refresh(res,false);
        this.currentBtInfo.refresh(res,false);
        
        var res2 = new Ab.view.Restriction();
        res2.addClause("sc_zfbt_tz.em_id", em_id, "=");
        this.tzjlList.refresh(res2);
        
        this.detailTabs.selectTab('applyInfoTab');
	},
	applyForm_onReturn: function(){
		this.detailTabs.selectTab('applyListTab');
	},
	tzjlList_onCheck: function(){
		var em_id = this.selectedRow.getFieldValue('sc_zfbt.em_id');
		var archive_id = " 1=1 ";
		
		var restriction = "sc_zf_em.em_id='" + em_id + "'";
        var parameters = {
            tableName: 'sc_zf_em',
            fieldNames: toJSON(['sc_zf_em.em_id', 'sc_zf_em.archive_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            archive_id = result.data.records[0]['sc_zf_em.archive_id'];
        }
        
        View.openDialog('asc-zf-bt-lxq-zwzc-dialog.axvw', null, true, {
            width: 800,
            height: 500,
            em_id: em_id,
            archive_id: archive_id,
            closeButton: true
        });
	},
	tzjlList_onAdd: function(){
		var em_id = this.currentBtInfo.getFieldValue('sc_zfbt.em_id');
		
		var restriction = "sc_zf_em.em_id='" + em_id + "'";
        var parameters = {
            tableName: 'sc_zf_em',
            fieldNames: toJSON(['sc_zf_em.em_id', 'sc_zf_em.zw_name','sc_zf_em.zc_name','sc_zf_em.zw_get_date','sc_zf_em.zc_get_date']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            var em_id = result.data.records[0]['sc_zf_em.em_id'];
            var zhiw_name = result.data.records[0]['sc_zf_em.zw_name'];
            var zhic_name = result.data.records[0]['sc_zf_em.zc_name'];
            var zw_get_date = result.data.records[0]['sc_zf_em.zw_get_date'];
            var zc_get_date = result.data.records[0]['sc_zf_em.zc_get_date'];
            
            var res = new Ab.view.Restriction();
            res.addClause("sc_zfbt_tz.em_id", em_id, "=");
            res.addClause("sc_zfbt_tz.zhiw_name", zhiw_name, "=");
            res.addClause("sc_zfbt_tz.zhic_name", zhic_name, "=");
            res.addClause("sc_zfbt_tz.zhiw_date", zw_get_date, "=");
            res.addClause("sc_zfbt_tz.zhic_date", zc_get_date, "=");
            this.tzForm.refresh(res,true);
            
            this.tzForm.showInWindow({
    			closeButton: false,
    			x:200,
    			y:200,
    	        width: 800,
    	        height: 300
    	    });
            this.tzForm.show(true);
            this.tzForm.getFieldElement("sc_zfbt_tz.zhiw_name").disabled = false;
            this.tzForm.getFieldElement("sc_zfbt_tz.zhiw_date").disabled = false;
            this.tzForm.getFieldElement("sc_zfbt_tz.zhic_name").disabled = false;
            this.tzForm.getFieldElement("sc_zfbt_tz.zhic_date").disabled = false;
            this.tzForm.getFieldElement("sc_zfbt_tz.pay_date").disabled = false;
            this.tzForm.getFieldElement("sc_zfbt_tz.money_total").disabled = false;
            
            this.calBtDetail();//计算补贴额
        }
	},
	tzForm_onReturn: function(){
		this.tzForm.closeWindow();
	},
	tzForm_onSave: function(){
		var pay_date = this.tzForm.getFieldValue("sc_zfbt_tz.pay_date");
		var money_total = this.tzForm.getFieldValue("sc_zfbt_tz.money_total");
    	if(!valueExistsNotEmpty(pay_date) || !valueExistsNotEmpty(money_total)){
    		View.showMessage("发放时间、补贴金额未填写，请填写后保存");
    		return;
    	}
    	
    	var controller = this;
		View.confirm("您确定要发放提职补贴吗?", function(button){
            if (button == 'yes') {
            	var zhiw_name = controller.tzForm.getFieldValue("sc_zfbt_tz.zhiw_name");
        		var zhic_name = controller.tzForm.getFieldValue("sc_zfbt_tz.zhic_name");
            	
        		var money_bz = getMaxBtMoney(zhiw_name,zhic_name);
            	controller.currentBtInfo.setFieldValue("sc_zfbt.zhiw_name",zhiw_name);
            	controller.currentBtInfo.setFieldValue("sc_zfbt.zhic_name",zhic_name);
            	controller.currentBtInfo.setFieldValue("sc_zfbt.money",money_bz);

            	controller.tzForm.save();
            	controller.currentBtInfo.save();
            	controller.tzForm.closeWindow();
            	controller.tzjlList.refresh();
            	controller.tzList.refresh();
//            	controller.detailTabs.selectTab('applyListTab');
				View.showMessage("操作成功!");
            }
        });
	},
	/**
	 * 生成补贴详情
	 * 
	 * */
	calBtDetail: function(){
		//0.清空相关字段
		this.tzForm.setFieldValue("sc_zfbt_tz.money_bz_zhiw","");
		this.tzForm.setFieldValue("sc_zfbt_tz.money_bz_zhic","");
		this.tzForm.setFieldValue("sc_zfbt_tz.money_jc_zhiw","");
		this.tzForm.setFieldValue("sc_zfbt_tz.money_jc_zhic","");
		this.tzForm.setFieldValue("sc_zfbt_tz.month_zhiw","");
		this.tzForm.setFieldValue("sc_zfbt_tz.month_zhic","");
		this.tzForm.setFieldValue("sc_zfbt_tz.money_total","");
		//1.获得职务、职称各个补贴标准
		var curMoneyBt = this.currentBtInfo.getFieldValue('sc_zfbt.money');
		var money_bz_zhiw = null;
		var money_jc_zhiw = null;
		var money_bz_zhic = null;
		var money_jc_zhic = null;
		
		var zhiw_name = this.tzForm.getFieldValue("sc_zfbt_tz.zhiw_name");
		var zhiw_date = this.tzForm.getFieldValue("sc_zfbt_tz.zhiw_date");
		if(valueExistsNotEmpty(zhiw_name) && valueExistsNotEmpty(zhiw_date)){
			money_bz_zhiw = getBtZhiw(zhiw_name);
			money_jc_zhiw = money_bz_zhiw - curMoneyBt;
			this.tzForm.setFieldValue("sc_zfbt_tz.money_bz_zhiw",money_bz_zhiw);
			this.tzForm.setFieldValue("sc_zfbt_tz.money_jc_zhiw",money_jc_zhiw);
		}
		var zhic_name = this.tzForm.getFieldValue("sc_zfbt_tz.zhic_name");
		var zhic_date = this.tzForm.getFieldValue("sc_zfbt_tz.zhic_date");
		if(valueExistsNotEmpty(zhic_name) && valueExistsNotEmpty(zhic_date)){
			money_bz_zhic = getBtZhic(zhic_name);
			money_jc_zhic = money_bz_zhic - curMoneyBt;
			this.tzForm.setFieldValue("sc_zfbt_tz.money_bz_zhic",money_bz_zhic);
			this.tzForm.setFieldValue("sc_zfbt_tz.money_jc_zhic",money_jc_zhic);
		}
		//2.计算各自的补贴月数，并合计总金额
		var pay_date = this.tzForm.getFieldValue("sc_zfbt_tz.pay_date");
		if(!valueExistsNotEmpty(pay_date)){//补贴发放时间不填写直接退出
			return;
		}
		var money_total = null;
		if(valueExistsNotEmpty(money_bz_zhiw) && valueExistsNotEmpty(money_bz_zhic)){//职务职称都存在时，比较日期
			if(DateBefore(zhiw_date,zhic_date)){//职务提职早于职称[不晚于]
				if(money_bz_zhiw >= money_bz_zhic){//职务提职早并且职务提职补贴高，此时职称提职无效
					var month_zhiw = getMonthBetween(zhiw_date,pay_date);
					var month_zhic = 0;
					
					money_total = money_jc_zhiw * month_zhiw;
					this.tzForm.setFieldValue("sc_zfbt_tz.month_zhiw",month_zhiw);
					this.tzForm.setFieldValue("sc_zfbt_tz.month_zhic",month_zhic);
					this.tzForm.setFieldValue("sc_zfbt_tz.money_total",money_total);
				}else{//职务提职早，但职称提职后的补贴更高，分段补发
					var month_zhiw = getMonthBetween(zhiw_date,zhic_date);
					var month_zhic = getMonthBetween(zhic_date,pay_date);
					
					money_total = (money_jc_zhiw * month_zhiw) + (money_jc_zhic * month_zhic);
					this.tzForm.setFieldValue("sc_zfbt_tz.month_zhiw",month_zhiw);
					this.tzForm.setFieldValue("sc_zfbt_tz.month_zhic",month_zhic);
					this.tzForm.setFieldValue("sc_zfbt_tz.money_total",money_total);
				}
			}else{//职称提职早于职务
				if(money_bz_zhiw >= money_bz_zhic){//职称提职早，但职务提职后的补贴更高，分段补发
					var month_zhiw = getMonthBetween(zhiw_date,pay_date);
					var month_zhic = getMonthBetween(zhic_date,zhiw_date);
					
					money_total = (money_jc_zhiw * month_zhiw) + (money_jc_zhic * month_zhic);
					this.tzForm.setFieldValue("sc_zfbt_tz.month_zhiw",month_zhiw);
					this.tzForm.setFieldValue("sc_zfbt_tz.month_zhic",month_zhic);
					this.tzForm.setFieldValue("sc_zfbt_tz.money_total",money_total);
				}else{//职称提职早,并且职称补贴高，职务提职无效
					var month_zhiw = 0;
					var month_zhic = getMonthBetween(zhic_date,pay_date);
					
					money_total = money_jc_zhic * month_zhic;
					this.tzForm.setFieldValue("sc_zfbt_tz.month_zhiw",month_zhiw);
					this.tzForm.setFieldValue("sc_zfbt_tz.month_zhic",month_zhic);
					this.tzForm.setFieldValue("sc_zfbt_tz.money_total",money_total);
				}
			}
		}
		
		if(valueExistsNotEmpty(money_bz_zhiw) && !valueExistsNotEmpty(money_bz_zhic)){//职务存在，职称不存在
			var month_zhiw = getMonthBetween(zhiw_date,pay_date);
			
			money_total = money_jc_zhiw * month_zhiw;
			this.tzForm.setFieldValue("sc_zfbt_tz.month_zhiw",month_zhiw);
			this.tzForm.setFieldValue("sc_zfbt_tz.money_total",money_total);
		}
		
		if(!valueExistsNotEmpty(money_bz_zhiw) && valueExistsNotEmpty(money_bz_zhic)){//职称存在，职务不存在
			var month_zhic = getMonthBetween(zhic_date,pay_date);
			
			money_total = money_jc_zhic * month_zhic;
			this.tzForm.setFieldValue("sc_zfbt_tz.month_zhic",month_zhic);
			this.tzForm.setFieldValue("sc_zfbt_tz.money_total",money_total);
		}
		
	},
	/**
	 * 提供修改功能
	 * */
	showEditForm: function(){
		selectedIndex = this.tzjlList.selectedRowIndex;
		
		var items = this.tzjlList.gridRows.items;
		var tz_id =  items[selectedIndex].getFieldValue("sc_zfbt_tz.id");
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_tz.id", tz_id, "=");
        this.tzForm.refresh(res,false);
        
        this.tzForm.showInWindow({
			closeButton: false,
			x:200,
			y:200,
	        width: 800,
	        height: 300
	    });
		this.tzForm.show(true);
		
		this.tzForm.getFieldElement("sc_zfbt_tz.zhiw_name").disabled = false;
        this.tzForm.getFieldElement("sc_zfbt_tz.zhiw_date").disabled = false;
        this.tzForm.getFieldElement("sc_zfbt_tz.zhic_name").disabled = false;
        this.tzForm.getFieldElement("sc_zfbt_tz.zhic_date").disabled = false;
        this.tzForm.getFieldElement("sc_zfbt_tz.pay_date").disabled = false;
        this.tzForm.getFieldElement("sc_zfbt_tz.money_total").disabled = false;
	}
	
});

/**
 * 获取两日期之间的月数
 * 
 * @parameter
 * 	日期字符串["2014-1-1","2014-01-01"]
 * @retrun
 * 	两日期之间的月数 day2- day1
 * */
function getMonthBetween(day1,day2){
	var array1 = day1.split("-");
    var yyyy1 = parseInt(array1[0]);
    var mm1 = parseInt(array1[1]);
    var dd1 = parseInt(array1[2]);
    
    var array2 = day2.split("-");
    var yyyy2 = parseInt(array2[0]);
    var mm2 = parseInt(array2[1]);
    var dd2 = parseInt(array2[2]);
    
    return (yyyy2 - yyyy1) * 12 + (mm2 - mm1); 
}

/**
 * 判断day1是否在day2之前
 * 
 * */
function DateBefore(day1,day2){
	var array1 = day1.split("-");
    var yyyy1 = parseInt(array1[0]);
    var mm1 = parseInt(array1[1]);
    var dd1 = parseInt(array1[2]);
    
    d1 = new Date(yyyy1,mm1--,dd1);
    
    var array2 = day2.split("-");
    var yyyy2 = parseInt(array2[0]);
    var mm2 = parseInt(array2[1]);
    var dd2 = parseInt(array2[2]);
	
    d2 = new Date(yyyy2,mm2--,dd2);
	if (typeof arguments[2] != "undefined" && arguments[2])
		return (d1<=d2);
	else{
		return (d1<d2);
	}
}

function dateToStr(day){
	var yyyy = day.getFullYear();
	var mm = day.getMonth() + 1;
	var dd = day.getDay();
	
	return yyyy + '-' + mm + '-' + dd;
}

function getBtZhiw(zhiw_name){
	var zwjbMoney = 0;
	
	var restriction = "sc_zw_jb.zw_jb_id = (select  zw_jb_id from sc_zw where sc_zw.zw_name='" + zhiw_name+ "')";
    var parameters = {
        tableName: 'sc_zw_jb',
        fieldNames: toJSON(['sc_zw_jb.area_zf_std','sc_zw_jb.amount_wf_std']),
        restriction: toJSON(restriction)
    };
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    if (result.data.records.length > 0) {
    	zwjbMoney = result.data.records[0]['sc_zw_jb.amount_wf_std'];
    	//去除长数字（自动加的逗号）
    	zwjbMoney = zwjbMoney.replace(/,/,'');
    }
	
    return parseFloat(zwjbMoney);
}

function getBtZhic(zhic_name){
	var zcjbMoney = 0;
	
	var restriction = "sc_zc_jb.zc_jb_id = (select  zc_jb_id from sc_zc where sc_zc.zc_name='" + zhic_name+ "')";
    var parameters = {
        tableName: 'sc_zc_jb',
        fieldNames: toJSON(['sc_zc_jb.area_zf_std','sc_zc_jb.amount_wf_std']),
        restriction: toJSON(restriction)
    };
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    if (result.data.records.length > 0) {
    	zcjbMoney = result.data.records[0]['sc_zc_jb.amount_wf_std'];
    	//去除长数字（自动加的逗号）
    	zcjbMoney = zcjbMoney.replace(/,/,'');
    }
    
    return parseFloat(zcjbMoney);
}

function getMaxBtMoney(zhiw_name,zhic_name){
	zwjbMoney = 0;
	zcjbMoney = 0;
	
	if(valueExistsNotEmpty(zhiw_name)){
		var restriction = "sc_zw_jb.zw_jb_id = (select  zw_jb_id from sc_zw where sc_zw.zw_name='" + zhiw_name+ "')";
        var parameters = {
            tableName: 'sc_zw_jb',
            fieldNames: toJSON(['sc_zw_jb.area_zf_std','sc_zw_jb.amount_wf_std']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	zwjbMoney = result.data.records[0]['sc_zw_jb.amount_wf_std'];
        	//去除长数字（自动加的逗号）
        	zwjbMoney = zwjbMoney.replace(/,/,'');
        }
	}
	if(valueExistsNotEmpty(zhic_name)){
		var restriction = "sc_zc_jb.zc_jb_id = (select  zc_jb_id from sc_zc where sc_zc.zc_name='" + zhic_name+ "')";
        var parameters = {
            tableName: 'sc_zc_jb',
            fieldNames: toJSON(['sc_zc_jb.area_zf_std','sc_zc_jb.amount_wf_std']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	zcjbMoney = result.data.records[0]['sc_zc_jb.amount_wf_std'];
        	//去除长数字（自动加的逗号）
        	zcjbMoney = zcjbMoney.replace(/,/,'');
        }
	}
	
	if(parseFloat(zwjbMoney) > parseFloat(zcjbMoney)){
		return zwjbMoney;
	}else{
		return zcjbMoney;
	}
}

function onChangeZwZc(fieldName, selectedValue, previousValue){
	if (fieldName === "sc_zfbt_tz.zhiw_name") {
		ascZfbtTZController.tzForm.setFieldValue("sc_zfbt_tz.zhiw_name",selectedValue);
		ascZfbtTZController.calBtDetail();
		return true;
	}
	if (fieldName === "sc_zfbt_tz.zhic_name") {
		ascZfbtTZController.tzForm.setFieldValue("sc_zfbt_tz.zhic_name",selectedValue);
		ascZfbtTZController.calBtDetail();
		return true;
	}
}








