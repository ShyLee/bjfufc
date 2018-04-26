Ext.define('SpaceBook.store.SpaceSurveys', {
	extend : 'Common.store.sync.SyncStore',
	requires : [ 'SpaceBook.model.SpaceSurvey' ],

	serverTableName : 'surveymob_sync',
	serverFieldNames : [ 'survey_id', 'description', 'status', 'survey_date', 'em_id', 'mob_locked_by',
			'mob_is_changed' ],

	inventoryKeyNames : [ 'survey_id' ],

	config : {
		model : 'SpaceBook.model.SpaceSurvey',
		storeId : 'spaceSurveysStore',
		remoteFilter : true,
		remoteSort : true,
		enableAutoLoad : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});