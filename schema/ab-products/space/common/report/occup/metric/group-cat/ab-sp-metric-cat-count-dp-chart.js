var abSpMetricCatCountDpChartCtrl = abSpMetricDpChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricCatCountDpChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addDepartmentClauses(obj, restriction);
	}

})