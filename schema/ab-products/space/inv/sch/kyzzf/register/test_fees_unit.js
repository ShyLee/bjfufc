function getPayDate(dateBegin,dateEnd){
    	dateBegin = dateBegin.replace(/-/g,"/") + " 00:00:00";
    	dateEnd = dateEnd.replace(/-/g,"/") + " 00:00:00";
    	
    	var begin = new Date(dateBegin);
    	var end = new Date(dateEnd); 
    	
    	return days = (end.getTime() - begin.getTime())/(3600000 * 24) + 1;
}

function feeRecord(payDate,payFee)
{
	this.payDate = payDate;
	this.payFee = payFee;
}

function cauculateFees(){
    	var arry = new Array();
    	
    	var pay_period =1;
    	var tatalFee = 132843.36;
    	
    	var date_begin ="2014-6-19";
    	var date_end = "2015-6-19";
    	var live_time = 366;
    	
    	var interval = 0;//付款间隔
    	if(pay_period == 0){//季付[每四个月付一次]
    		interval = 4;
    	}else if(pay_period == 1){//半年付
    		interval = 6;
    	}else if(pay_period == 2){//年付
    		interval = 12;
    	}
    	
		var payBegin = date_begin;
		var payEnd = null;
		var activityTime = live_time;
		var i = 0;
		do {
			var arr = payBegin.split("-");
			var yyyy = parseInt(arr[0]);
			var mm = parseInt(arr[1]);
			var dd = parseInt(arr[2]);
			
			if((mm + interval) < 12){
				mm += interval;
			}else{
				mm = mm + interval - 11;
				yyyy += 1;
			}
			
			if(mm < 10){
				mm = "0" + mm;
			}
			
			var payEnd = yyyy + "-" + mm + "-" + dd;
			//根据时间戳计算缴费天数
			payDays = this.getPayDate(payBegin,payEnd);
			
			if((activityTime - payDays) > 0){
				arry[i++] = new feeRecord(payBegin,((tatalFee/live_time) * payDays).toFixed(2));
    			activityTime -= payDays;
    			payBegin = payEnd;
			}else{
    			arry[i++] = new feeRecord(payBegin,((tatalFee/live_time) * activityTime).toFixed(2));
    			break;
			}	
		}while(activityTime > 0);
		
		return arry;
   }  
   
   
   
   console.log(cauculateFees());