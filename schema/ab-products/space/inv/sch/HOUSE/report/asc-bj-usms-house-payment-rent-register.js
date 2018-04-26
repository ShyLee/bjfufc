var ascBjUsmsHousePaymentRentRegister = View.createController(
		'ascBjUsmsHousePaymentRentRegister', {
			codeConsole_onShow : function() {
				var identicode=this.codeConsole.getFieldValue("sc_zzfcard.identi_code");
				var emid=this.codeConsole.getFieldValue("sc_zzfcard.em_id");
				var emname=this.codeConsole.getFieldValue("sc_zzfcard.em_name");
				var year=this.codeConsole.getFieldValue("sc_zzfrent_details.year");
				var restriction = new Ab.view.Restriction();
				
				if(valueExistsNotEmpty(identicode)){
					restriction.addClause("sc_zzfcard.identi_code",identicode+"%",'like');
				}
				if(valueExistsNotEmpty(emid)){
					restriction.addClause("sc_zzfcard.em_id",emid+"%",'like');
				}
				if(valueExistsNotEmpty(emname)){
					restriction.addClause("sc_zzfcard.em_name",emname+"%",'like');
				}
				if(valueExistsNotEmpty(year)){
					var restrictionDetail = new Ab.view.Restriction();
					restrictionDetail.addClause("sc_zzfrent_details.year",year,'=');
					var accountRecord=View.dataSources.get("scZzfrentDetailsHistoryDs").getRecords(restrictionDetail);
					
					if(accountRecord!=""){
						var account=this.getRestrictionDetail(accountRecord);
						if(account!=""){
							restriction.addClause('sc_zzfcard.card_id',account,'IN');
						}
						else{
							restriction.addClause('sc_zzfcard.card_id',null,'IS NULL');
						}
					}
				}
				
				this.emGrid.refresh(restriction);
			},
			
			getRestrictionDetail:function(accountRecord){
			   	 var restriction = new Ab.view.Restriction();
			       var mainIds=[];
					for(var i=0;i<accountRecord.length;i++){
						var mainId=accountRecord[i].getValue("sc_zzfrent_details.card_id");
						if(valueExistsNotEmpty(mainId)){
							mainIds.push(mainId);
						}
					}
					return mainIds;
		    },

			dengji : function() {
				var addForm = this.addForm;
				addForm.showInWindow({
					width : 800,
					height : 500
				});
				this.setValues(); 
			},
			setValues : function(){
				var emGrid = this.emGrid;
				var selectedIndex = emGrid.selectedRowIndex;
				
				var cardId = emGrid.rows[selectedIndex]["sc_zzfcard.card_id"];
				var restriction = new Ab.view.Restriction();
				restriction.addClause("sc_zzfcard.card_id", cardId, "=");
				
				
				var paymentRecord = this.scZzfcardScZzfrentDetailsDs.getRecord(restriction);
				// 在scZzfcardScZzfrentDetailsDs中取值
				// 面积
				var areaLease = paymentRecord.getValue('sc_zzfcard.area_lease');
				//每平米租金?per_rent
				var perRentField = paymentRecord.getValue('sc_zzfcard.curr_rent_rate');
				//每月租金
				var monthRent = Math.round(perRentField * areaLease, 2);
				//续费周期
				var zhouqi = paymentRecord.getValue('sc_zzfcard.rent_period');
				
				/**
				 * datePayrentLast  房租缴至  
				 * dateEnd 根据缴费周期算出 最新的到期日期
				 */
				
				var numMonth = 0;
				if(zhouqi == 'Month'){
					numMonth = 1;
				} else if(zhouqi == 'Quarter'){
					numMonth = 3;
				} else if(zhouqi == 'Year'){
					numMonth = 12;
				}
				var datePayrentLast = paymentRecord.getValue('sc_zzfcard.date_payrent_last');
				
				var nextDate = this.dateAdd('m',numMonth,datePayrentLast);
				var note1 = this.createPaymentNote(datePayrentLast,nextDate);
				
				var amountPayrent = Math.round(monthRent * numMonth, 2);
				$("monthRentText").value = monthRent;
				$("amountPayrentText").value = amountPayrent;
				$("actualPayoffText").value = amountPayrent;
				$("note1Text").value = note1;
				$("numMonth").value = numMonth;
				this.addForm.refresh(restriction);
			},
			dateAdd: function(interval,number,date){
		    	var currentDay=new Date(date.toDateString());
		        switch(interval){
		          case "m" : currentDay.setMonth(currentDay.getMonth()+number); break;
		          case "w" : currentDay.setDate(currentDay.getDate()-number);  break;
		        }
		        return   currentDay;
		    },
			createPaymentNote: function(datePayrentLastStart,datePayrentLastEnd){
				var return_note = "";
				if (datePayrentLastStart != ""){
					var payRentLastStart = new Date(datePayrentLastStart);
					return_note = "本次缴费从"+payRentLastStart.getFullYear() + "年" +　(payRentLastStart.getMonth()+ 1) + "月" + payRentLastStart.getDate()+ "日  到" + datePayrentLastEnd.getFullYear() + "年" +　(datePayrentLastEnd.getMonth()+ 1) + "月" + datePayrentLastEnd.getDate()+ "日";
				}
				return return_note;
			},
			
			saveScZzfrentDetailsForm :function (){
				// 设置值
				var emGrid = this.emGrid;
				var selectedIndex = emGrid.selectedRowIndex;
				var cardId = emGrid.rows[selectedIndex]["sc_zzfcard.card_id"];
				var restriction = new Ab.view.Restriction();
				restriction.addClause("sc_zzfcard.card_id", cardId, "=");
				
				var paymentRec = this.scZzfcardScZzfrentDetailsDs.getRecord(restriction);
				var cardId =  paymentRec.getValue('sc_zzfcard.card_id');
				var emName = paymentRec.getValue('sc_zzfcard.em_name');
				var emId = paymentRec.getValue('sc_zzfcard.em_id');
				var areaLease = paymentRec.getValue('sc_zzfcard.area_lease');
				var perRentField = paymentRec.getValue('sc_zzfcard.curr_rent_rate');
				var monthRent = $("monthRentText").value;
				var numMonth = parseInt($("numMonth").value);
				var amountPayrent = parseInt($("amountPayrentText").value);
				
				//get end date for this payment
				var datePayrentLast = paymentRec.getValue('sc_zzfcard.date_payrent_last');
				var dateEnd = paymentRec.getValue('sc_zzfcard.date_checkout_ought');
				if(Date.parse(datePayrentLast)>Date.parse(dateEnd)){
					datePayrentLast=dateEnd;
				}
				
				//续费周期
				var zhouqi = paymentRec.getValue('sc_zzfcard.rent_period');
				
				/**
				 * datePayrentLast  房租缴至  
				 * dateEnd 根据缴费周期算出 最新的到期日期
				 */
				var numMonth = 0;
				if(zhouqi == 'Month'){
					numMonth = 1;
				} else if(zhouqi == 'Quarter'){
					numMonth = 3;
				} else if(zhouqi == 'Year'){
					numMonth = 12;
				}
				
				var nextDate = this.dateAdd('m',numMonth,datePayrentLast);
				var year = nextDate.getFullYear();
				var month = nextDate.getMonth()+ 1;
				
				var note1 = $("note1Text").value;
				
				var dvName = paymentRec.getValue('sc_zzfcard.dv_name');
				var operator = View.user.name;
				var actualPayoff = parseInt($("actualPayoffText").value) ;
				
				if(actualPayoff<=0){
					alert('实缴金额不能小于等于0');
					return;
				}
				if(actualPayoff != amountPayrent){
					if(!confirm('实缴金额与应缴金额不一致，是否要继续保存?')){
						return;
					}
				}
				
				/**
				 * 插入缴费记录
				 * 先保存主表sc_zzfrent
				 * 1.先判断该年月在数据库中是否存在
				 * 2.如果存在，则更新该记录,如果不存在则插入一条记录
				 */
				var dataSourceMain=View.dataSources.get('cardMainDs');
				var restriction = new Ab.view.Restriction();
		        restriction.addClause("sc_zzfrent.year", year, "=");
		        restriction.addClause("sc_zzfrent.month", month, "=");
		        var record=dataSourceMain.getRecord(restriction);
				if(record!=""){
					var rmCount=record.getValue("sc_zzfrent.all_rm_count");
					var emCount=record.getValue("sc_zzfrent.all_em_count");
					var area=record.getValue("sc_zzfrent.area");
					var totalRent=record.getValue("sc_zzfrent.tot_rent");
					if(area==""){
						area=0;
					}
					if(totalRent==""){
						totalRent=0;
					}
					record.setValue("sc_zzfrent.all_rm_count",parseFloat(rmCount)+1);
					record.setValue("sc_zzfrent.all_em_count",parseFloat(emCount)+1);
					record.setValue("sc_zzfrent.area",parseFloat(area)+parseFloat(areaLease));
					record.setValue("sc_zzfrent.tot_rent",parseFloat(totalRent)+parseFloat(actualPayoff));
					dataSourceMain.saveRecord(record);
				}else{
					var cardMainRecord = new Ab.data.Record();
					cardMainRecord.setValue("sc_zzfrent.year",year);
					cardMainRecord.setValue("sc_zzfrent.month",month);
					cardMainRecord.setValue("sc_zzfrent.all_rm_count",1);
					cardMainRecord.setValue("sc_zzfrent.all_em_count",1);
					cardMainRecord.setValue("sc_zzfrent.area",areaLease);
					cardMainRecord.setValue("sc_zzfrent.tot_rent",actualPayoff);
					dataSourceMain.saveRecord(cardMainRecord);
				}
				
				var cardDetailrecord = new Ab.data.Record();
				cardDetailrecord.isNew = true;
				cardDetailrecord.setValue('sc_zzfrent_details.card_id',cardId);
				cardDetailrecord.setValue('sc_zzfrent_details.year',year);
				cardDetailrecord.setValue('sc_zzfrent_details.month',month);
				cardDetailrecord.setValue('sc_zzfrent_details.em_id',emId);
				cardDetailrecord.setValue('sc_zzfrent_details.em_name',emName);
				cardDetailrecord.setValue('sc_zzfrent_details.month_rent',monthRent);
				cardDetailrecord.setValue('sc_zzfrent_details.area_lease',areaLease);
				cardDetailrecord.setValue('sc_zzfrent_details.per_rent',perRentField);
				cardDetailrecord.setValue('sc_zzfrent_details.amount_payrent',amountPayrent);
				cardDetailrecord.setValue('sc_zzfrent_details.note1',note1);
				cardDetailrecord.setValue('sc_zzfrent_details.dv_name',dvName);
				cardDetailrecord.setValue('sc_zzfrent_details.operator',operator);
				cardDetailrecord.setValue('sc_zzfrent_details.actual_payoff',actualPayoff);
				cardDetailrecord.setValue('sc_zzfrent_details.date_payrent',new Date());
				this.scZzfrentDetailsDs.saveRecord(cardDetailrecord);
				 
				// 更新card表缴至时间,
				var res=new Ab.view.Restriction();
				res.addClause('sc_zzfcard.card_id',cardId,'=');
				var record=this.scZzfcardCardDs.getRecord(res);
				var actualPay=record.getValue("sc_zzfrent.actual_payoff");
				if(actualPay==undefined){
					actualPay=0;
				}
				record.setValue('sc_zzfcard.actual_payoff',parseFloat(actualPay)+parseFloat(actualPayoff));
				record.setValue('sc_zzfcard.date_payrent_last',nextDate);
				this.scZzfcardCardDs.saveRecord(record);
				this.showRecord();
			},
			showRecord : function() {
				var emGrid = this.emGrid;
				var selectedIndex = emGrid.selectedRowIndex;
				var cardId = emGrid.rows[selectedIndex]["sc_zzfcard.card_id"];
				var historyGrid = this.historyGrid;
				var restriction = new Ab.view.Restriction();
				restriction.addClause("sc_zzfrent_details.card_id", cardId, "=");
				historyGrid.refresh(restriction);
			}
		});

Array.prototype.in_array = function(e)  
{  
	for(i=0;i<this.length && this[i]!=e;i++);  
	return !(i==this.length);  
} 
