function ABDE_getParamValueByJB(paramname,value){
	var params = {
		tableName: 'afm_activity_params',
		fieldNames: toJSON(['sc_value_interval.param_name', 'sc_value_interval.upper_value', 'sc_value_interval.lower_value',
		                    'sc_value_interval.param_value', 'sc_value_interval.lower_symbol', 'sc_value_interval.upper_symbol'
		                    ]),
		restriction: toJSON(
			"sc_value_interval.param_name='"+paramname+"'"
		)
	}

	var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', params);
	if(result.code == 'executed'){
		if(result.data.records.length > 0){
			var records = result.data.records;
			for (var i = 0; i <records.length; i++){
				var param_name=records[i]['sc_value_interval.param_name'];
				var upper_value=records[i]['sc_value_interval.upper_value'];
				var lower_value=records[i]['sc_value_interval.lower_value'];
				var param_value=records[i]['sc_value_interval.param_value'];
				var lower_symbol=records[i]['sc_value_interval.lower_symbol'];
				var upper_symbol=records[i]['sc_value_interval.upper_symbol'];
				
				var upperValue=parseInt(upper_value);
				var lowerValue=parseInt(lower_value);
				if(eval(lowerValue)<=eval(value) && eval(value)<=eval(upperValue)){
					//判断是否与下限值相等
					if(eval(lowerValue)==eval(value)){
						if(upper_symbol=="<=" || upper_symbol==">="){
							return param_value;
						}
					}
					//判断是否与上限值相等
					if(eval(upperValue)==eval(value)){
						if(lower_symbol=="<=" || lower_symbol==">="){
							return param_value;
						}
					}
					//与上限值和下限值都不相等
					if(eval(lowerValue)!=eval(value) && eval(upperValue)!=eval(value)){
						return param_value;
					}
				}
				
			}      
			
		}else{
			return ';';
		}
	}else{
		Workflow.handleError(result);
	}

		
}
