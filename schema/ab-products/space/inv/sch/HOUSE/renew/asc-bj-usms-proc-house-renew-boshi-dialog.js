
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
    if(mm < 10){
    	mm = '0' + mm;
    }
    if(dd < 10){
    	dd = '0' + dd;
    }
    datastr = yyyy + "-" + mm + "-" + dd;
    return datastr;
}



var renewBoshiController = View.createController("renewBoshiController", {
	cardId: null,
	cardRecord: null,
	parentController: null,
	afterInitialDataFetch: function(){
		if (this.view.parameters){
        	this.cardId = this.view.parameters['cardId'];
        	this.cardRecord = this.view.parameters['cardRecord'];
        	this.parentController = this.view.parameters['parentController'];
		}
		
		var cardRecord = this.cardRecord;
		if (cardRecord.data.records.length > 0) {
//	            var htqx = cardRecord.data.records[0]['sc_zzfcard.htqx'];
				var htqx = "2年";
	            var date_checkout_ought = cardRecord.data.records[0]['sc_zzfcard.date_checkout_ought'];
	            var pay_way = cardRecord.data.records[0]['sc_zzfcard.payment_to'];
	            var rent_period = cardRecord.data.records[0]['sc_zzfcard.rent_period'];
	            if(pay_way == '财务处代扣'){
	            	pay_way="finance";
	            }else if(pay_way == '国资处自缴'){
	            	pay_way="house";
	            }else{
	            	pay_way="";
	            }
	            //Month;按月;Quarter;按季度;Halfyear;按半年;Year;按年
	            if(rent_period == "按月"){
	            	rent_period = "Month";
	            }else if(rent_period == "按季度"){
	            	rent_period = "Quarter";
	            }else if(rent_period == "按半年"){
	            	rent_period = "Halfyear";
	            }else if(rent_period == "按年"){
	            	rent_period = "Year";
	            }
		 }else{
			  return;
		 }
		 this.boshiRenewPanel.setFieldValue('sc_zzf_renew.card_id',this.cardId);
		 this.boshiRenewPanel.setFieldValue('sc_zzf_renew.htqx',htqx);
		 this.boshiRenewPanel.setFieldValue('sc_zzf_renew.date_renew',new Date());
		  //合同起始日期
		 var date_begin = this.getNextDay(date_checkout_ought);
		 this.boshiRenewPanel.setFieldValue('sc_zzf_renew.date_begin',date_begin);
		  //根据 合同期限 返回合同截至日期
		 var date_end = this.getDateEnd(date_begin,htqx);
		 this.boshiRenewPanel.setFieldValue('sc_zzf_renew.date_end',date_end);
		 this.boshiRenewPanel.setFieldValue('sc_zzf_renew.pay_begin',date_begin);
		 this.boshiRenewPanel.setFieldValue('sc_zzf_renew.pay_way',pay_way);
		 this.boshiRenewPanel.setFieldValue('sc_zzf_renew.rent_period',rent_period);
	},
	/**
	 * 返回当前日期的下一天
	 * */
	getNextDay: function(date_begin){
		var time = new Date(formatDate(date_begin)).getTime() + 1000 * 60 * 60 * 24;
		var date = new Date(time);
		var strYear = date.getFullYear();
	    var strDay = date.getDate();
	    var strMonth = date.getMonth() + 1;
	    return strYear + "-" + strMonth + "-" + strDay;
	},
	
	/**
	 * 获取续签的截至日期
	 * 
	 * return 日期字符串
	 * */
	getDateEnd: function(date_begin,htqx){
		var num = parseInt(htqx.substring(0,htqx.length - 1));
		var unit = htqx.substring(htqx.length - 1,htqx.length);
		var array = date_begin.split("-");
		var yyyy = parseInt(array[0]);
		var mm = parseInt(array[1]);
		var dd = parseInt(array[2]);
		
		if(unit == "年"){//
			yyyy = yyyy + num;
			return yyyy + "-" + mm + "-" + dd;
		}else if(unit == "月"){
			mm = mm + num;
			var yyyy = parseInt(mm/12) + yyyy;
			var mm = mm%12;
			if(mm == 0)
				mm = 12;
			
			return yyyy + "-" + mm + "-" + dd;
			
		}else if(unit == "天"){
			var time = new Date(formatDate(date_begin)).getTime() + 1000 * 60 * 60 * 24 * num;
			var date = new Date(time);
			var strYear = date.getFullYear();
		    var strDay = date.getDate();
		    var strMonth = date.getMonth() + 1;
		    return strYear + "-" + strMonth + "-" + strDay;
		}else{
			return null;
		}
		
	},
	/**
	 * 获取当前协议的续签次数
	 * */
	getRenewedNum: function(card_id){
		var restriction = "sc_zzf_renew.card_id='" + card_id + "'";
        var parameters = {
            tableName: 'sc_zzf_renew',
            fieldNames: toJSON(['sc_zzf_renew.card_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        return result.data.records.length;
	},
	boshiRenewPanel_onSave: function(){
		var date_end = this.boshiRenewPanel.getFieldValue('sc_zzf_renew.date_end');
		var price_lately = this.boshiRenewPanel.getFieldValue('sc_zzf_renew.money_one');
		
		var money_one = this.boshiRenewPanel.getFieldValue('sc_zzf_renew.money_one');
		if(!valueExistsNotEmpty(money_one)){
			View.showMessage("租金不能为空!");
			return;
		}
		
		var controller = this;
		View.confirm("确定要把合同续签到:[" + date_end + "]吗？", function(button){
			if (button == 'yes') {
				
				var n = controller.getRenewedNum(controller.cardId,date_end);
				if( n == 0){
					controller.saveStarRentedInfo();
					
					controller.boshiRenewPanel.setFieldValue('sc_zzf_renew.renew_name',"第1次续签");
					controller.boshiRenewPanel.setFieldValue('sc_zzf_renew.is_activity',"1");
					controller.boshiRenewPanel.save();
				}else{
					controller.boshiRenewPanel.setFieldValue('sc_zzf_renew.renew_name',"第" + n + "次续签");
					controller.boshiRenewPanel.setFieldValue('sc_zzf_renew.is_activity',"1");
					controller.boshiRenewPanel.save();
				}
				controller.boshiRenewPanel.actions.get('save').enable(false);
				
				//维护合同信息
				controller.updateScZZFCardInfo(controller.cardId,date_end,price_lately);
				//维护续签记录信息由后台触发器完成,续签后，本次续签之前的所有续签记录变为无效
				
				var dateBegin = controller.boshiRenewPanel.getFieldValue('sc_zzf_renew.date_begin');
				var period = controller.boshiRenewPanel.getFieldValue('sc_zzf_renew.rent_period');
				var price = controller.boshiRenewPanel.getFieldValue('sc_zzf_renew.money_one');
				var otherRent = controller.boshiRenewPanel.getFieldValue('sc_zzf_renew.xq_other_rent');
				var cardId = controller.cardId;
				var area = controller.getProtocolArea(cardId);
				try {
		            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-CalcZzfRent-othersPaymentHandle', dateBegin,date_end, period, famatFloat(price),famatFloat(otherRent),cardId, famatFloat(area));
		        } 
		        catch (e) {
		            Workflow.handleError(e);
		        }
				
				//刷新父类列表
				if (controller.parentController.id == 'renewController') {
                    controller.parentController.sc_zzfCardListPanel.refresh();
                }
                else 
                    if (controller.parentController.id == 'ascProtocolWarnController') {
                        controller.parentController.zzf_fee_detail.refresh();
                    }
				
				View.showMessage("续签成功!");
			}	
		});
	},
	/**
	 * 获得协议面积
	 */
	getProtocolArea:function(cardId){
		var record=this.sc_zzfcardDataSource.getRecord({'sc_zzfcard.card_id':cardId});
        var area = record.getValue('sc_zzfcard.area_lease');
		return area;
	},
	/**
	 * 维护合同信息
	 * */
	updateScZZFCardInfo: function(cardId,date_end,price_lately){
		var record=this.sc_zzfcardDataSource.getRecord({'sc_zzfcard.card_id':cardId});
		record.setValue('sc_zzfcard.card_status','yxq');
		record.setValue('sc_zzfcard.date_checkout_ought',date_end);	
		record.setValue('sc_zzfcard.price_lately',price_lately);	
		
		this.sc_zzfcardDataSource.saveRecord(record);
	},
	boshiRenewPanel_onCancel: function(){
		View.closeThisDialog();
	},
	/**
	 * 保存起租信息
	 * */
	saveStarRentedInfo: function(){
		var cardRecord = this.cardRecord;
		if (cardRecord.data.records.length > 0) {
	         var htqx = cardRecord.data.records[0]['sc_zzfcard.htqx'];
	         var date_checkin = cardRecord.data.records[0]['sc_zzfcard.date_checkin'];
	         var date_checkout_ought = cardRecord.data.records[0]['sc_zzfcard.date_checkout_ought'];
	         
	     	var newRec = new Ab.data.Record({
				'sc_zzf_renew.card_id':this.cardId,
				'sc_zzf_renew.renew_name':"起租",
				'sc_zzf_renew.is_activity':'0',
				'sc_zzf_renew.htqx':htqx,
				'sc_zzf_renew.date_begin':date_checkin,
				'sc_zzf_renew.date_end':date_checkout_ought
			} , true);
			
			try{
				var ds = this.renewDataSource;
			 	var result = ds.saveRecord(newRec);
			}catch(e){
				View.showMessage('error' , "保存起租信息" , e.message , e.data);
			}
		}
	}
	

});

function famatFloat(str){
	if(!valueExistsNotEmpty(str)){
    	return price1 = 0.0;
    }else{
    	return parseFloat(str);
    }
}
