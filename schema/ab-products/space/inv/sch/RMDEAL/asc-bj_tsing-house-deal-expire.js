var TsingHouseDealExpireControlller = View.createController('TsingHouseDealExpireControlller',
{
	afterInitialDataFetch: function()
	{
		this.ts_deal_rm_grid.sortEnabled = false;
		if(this.ts_deal_grid.rows.length == 0)
		{
			this.ts_deal_grid.refresh();
		}
		else
		{
			this.searchGridColor(this.ts_deal_grid.gridRows,this.ts_deal_grid.rows);
		}
	},
	fangjian:function()
	{
		this.ts_deal_form.show(false);
		this.ts_deal_form.showInWindow({
            width: 500,
            height: 200
        });
		var index=this.ts_deal_grid.selectedRowIndex;
		var gridRowRecord=this.ts_deal_grid.gridRows.get(index).getRecord();
		var dealId=gridRowRecord.getValue('ts_deal.deal_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ts_deal.deal_id',dealId,'=');
		this.ts_deal_form.refresh(restriction);
	},
	ts_deal_rm_grid_afterRefresh: function()
	{
		this.searchGridColor(this.ts_deal_grid.gridRows,this.ts_deal_grid.rows);
	},
	searchGridColor: function(gridRows,rows)
	{
		var ininerThis = this;
		var i =0;
    	gridRows.each(function(row)
    	{
    		var lastDate1=rows[i]['ts_deal.due_time'];
    		var color = '#FFF';
    		var nowdate = getdate();
    		var s = ChangeDateToString(StringToDate(lastDate1));
    		date1 = new Date(nowdate);
    		date2 = new Date(s);
			if(Date.parse(date1)<Date.parse(date2))
			{
				var num = daysBetween(nowdate,s)
				if(num>30)
					color = '#00CC66'; //Green
				else
					color = 'red';
			}
			else
			{
				color = 'red';
			}
			
            var cellEl = Ext.get(row.cells.items[0].dom);
        	cellEl.setStyle('background-color', color);
            i++;     
		});
    },
});
function getdate()
{
	var now=new Date()
	var y=now.getFullYear();
	var m=now.getMonth()+1;
	var d=now.getDate();
	m=m<10?"0"+m:m;
	d=d<10?"0"+d:d;
	return y+"-"+m+"-"+d;
}
function StringToDate(DateStr) 
{  
 
    var converted = Date.parse(DateStr); 
    var myDate = new Date(converted); 
    if (isNaN(myDate)) 
    {  
        var arys= DateStr.split('-'); 
        myDate = new Date(arys[0],--arys[1],arys[2]); 
    } 
    return myDate; 
}
function ChangeDateToString(DateIn)
{
    var Year=0;
    var Month=0;
    var Day=0;

    var CurrentDate="";

    //初始化时间
    Year      = DateIn.getFullYear();
    Month     = DateIn.getMonth()+1;
    Day       = DateIn.getDate();


    CurrentDate = Year + "-";
    if (Month >= 10 )
    {
        CurrentDate = CurrentDate + Month + "-";
    }
    else
    {
        CurrentDate = CurrentDate + "0" + Month + "-";
    }
    if (Day >= 10 )
    {
        CurrentDate = CurrentDate + Day ;
    }
    else
    {
        CurrentDate = CurrentDate + "0" + Day ;
    }
   

    return CurrentDate;
}
function daysBetween(DateOne,DateTwo)  
{   
    var OneMonth = DateOne.substring(5,DateOne.lastIndexOf ('-'));  
    var OneDay = DateOne.substring(DateOne.length,DateOne.lastIndexOf ('-')+1);  
    var OneYear = DateOne.substring(0,DateOne.indexOf ('-'));  
  
    var TwoMonth = DateTwo.substring(5,DateTwo.lastIndexOf ('-'));  
    var TwoDay = DateTwo.substring(DateTwo.length,DateTwo.lastIndexOf ('-')+1);  
    var TwoYear = DateTwo.substring(0,DateTwo.indexOf ('-'));  
  
    var cha=((Date.parse(OneMonth+'/'+OneDay+'/'+OneYear)- Date.parse(TwoMonth+'/'+TwoDay+'/'+TwoYear))/86400000);   
    return Math.abs(cha);  
}  