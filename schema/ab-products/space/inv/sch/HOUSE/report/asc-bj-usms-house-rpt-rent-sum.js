/**
 * @author Keven.xi
 */
var ascBjUsmsHouseRptRentSum = View.createController('ascBjUsmsHouseRptRentSumController', {

    year: "",
    
    afterInitialDataFetch: function(){
        this.defaultDisplayCurrent();
        this.year = AUSC_getCurrentYear();
        this.ascBjZzfRentSum_console.setFieldValue('sc_zzfrent.year.from', this.year);
        this.ascBjZzfRentSum_console.setFieldValue('sc_zzfrent.year.to', this.year);
    },
    
    ascBjZzfRentSum_console_onShow: function(){
        var year = this.ascBjZzfRentSum_console.getFieldValue('sc_zzfrent.year.from');
        var yearto=this.ascBjZzfRentSum_console.getFieldValue('sc_zzfrent.year.to');
        if (year == "") {
            alert("请输入年度!");
            return;
        }
        var month=this.ascBjZzfRentSum_console.getFieldValue('sc_zzfrent.month.from');
        var monthto=this.ascBjZzfRentSum_console.getFieldValue('sc_zzfrent.month.to');
        
        var restriction = new Ab.view.Restriction();
        if (valueExistsNotEmpty(year)) {
        	restriction.addClause('sc_zzfrent.year', year, '&gt;=');
        }
        if (valueExistsNotEmpty(yearto)) {
        	restriction.addClause('sc_zzfrent.year',yearto,'&lt;=');
        }
        if (valueExistsNotEmpty(month)) {
        	restriction.addClause('sc_zzfrent.month',month,'&gt;=');
        }
        if (valueExistsNotEmpty(monthto)) {
        	restriction.addClause('sc_zzfrent.month',monthto,'&lt;=');
        }
        this.zzfWhole_manageDvSumGrid.refresh(restriction);
        this.absBjUsmsZzfRentRevenueCht.refresh(restriction);
        this.zzfWhole_manageDvSumGrid.show(true);
    },
    
    absBjUsmsZzfRentRevenueCht_afterRefresh: function(){
        //this.absBjUsmsZzfRentRevenueCht_afterRefresh().setTitle(this.year+"年房租收入柱状图");
        var title = this.year + "年房租收入柱状图";
        setPanelTitle('absBjUsmsZzfRentRevenueCht', title);
    },
    
    ascBjZzfRentSum_console_onFixedReport: function(){
        this.year = this.ascBjZzfRentSum_console.getFieldValue('sc_zzfrent.year');
        if (this.year == "") {
            alert("请输入年度!");
            return;
        }
        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "sczzfRentYearSummary",
            parameters: {
                'aYear': this.year
            },
            closeButton: false
        });
        
    },
    defaultDisplayCurrent: function(){
        var curDate = new Date();
        var curYear = curDate.getFullYear();
        var restriction = new Ab.view.Restriction();
        restriction.addClause('sc_zzfrent.year', curYear);
        this.zzfWhole_manageDvSumGrid.refresh(restriction);
        this.absBjUsmsZzfRentRevenueCht.refresh(restriction);
        this.zzfWhole_manageDvSumGrid.show(true);
    }

});

