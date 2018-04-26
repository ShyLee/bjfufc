
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



var renewEmController = View.createController("renewEmController", {
	cardId: null,
	inMonths: null, //员工累积入住周转房月份
	cardRecord: null,
	parentController: null,
	isFavorable: false,
	afterInitialDataFetch: function(){
		if (this.view.parameters){
        	this.cardId = this.view.parameters['cardId'];
//        	this.inMonths = this.view.parameters['inMonths'];
        	this.cardRecord = this.view.parameters['cardRecord'];
        	this.parentController = this.view.parameters['parentController'];
//        	this.isFavorable = this.view.parameters['isFavorable'];
		}
		
		var cardRecord = this.cardRecord;
		if (cardRecord.data.records.length > 0) {
//	            var htqx = cardRecord.data.records[0]['sc_zzfcard.htqx'];
			 	var htqx = "1年";
	            var date_checkout_ought = cardRecord.data.records[0]['sc_zzfcard.date_checkout_ought'];
	            var date_checkin = cardRecord.data.records[0]['sc_zzfcard.date_checkin'];
	            var pay_way = cardRecord.data.records[0]['sc_zzfcard.payment_to'];
	            var rent_period = cardRecord.data.records[0]['sc_zzfcard.rent_period'];
	            var rent_std = cardRecord.data.records[0]['sc_zzfcard.rent_std'];
	            
	            /*
	             * 这里的rent_std是从sc_zzfcard表中直接获取的，没有做任何处理
	             * 处理逻辑如下，开始5年每年递增10%，后面递增50%
	             */
	            var emId = cardRecord.data.records[0]["sc_zzfcard.em_id"];
	            var blId = cardRecord.data.records[0]["sc_zzfcard.bl_id"];
	            var flId = cardRecord.data.records[0]["sc_zzfcard.fl_id"];
	            var rmId = cardRecord.data.records[0]["sc_zzfcard.rm_id"];
	            
	            var restriction = "rm.rm_id='" + rmId + "' and rm.fl_id='" + flId + "' and rm.bl_id='"+ blId +"'";
	            var parameters = {
	                tableName: 'rm',
	                fieldNames: toJSON(['rm.rm_cat','rm.rm_type','rm.rm_id','rm.fl_id','rm.bl_id']),
	                restriction: toJSON(restriction)
	            };
	            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	            
	            var rmType = result.data.records[0]['rm.rm_type'];
	            
	            /**计算新租金标准的方法**/
	            rent_std = this.calRent_std(rmType,date_checkin,date_checkout_ought,emId,rent_std);
	            
	            
	            if(pay_way == '财务处代扣'){
	            	pay_way="finance";
	            }else if(pay_way == '自缴'){
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
		 this.emRenewPanel.setFieldValue('sc_zzf_renew.card_id',this.cardId);
		 this.emRenewPanel.setFieldValue('sc_zzf_renew.htqx',htqx);
		 this.emRenewPanel.setFieldValue('sc_zzf_renew.date_renew',new Date());
		  //合同起始日期
		 var date_begin = this.getNextDay(date_checkout_ought);
		 //var date_begin = date_checkout_ought;
		 this.emRenewPanel.setFieldValue('sc_zzf_renew.date_begin',date_begin);
		  //根据 合同期限 返回合同截至日期
		 var date_end = nYearsLaterSameDayTwoByLeiLin(date_begin,htqx);
		 
		 this.emRenewPanel.setFieldValue('sc_zzf_renew.date_end',date_end);
		 this.emRenewPanel.setFieldValue('sc_zzf_renew.pay_begin',date_begin);
		 this.emRenewPanel.setFieldValue('sc_zzf_renew.pay_way',pay_way);
		 this.emRenewPanel.setFieldValue('sc_zzf_renew.rent_period',rent_period);
		 this.emRenewPanel.setFieldValue('sc_zzf_renew.rent_std',rent_std);
		 
		this.changePaymentTo();
//		 this.setPreForEm(date_begin,this.inMonths,this.isFavorable);
	},
	
	
	calRent_std : function(rmType,date_checkin,date_checkout_ought,emId,rent_std) {
    	//按套类判断
    	var res = new Ab.view.Restriction();
    	res.addClause("sc_zzfcard.em_id",emId);
    	this.rmTypeDs.addParameter("rmtypeRes",rmType);
    	var recordsType = this.rmTypeDs.getRecords(res);
    	
    	var sumMonth = 0;
    	var rent = 0;
    	
    	if( rmType=='30601' ) {
    		if ( recordsType.length > 0 ) {  //大于0说明住过多套A类周转房
        		for(var i=0; i<recordsType.length; i++) {
    				//续签表中没有此合约的续签记录，入住和，应退时间从sc_zzfcard表中获取
        			var ruzhuTime = recordsType[i].getValue("sc_zzfcard.date_checkin");
        			var daoqiTime = recordsType[i].getValue("sc_zzfcard.date_checkout_ought");
    				sumMonth = sumMonth + this.calRentMonth(ruzhuTime.Format("yyyy-MM-dd"),daoqiTime.Format("yyyy-MM-dd"));
        		}
        	}
        	
        	var rentNumber = rent_std.split("(")[0];
        	if( sumMonth>=12 && sumMonth<60 ) {
        		rent = eval(rentNumber*1.1).toFixed(2)
        		//rent = Math.pow(rentNumber,4)
        	} else if ( sumMonth>=60 ) {
        		rent = eval(rentNumber*1.5).toFixed(2);
        	}
        	rent = parseFloat(rent).toFixed(0)
        	return rent + "(" + rent_std.split("(")[1];
    	} else {
    		if ( recordsType.length > 0 ) {  //大于0说明住过多套A类周转房
        		for(var i=0; i<recordsType.length; i++) {
    				//续签表中没有此合约的续签记录，入住和，应退时间从sc_zzfcard表中获取
        			var ruzhuTime = recordsType[i].getValue("sc_zzfcard.date_checkin");
        			var daoqiTime = recordsType[i].getValue("sc_zzfcard.date_checkout_ought");
    				sumMonth = sumMonth + this.calRentMonth(ruzhuTime.Format("yyyy-MM-dd"),daoqiTime.Format("yyyy-MM-dd"));
        		}
        	}
        	
        	var rentNumber = rent_std.split("(")[0];
        	if( sumMonth>=12 && sumMonth<60 ) {
        		rent = eval(rentNumber*1.1).toFixed(2)
        		//rent = Math.pow(rentNumber,4)
        	} else if ( sumMonth>=60 ) {
        		rent = eval(rentNumber*1.5).toFixed(2);
        	}
        	return rent + "(" + rent_std.split("(")[1];
    	}
	},
	
	
	
	
	//根据入住日期应退日期，计算入住月数
	calRentMonth: function(date_checkin,date_checkout_ought){
    	var arrayBegin = date_checkin.split("-");
    	var arrayEnd = date_checkout_ought.split("-");
    	
    	var totalMonths = (parseInt(arrayEnd[0]) - parseInt(arrayBegin[0])) * 12 
    					  + (parseInt(arrayEnd[1]) - parseInt(arrayBegin[1]));
    	//如果不够一个月的日期 按一个月计算
    	if(parseInt(arrayEnd[2]) > parseInt(arrayBegin[2])){
    		totalMonths++;
    	}
    		
    	return totalMonths;
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
	 * 为在校职工设置优惠政策
	 * 
	 * @parameter:
	 *         date_begin --- 开始日期
	 *         inMonths  --- 员工累积入住周转房月份
	 *         isFavorable --- 是否是在 2012年7月1日 之后入职, 如果是，入住累积前三年享受在市场租金下的百分比优惠政策,如果不是，入住累积前三年享受在成本租金优惠政策
	 * */
	setPreForEm: function(date_begin,inMonths,isFavorable){
		if(inMonths == 0){
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_begin',date_begin);
			var date_end = this.getDateEnd(date_begin,'1年');
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_end',date_end);
			if(isFavorable){
				this.emRenewPanel.setFieldValue('sc_zzf_renew.rate_one',60);
			}
		}else if(inMonths == 12){
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_begin',date_begin);
			var date_end = this.getDateEnd(date_begin,'1年');
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_end',date_end);
			if(isFavorable){
				this.emRenewPanel.setFieldValue('sc_zzf_renew.rate_one',70);
			}
		}else if(inMonths == 24){
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_begin',date_begin);
			var date_end = this.getDateEnd(date_begin,'1年');
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_end',date_end);
			if(isFavorable){
				this.emRenewPanel.setFieldValue('sc_zzf_renew.rate_one',80);
			}
		}else if(inMonths >= 36){
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_begin',date_begin);
			var date_end = this.getDateEnd(date_begin,'1年');
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_end',date_end);
			if(isFavorable){
				this.emRenewPanel.setFieldValue('sc_zzf_renew.rate_one',100);
			}
		}else if (inMonths > 0 && inMonths < 12){
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_begin',date_begin);
			var date_end = this.getDateEnd(date_begin,(12 - inMonths) + "月");
			var date_end2 = this.getDateEnd(date_begin,'1年');
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_end',date_end);
			if(isFavorable){
				this.emRenewPanel.setFieldValue('sc_zzf_renew.rate_one',60);
			}
			
			var date_begin = this.getNextDay(date_end);
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_two_begin',date_begin);
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_two_end',date_end2);
			if(isFavorable){
				this.emRenewPanel.setFieldValue('sc_zzf_renew.rate_two',70);
			}
		}else if (inMonths > 12 && inMonths < 24){
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_begin',date_begin);
			var date_end = this.getDateEnd(date_begin,(12 - (inMonths%12)) + "月");
			var date_end2 = this.getDateEnd(date_begin,'1年');
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_end',date_end);
			if(isFavorable){
				this.emRenewPanel.setFieldValue('sc_zzf_renew.rate_one',70);
			}
			
			var date_begin = this.getNextDay(date_end);
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_two_begin',date_begin);
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_two_end',date_end2);
			if(isFavorable){
				this.emRenewPanel.setFieldValue('sc_zzf_renew.rate_two',80);
			}
		}else if (inMonths > 24 && inMonths < 36){
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_begin',date_begin);
			var date_end = this.getDateEnd(date_begin,(12 - (inMonths%12)) + "月");
			var date_end2 = this.getDateEnd(date_begin,'1年');
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_one_end',date_end);
			if(isFavorable){
				this.emRenewPanel.setFieldValue('sc_zzf_renew.rate_one',80);
			}
			
			var date_begin = this.getNextDay(date_end);
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_two_begin',date_begin);
			this.emRenewPanel.setFieldValue('sc_zzf_renew.date_two_end',date_end2);
			if(isFavorable){
				this.emRenewPanel.setFieldValue('sc_zzf_renew.rate_two',100);
			}
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
	emRenewPanel_onSave: function(){
		var date_end = this.emRenewPanel.getFieldValue('sc_zzf_renew.date_end');
		var rent_std = this.emRenewPanel.getFieldValue('sc_zzf_renew.rent_std');
		var pay_way = this.emRenewPanel.getFieldValue('sc_zzf_renew.pay_way');
		var rent_period = this.emRenewPanel.getFieldValue('sc_zzf_renew.rent_period');
//		var money_one = this.emRenewPanel.getFieldValue('sc_zzf_renew.money_one');
//		var money_two = this.emRenewPanel.getFieldValue('sc_zzf_renew.money_two');
		if(!valueExistsNotEmpty(rent_std) ){
			View.showMessage("租金不能为空!");
			return;
		}
//		var a = parseFloat(money_one);
//		var b = parseFloat(money_two);
		var controller = this;
		View.confirm("确定要把合同续签到:[" + date_end + "]吗？", function(button){
			if (button == 'yes') {
				
				var n = controller.getRenewedNum(controller.cardId,date_end);
				if( n == 0){
					controller.saveStarRentedInfo();
					
					controller.emRenewPanel.setFieldValue('sc_zzf_renew.renew_name',"第1次续签");
					controller.emRenewPanel.setFieldValue('sc_zzf_renew.is_activity',"1");
					controller.emRenewPanel.save();
				}else{
					controller.emRenewPanel.setFieldValue('sc_zzf_renew.renew_name',"第" + n + "次续签");
					controller.emRenewPanel.setFieldValue('sc_zzf_renew.is_activity',"1");
					controller.emRenewPanel.save();
				}
				controller.emRenewPanel.actions.get('save').enable(false);
				
				//维护合同信息
				controller.updateScZZFCardInfo(controller.cardId,date_end,rent_std,pay_way,rent_period);
				
				//维护续签记录信息由后台触发器完成,续签后，本次续签之前的所有续签记录变为无效
				
//				var dateBegin = controller.emRenewPanel.getFieldValue('sc_zzf_renew.date_begin');
////				var dateBegin2 = controller.emRenewPanel.getFieldValue('sc_zzf_renew.date_two_begin');
//				var dateEnd = controller.emRenewPanel.getFieldValue('sc_zzf_renew.date_end');
//                var period = controller.emRenewPanel.getFieldValue('sc_zzf_renew.rent_period');
//                var price1 = controller.emRenewPanel.getFieldValue('sc_zzf_renew.money_one');
////                var price2 = controller.emRenewPanel.getFieldValue('sc_zzf_renew.money_two');
////                var rate1 = controller.emRenewPanel.getFieldValue('sc_zzf_renew.rate_one');
////                var rate2 = controller.emRenewPanel.getFieldValue('sc_zzf_renew.rate_two');
//                var otherRent = controller.emRenewPanel.getFieldValue('sc_zzf_renew.xq_other_rent');
//                var cardId = controller.cardId;
//                var area = controller.getProtocolArea(cardId);
//                
//				try {
//		            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-CalcZzfRent-othersPaymentHandle', dateBegin, date_end, period, famatFloat(price1), famatFloat(otherRent), cardId, famatFloat(area));
//		        } 
//		        catch (e) {
//		            Workflow.handleError(e);
//		        }
				
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
	updateScZZFCardInfo: function(cardId,date_end,rent_std,pay_way,rent_period){
		var record=this.sc_zzfcardDataSource.getRecord({'sc_zzfcard.card_id':cardId});
		record.setValue('sc_zzfcard.card_status','yxq');
		record.setValue('sc_zzfcard.date_checkout_ought',date_end);	
		record.setValue('sc_zzfcard.date_payrent_last',date_end);	
		record.setValue('sc_zzfcard.rent_std',rent_std);	
		record.setValue('sc_zzfcard.payment_to',pay_way);	
		record.setValue('sc_zzfcard.rent_period',rent_period);	
		
		this.sc_zzfcardDataSource.saveRecord(record);
	},
	emRenewPanel_onCancel: function(){
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
	         var rent_std = cardRecord.data.records[0]['sc_zzfcard.rent_std'];
	         
	     	var newRec = new Ab.data.Record({
				'sc_zzf_renew.card_id':this.cardId,
				'sc_zzf_renew.renew_name':"起租",
				'sc_zzf_renew.is_activity':'0',
				'sc_zzf_renew.htqx':htqx,
				'sc_zzf_renew.date_begin':date_checkin,
				'sc_zzf_renew.date_end':date_checkout_ought,
				'sc_zzf_renew.rent_std':rent_std
			} , true);
			
			try{
				var ds = this.renewDataSource;
			 	var result = ds.saveRecord(newRec);
			}catch(e){
				View.showMessage('error' , "保存起租信息" , e.message , e.data);
			}
		}
	},
	changePaymentTo: function(){
        var payment = this.emRenewPanel.getFieldValue('sc_zzf_renew.pay_way');
        if (payment == 'finance') {
            this.emRenewPanel.setFieldValue('sc_zzf_renew.rent_period', 'Month');
            jQuery('#emRenewPanel_sc_zzf_renew\\.rent_period').attr('disabled', 'disabled');
        }
        else {
            jQuery('#emRenewPanel_sc_zzf_renew\\.rent_period').attr('disabled', false);
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

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function nYearsLaterSameDayTwoByLeiLin(date, n){
	var date = new Date(date);
	date.setDate(date.getDate()-1);
	date.setFullYear(date.getFullYear() + parseInt(n, 10));
	var checkOutDate = date.Format("yyyy-MM-dd");
	return checkOutDate;
}


