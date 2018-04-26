function AUSC_getDataRecord(panel){
	var dataSourceId =  panel.dataSourceId;
	var recordValues = AUSC_getDataRecordValues(dataSourceId);
	return recordValues;
}

function AUSC_getDataRecordValues(dataSourceId){

	var dataSource = View.dataSources.get(dataSourceId);
	var formattedValues = {};
	 
	for(var i=0;i<dataSource.fieldDefs.items.length;i++){
		
		var fieldId = dataSource.fieldDefs.items[i].id;
		if(AUSC_containField(fieldId) == true){
			formattedValues[fieldId] = AUSC_getFieldValue(fieldId);
		}				
	}
	
	return formattedValues;
}

function AUSC_containField(fieldId){
	for(var i=0;i<View.panels.items.length;i++){
		var panel = View.panels.items[i];
		
		if(panel.type != 'form') continue;
		
		if(panel.containsField(fieldId)){
			return true;		
		}	
	}
	return false;
}

function AUSC_getFieldValue(fieldId){
	var value = '';
	for(var i=0;i<View.panels.items.length;i++){
		var panel = View.panels.items[i];
		
		View.log(panel.id,"info");
		if(panel.type != 'form') continue;
		
		if(panel.containsField(fieldId)){
			// convert to string
			value = panel.getFieldValue(fieldId) + '';		
			break;
		}	
	}
	return value;
}
/**
 * 计算两个日期之间相差几个月
 * @param {Object} beginDate
 * @param {Object} endDate
 */

function AUSC_DateDiff(beginDate,endDate)    
{            
    //the endDate should add one day before calculate the diff months
	var temp_endDate = new Date(endDate.replace(/\-/g, "/"));
	var newEndDate = dateAddDays(temp_endDate,1);
    var Month1,Month2,iMonths;
    Month1=parseInt(beginDate.split("-")[0],10)*12+parseInt(beginDate.split("-")[1],10);
    Month2=parseInt(newEndDate.split("-")[0],10)*12+parseInt(newEndDate.split("-")[1],10);
    iMonths = Month2-Month1;    
    return iMonths;     
}


function AUSC_disableField(field){
	if ($(field)) {
        //$(field).value = "";
        $(field).style.readOnly = true;
        $(field).disabled = true;
    }
}

function getCurrentDate_Client()
{
	var returnedDate = "";
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	  = curDate.getDate();
	var year  = curDate.getFullYear();
	returnedDate = year + "-" + month + "-" + day;
	return returnedDate;
}

function getCurrentDate_Server()
{
	var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-getSysDate');
	var returnedDate = result.message;
	var temps = returnedDate.split(',');
	if (temps.length == 2){
		var curDate = temps[0].substr(9,10)
		return curDate;
	}
	return null;
}

function AUSC_getCurrentDate()
{
	//var curDate = getCurrentDate_Client();
	//var curDate = getCurrentDate_Server();
	var returnedDate = new Date();
	return returnedDate;
}

function AUSC_getCurrentYear(){
	return AUSC_getCurrentDate().getFullYear();
}

function AUSC_getCurrentMonth(){
	var month = AUSC_getCurrentDate().getMonth()+ 1;
	while (month.length < 2) month = "0" + month;
	return month;
}

function AUSC_getCurrentDay(){
	var day	= AUSC_getCurrentDate().getDate().toString();
	while (day.length < 2) day = "0" + day;
	return day;
}

function AUSC_getCurrentDateInISOFormat()
{
	var curDate = new Date();
    var month = curDate.getMonth() + 1;
    var day = curDate.getDate();
    var year = curDate.getFullYear();
    
    return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
}

//get the days between two dates
function getDays(date1, date2){
    var ONE_DAY = 1000 * 60 * 60 * 24;
    var date1Ms = date1.getTime();
    var date2Ms = date2.getTime();
    var dateDiff = Math.abs(date1Ms - date2Ms);
    var numDays = Math.round(dateDiff / ONE_DAY);
    
    return numDays;
}

function dateRangeInterval(startDate, endDate){
    // alert(endDate.replace(/\-/g, "/"));
    var sDate = new Date(startDate.replace(/\-/g, "/"));
    var eDate = new Date(endDate.replace(/\-/g, "/"));
    var drDays = (eDate.getTime() - sDate.getTime()) / 3600 / 1000 / 24;
    return drDays;
}

function fixedFromDate_toToDate(fromDate, intervalDays){
    var toDate = null;
    var temp_datefrom = new Date(fromDate.replace(/\-/g, "/"));
    temp_datefrom.setDate(temp_datefrom.getDate() + intervalDays);
    toDate = temp_datefrom.getFullYear() + "-" + (temp_datefrom.getMonth() + 1) + "-" + temp_datefrom.getDate();
    return toDate;
}

//get the date of adding some days
function dateAddDays(date_start, nxtdays){
    var date_new = new Date(date_start.getTime() + nxtdays * (24 * 60 * 60 * 1000));
    var month = date_new.getMonth() + 1;
    if (month < 10) 
        month = "0" + month;
    var day = date_new.getDate();
    if (day < 10) 
        day = "0" + day;
    return date_new.getFullYear() + '-' + month + '-' + day;
}

//get the date after one year of current date
function getDateAfterOneYear(){
    var curDate = new Date();
    var month = curDate.getMonth() + 1;
    if (month < 10) 
        month = "0" + month;
    var day = curDate.getDate();
    if (day < 10) 
        day = "0" + day;
    var year = curDate.getFullYear() + 1;
    return year + '-' + month + '-' + day;
}

//get the date after half of month of current date
function getDateAfterHalfMonth(){
    var curDate = new Date();
    var endDate = dateAddDays(curDate, 14);
    return endDate;
}