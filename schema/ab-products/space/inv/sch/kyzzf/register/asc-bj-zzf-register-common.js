var dataService=(function(){
	
	function getEmName(emId){
		var restriction="em.em_id='"+emId+"'";
	  	var parameters = {
	 			tableName: 'em',
	 			fieldNames: toJSON([
				'em.em_id',
				'em.name']),
	 			restriction: toJSON(restriction)
	 		};
	  	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if (result.data.records.length > 0) {
			var emName = result.data.records[0]['em.name'];
			return emName=="undefined"?"":emName;
		}
	};


	function getDvName(dvId){
		var restriction="dv.dv_id='"+dvId+"'";
	  	var parameters = {
	 			tableName: 'dv',
	 			fieldNames: toJSON([
				'dv.dv_id',
				'dv.dv_name']),
	 			restriction: toJSON(restriction)
	 		};
	  	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if (result.data.records.length > 0) {
			var dvName = result.data.records[0]['dv.dv_name'];
			return dvName=="undefined"?"":dvName;
		}
		
	};
	
	return {getEmName:getEmName,getDvName:getDvName};
})();