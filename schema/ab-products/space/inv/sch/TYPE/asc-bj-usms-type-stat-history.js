/**
 * @author Keven.xi
 */
var abScVwVacantAreabyBl = View.createController('abScVwVacantAreabyBlController', {
	
	fromYear:"",
	toYear:"",
	
	afterInitialDataFetch: function(){
        this.setDefault();
        //this.abScRptRmsDatabyRmcatTypeConsolePanel_onShow();
    },
	/**
	 * show the Rooms Summary data by room category and type in the years user filter 
	 * @param {Object} row
	 */
    abScRptRmsDatabyRmcatTypeConsolePanel_onShow: function(){
		var restriction = this.getRestriction();
		this.abScRptRmsDatabyRmcatTypeCrossPanel.refresh(restriction);
    },
	
	abScRptRmsDatabyRmcatTypeConsolePanel_onClear:function(){
		this.abScRptRmsDatabyRmcatTypeConsolePanel.clear();
	},
	/**
	 * 
	 */
	abScRptRmsDatabyRmcatTypeCrossPanel_afterRefresh:function(){
		var title = String.format(getMessage('rptPanelTitle'), this.fromYear+"-"+this.toYear);
		this.abScRptRmsDatabyRmcatTypeCrossPanel.setTitle(title);
	},
	
	//set From Date(current date minus one year) and To Date(current date)
    setDefault: function(){
        //get current date
        var date = new Date();
        var year = date.getFullYear();
        var lastYear = date.getFullYear() - 1;
        var month = date.getMonth() + 1;
        var day = date.getDate();
        
        //set fileds
        this.abScRptRmsDatabyRmcatTypeConsolePanel.setFieldValue("date_from", month + '/' + day + '/' + lastYear);
        this.abScRptRmsDatabyRmcatTypeConsolePanel.setFieldValue("date_to", month + '/' + day + '/' + year);
		
		this.fromYear = lastYear;
		this.toYear = year;
    },
	/**
	 * 
	 */
	getRestriction:function(){
		var restriction = new Ab.view.Restriction;
		
		//alert(restriction);
		return restriction;
		
	},
	/**
     * Validates values entered by the user.
     */
	isFormValid: function() {
		var form = this.abScRptRmsDatabyRmcatTypeConsolePanel;
		
		if(!valueExistsNotEmpty(form.getFieldValue("date_from"))){
			View.showMessage(getMessage("selectFromDate"));
			return false;
		}

		if (!valueExistsNotEmpty(form.getFieldValue("date_to"))) {
			// Set "To Date" = current date
			var formattedDate = null;
			var today = new Date();
			
			formattedDate = FormattingDate(today.getDate(),today.getMonth(),today.getFullYear(),strDateShortPattern);
			form.setFieldValue('date_to',formattedDate);
		}

        if (form.getFieldValue("date_to") < form.getFieldValue("date_from")) {
			View.showMessage(getMessage("errorToDate"));
			return false;
        }
		
		if(!this.isDatesRangeValid())
			return false;
        
        return true;
    },

    /**
     * Validates that dates in the console are in the selected range (month/quarter/year)
     */
	isDatesRangeValid: function() {
		var form = this.abScRptRmsDatabyRmcatTypeConsolePanel;
		var fromDate = form.getFieldValue("date_from");
		var toDate = form.getFieldValue("date_to");
		var startDate = new Date(parseInt(fromDate.slice(0,4),10), parseInt(fromDate.slice(5,7),10)-1, parseInt(fromDate.slice(8,10),10));
		var endDate = new Date(parseInt(toDate.slice(0,4),10), parseInt(toDate.slice(5,7),10)-1, parseInt(toDate.slice(8,10),10));
		
		var rangeDate = DateMath.add(startDate, DateMath.MONTH, 1); // by default: add one month to the startDate
		if ($('year').checked) {
			rangeDate = DateMath.add(startDate, DateMath.YEAR, 1); // add one year to the startDate
		} else if ($('quarter').checked) {
			rangeDate = DateMath.add(startDate, DateMath.MONTH, 3); // add tree months to the startDate
		}
		/* subtract 1 day so we can have a valid period for end-day = start-day
		 * i.e.: if range=Month then 09/25/2009 - 10/25/2009 is a valid period
		 * (otherwise is not, but 09/25/2009 - 10/24/2009 is)
		 */
		rangeDate = DateMath.subtract(rangeDate, DateMath.DAY, 1); 
		if(!DateMath.between(rangeDate, startDate, endDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
		
        return true;
    }
    
    
});

/**
 * event handler when click the Show Chart Button
 * @param {Object} ob
 */
function onShowRoomsSumInLineChart(){
    //
}


