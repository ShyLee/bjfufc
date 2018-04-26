var renewController = View.createController("renewController", {
	checkDetail: function(){
		  var grid = View.panels.get('sc_zzfCardListPanel');
		  var selecteRow = grid.rows[grid.selectedRowIndex];
		    
		  var card_type = selecteRow['sc_zzfcard.card_type'];
		  var card_id = selecteRow['sc_zzfcard.card_id'];
		  if(card_type == '周转房(在校职工)'){//0;周转房(在校职工)
			  View.openDialog("asc-bj-usms-proc-house-renew-detail-em-dialog.axvw", null, false,{
				  title:'房屋租赁-租住详细',
				  width:1000,
				  height:800,
				  cardId:card_id,
				  closeButton: false});
						
		  }else if(card_type == '周转房(外来人员)'){//1;周转房(外来人员)
			  View.openDialog("asc-bj-usms-proc-house-renew-detail-outside-dialog.axvw", null, false,{
				  title:'房屋租赁-租住详细',
				  width:1000,
				  height:800,
				  cardId:card_id,
				  closeButton: false});
		  }else if(card_type == '博士后公寓'){//2;博士后公寓
			  View.openDialog("asc-bj-usms-proc-house-renew-detail-boshi-dialog.axvw", null, false,{
				  title:'房屋租赁-租住详细',
				  width:1000,
				  height:800,
				  cardId:card_id,
				  closeButton: false});
		  }
	},
	
	consolePanel_onFilter: function(){
		var date_checkin_from = this.consolePanel.getFieldValue("date_checkin_from");
    	var date_checkin_to = this.consolePanel.getFieldValue("date_checkin_to");
    	var date_checkout_ought_from = this.consolePanel.getFieldValue("date_checkout_ought_from");
    	var date_checkout_ought_to = this.consolePanel.getFieldValue("date_checkout_ought_to");
    	
    	var restriction = new Ab.view.Restriction();
    	if(valueExistsNotEmpty(date_checkin_from)){
    		restriction.addClause("sc_zzfcard.date_checkin", date_checkin_from, "&gt;=");
    	}
    	if(valueExistsNotEmpty(date_checkin_to)){
    		restriction.addClause("sc_zzfcard.date_checkin", date_checkin_to, "&lt;=");
    	}
    	if(valueExistsNotEmpty(date_checkin_from) && valueExistsNotEmpty(date_checkin_to)){
    		if(new Date(formatDate(date_checkin_from)).getTime() > new Date(formatDate(date_checkin_to)).getTime()){
        		View.showMessage("入住起始时间不能大于截止时间");
        		return;
        	}
    	}
    	
    	if(valueExistsNotEmpty(date_checkout_ought_from)){
    		restriction.addClause("sc_zzfcard.date_checkout_ought", date_checkout_ought_from, "&gt;=");
    	}
    	if(valueExistsNotEmpty(date_checkout_ought_to)){
    		restriction.addClause("sc_zzfcard.date_checkout_ought", date_checkout_ought_to, "&lt;=");
    	}
    	if(valueExistsNotEmpty(date_checkout_ought_from) && valueExistsNotEmpty(date_checkout_ought_to)){
    		if(new Date(formatDate(date_checkout_ought_from)).getTime() > new Date(formatDate(date_checkout_ought_to)).getTime()){
        		View.showMessage("应退起始时间不能大于截止时间");
        		return;
        	}
    	}
    	
        this.sc_zzfCardListPanel.refresh(restriction);
	},
	consolePanel_onClear: function(){
		this.consolePanel.clear();
		this.sc_zzfCardListPanel.refreshClearAllFilters();
	},
	
	renew: function(){
		  var grid = View.panels.get('sc_zzfCardListPanel');
		  var selecteRow = grid.rows[grid.selectedRowIndex];
		    
		  var card_type = selecteRow['sc_zzfcard.card_type'];
		  var card_id = selecteRow['sc_zzfcard.card_id'];
		  var em_id = selecteRow['sc_zzfcard.em_id'];
		  var date_checkin = selecteRow['sc_zzfcard.date_checkin'];
		  var date_checkout_ought = selecteRow['sc_zzfcard.date_checkout_ought'];
		  var date_work_begin = selecteRow['sc_zzfcard.date_work_begin'];
		  
		  var cardRecord = this.getZZFCardInfoById(card_id);
		  if(card_type == '周转房(在校职工)'){//0;周转房(在校职工)
//			  var inMonths = 0;
			  // 是否是在 2012年7月1日 之后入职, 如果是，入住累积前三年享受在市场租金下的百分比优惠政策,如果不是，入住累积前三年享受在成本租金优惠政策
//			  var isFavorable = false;//是否有优惠政策
//			  if(new Date(formatDate(date_work_begin)).getTime() >= new Date("2012-07-01").getTime()){
//				  isFavorable = true;
//				  inMonths = this.getInDaysByEmId(em_id,date_checkin,date_checkout_ought);//此员工历史有效入住周转房月数
//			  }
			  View.openDialog("asc-bj-usms-proc-house-renew-em-dialog.axvw", null, false,{
				  title:'房屋租赁-续签卡片',
				  width:1200,
				  height:400,
				  cardId:card_id,
//				  inMonths:inMonths,
//				  isFavorable:isFavorable,
				  cardRecord:cardRecord,
				  parentController:renewController,
				  closeButton: false});
		  }else if(card_type == '周转房(外来人员)'){//1;周转房(外来人员)
			  View.openDialog("asc-bj-usms-proc-house-renew-outside-dialog.axvw", null, false,{
				  title:'房屋租赁-续签卡片',
				  width:1200,
				  height:400,
				  cardId:card_id,
				  cardRecord:cardRecord,
				  parentController:renewController,
				  closeButton: false});
		  }else if(card_type == '博士后公寓'){//2;博士后公寓
			  View.openDialog("asc-bj-usms-proc-house-renew-boshi-dialog.axvw", null, false,{
				  title:'房屋租赁-续签卡片',
				  width:1200,
				  height:400,
				  cardId:card_id,
				  cardRecord:cardRecord,
				  parentController:renewController,
				  closeButton: false});
		  }
	},
	
	/**
	 * 返回 教职工的累积住宿月数
	 * 
	 * 因为一个合同的累积入住月数是在退租的时候确定并维护的，
	 * 所以此处的算法应为:
	 * 本员工实际累积入住月数 = 本教职工此前所有合同的累积月数之和 + 续签时当前合同的实际累住月数
	 * 
	 * 
	 * bug: 此种情况算累积入住月数会错误
	 *      此人拥有一套房间，但并未退租，在此处续签，获取累积月份错误（因为sc_zzfcard.total_rent 是在退租时才进行计算的）
	 * 
	 * */
	getInDaysByEmId: function(em_id,date_checkin,date_checkout_ought){
		//1.本教职工此前所有合同的累积月数之和
		var months = 0;
		var restriction = "sc_zzfcard.em_id='" + em_id + "'";
        var parameters = {
            tableName: 'sc_zzfcard',
            fieldNames: toJSON(['sc_zzfcard.total_rent']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        for(var i = 0; i < result.data.records.length; i++) {
        	months += parseInt(result.data.records[i]['sc_zzfcard.total_rent']);
        }
        
        //2.续签时当前合同的实际累住月数
        var curentCardMonths = this.getTotalRentMonth(date_checkin,date_checkout_ought);
        
        months = months + curentCardMonths;
        return months;
	},
	 /**
     * 计算当前协议的累积租住月份
     * */
    getTotalRentMonth: function(date_checkin,date_checkout_actual){
    	var arrayBegin = date_checkin.split("-");
    	var arrayEnd = date_checkout_actual.split("-");
    	
    	var totalMonths = (parseInt(arrayEnd[0]) - parseInt(arrayBegin[0])) * 12 
    					  + (parseInt(arrayEnd[1]) - parseInt(arrayBegin[1]));
    	//如果不够一个月的日期 按一个月计算
    	if(parseInt(arrayEnd[2]) > parseInt(arrayBegin[2])){
    		totalMonths++;
    	}
    		
    	return totalMonths;
    },
	getZZFCardInfoById: function(card_id){
        var restriction = "sc_zzfcard.card_id='" + card_id + "'";
        var parameters = {
            tableName: 'sc_zzfcard',
            fieldNames: toJSON(['sc_zzfcard.card_id', 'sc_zzfcard.htqx','sc_zzfcard.date_checkin','sc_zzfcard.date_checkout_ought', 'sc_zzfcard.payment_to', 'sc_zzfcard.rent_period', 'sc_zzfcard.rent_std','sc_zzfcard.em_id','sc_zzfcard.em_name','sc_zzfcard.bl_id','sc_zzfcard.fl_id','sc_zzfcard.rm_id','sc_zzfcard.identi_code']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        return result;
	}
});

/**
 * 格式化日期
 * archibus系统 获取的date类型的字符串儿， 月份与日期没有自动补零
 *     (如 我们选的日期时"2014-08-08" 但form和grid界面中显示的是"2014-8-8")
 * 如果我们从界面中获取的值是"2014-8-8"
 * 用js Date函数  new Date("2014-8-8")时,获取不到具体的时间值
 * 此函数自动补零
 * */
function formatDate(date){
    var array = date.split("-");
    var yyyy = parseInt(array[0]);
    var mm = parseInt(array[1]);
    var dd = parseInt(array[2]);
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (dd < 10) {
        dd = '0' + dd;
    }
    datastr = yyyy + "-" + mm + "-" + dd;
    return datastr;
}

