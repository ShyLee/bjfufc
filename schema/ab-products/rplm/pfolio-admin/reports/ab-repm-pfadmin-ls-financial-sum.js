/**
 * TODO: replace areaUnitsConversionFactor by core feature when available
 */
var abRepmPfadminLsFinancialSumController = View.createController('abRepmPfadminLsFinancialSumCtrl', {
	// object with default filter settings for current view
	defaultFilter:{
		items:[
			{id:'cost_from', value: ['recurring', 'scheduled', 'cost']},
			{id:'cost_for', value: 'fiscal'},
			{id:'net_income', value: 'all', isParameter: true, formula: 'ls.amount_base_rent + ls.amount_pct_rent + ls.amount_operating + ls.amount_taxes + ls.amount_other'},
			{id:'date_start', value: new Date()},
			{id:'date_end', value: (new Date()).add(Date.DAY, 364)},
			{id:'ls_assoc', value: ['bl', 'pr']}
		]
	},

	// selected ls row
	row: null,
	
	// current restriction
	restriction: null,

	// current printable restriction
	printableRestriction: [],
	
	//current parameters
	parameters: null,
	
	// selected ctry code
	ctry_code: null,
	
	// VAT selection
	displayVAT: {
		type: '',
		isHidden: false
	},
	
	// currency selection
	displayCurrency: {
		type: '',
		code: '',
		exchangeRateType: ''
	},
	
	isMcAndVatEnabled: false,
	
	// if UOM is enabled, set from user.areaUnits.conversionFactor
	areaUnitsConversionFactor: 1.0,
	
	/*
	 * VPA restriction for current user.
	 * Contains current VPA restriction in both format sql string and Ab.view.restriction object.
	 */
	vpaRestriction: null,
	
	afterViewLoad: function(){
		// initialize vat variables
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'total';
        	this.displayVAT.isHidden = false;
        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        }
		
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			if(View.user.displayUnits != View.project.units){
				this.areaUnitsConversionFactor = 1.0 / parseFloat(View.user.areaUnits.conversionFactor);
			}
		}
		
		// get VPA restriction for logged user
		this.vpaRestriction = getVpaRestriction(this.view.user.name);
		
		copyDefaultSettings(this.defaultFilter);
		setFilterLabels();

		/*
		this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.addParameter('owned', getMessage('owned'));
		this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.addParameter('leased', getMessage('leased'));
		this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.addParameter('neither', getMessage('neither'));

		this.abRepmPfadminLsFinancialSumLsDetails_propPanel.addParameter('owned', getMessage('owned'));
		this.abRepmPfadminLsFinancialSumLsDetails_propPanel.addParameter('leased', getMessage('leased'));
		this.abRepmPfadminLsFinancialSumLsDetails_propPanel.addParameter('neither', getMessage('neither'));
		*/
	},
	
	afterInitialDataFetch: function(){
		// set filter default values
		setFilter(copyObject(this.displayVAT), copyObject(this.displayCurrency));
		//showFilter(true);
		enableDate();
		// set overviewPanelId variable defined in filter
		//overviewPanelId = 'abRepmPfadminLsFinancialSum_gridPanel';
		overviewPanelId = 'abRepmPfadminLsFinancialSumDetails_gridPanel';
	},
	
	abRepmPfadminLsFinancialSum_gridPanel_afterRefresh: function(){
		if(valueExistsNotEmpty(this.displayVAT.type)){
			var overviewTitle = getMessage("title_report")+ ' - '  + getMessage("title_" + this.displayVAT.type);
			this.abRepmPfadminLsFinancialSum_gridPanel.setTitle(overviewTitle);
		}
	},
	
	abRepmPfadminLsFinancialSum_gridPanel_onDetails: function(row){
		this.ctry_code = row.getFieldValue("ls.ctry_code");
		var restriction;
		if(typeof(this.restriction) === 'string'){
			restriction  = this.restriction;
			restriction += " AND ( bl.ctry_id = '" + this.ctry_code + "' OR property.ctry_id = '" + this.ctry_code + "')";
		}else{
			restriction = copyObject(this.restriction);
			restriction.addClause('bl.ctry_id', this.ctry_code, '=', ')AND(');
			restriction.addClause('property.ctry_id', this.ctry_code, '=', 'OR');
		}
		
		for(param in this.parameters){
			this.abRepmPfadminLsFinancialSumDetails_gridPanel.addParameter(param, this.parameters[param]);
		}
		var displayCurrency = this.displayCurrency.code;
		// set currency
		this.abRepmPfadminLsFinancialSumDetails_gridPanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = displayCurrency;
			}
		});
		
		this.abRepmPfadminLsFinancialSumDetails_gridPanel.addParameter("area_conversion_factor", 1/this.areaUnitsConversionFactor);
		
		if(typeof(restriction) === 'string'){
			this.abRepmPfadminLsFinancialSumDetails_gridPanel.addParameter("filter_restriction", restriction);
			this.abRepmPfadminLsFinancialSumDetails_gridPanel.refresh();
		}else{
			this.abRepmPfadminLsFinancialSumDetails_gridPanel.refresh(restriction);
		}
		
		if (valueExistsNotEmpty(msgOverviewNote)){
			this.abRepmPfadminLsFinancialSumDetails_gridPanel.setInstructions(msgOverviewNote);
		}
		
		this.abRepmPfadminLsFinancialSum_tabs.selectTab("abRepmPfadminLsFinancialSum_tabDetails");
		this.abRepmPfadminLsFinancialSum_tabs.enableTab("abRepmPfadminLsFinancialSum_tabDetails", true);
	},
	
	abRepmPfadminLsFinancialSum_gridPanel_onDetailsUNUSED: function(row){
		var restriction = new Ab.view.Restriction({"ls.ls_id": row.getFieldValue("ls.ls_id")});
		this.row = row;
		
		/*
		 * KB 3029065 - IOAN 11/03/2010
		 * IE 7 bug with select tab when tab content is changed
		 * We must show/hide forms after tab select.
		 * Refresh lease description panel after show/hide building/property form
		 * to force resize 
		 */
		this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.refresh(restriction);
		this.abRepmPfadminLsFinancialSumLsDetails_propPanel.refresh(restriction);
		
		this.abRepmPfadminLsFinancialSumLsDetails_lsAreasPanel.refresh(restriction);
		this.abRepmPfadminLsFinancialSumLsDetails_lsCostsPanel.refresh(restriction);
		this.abRepmPfadminLsFinancialSumLsDetails_lsOptionsPanel.refresh(restriction);
		this.abRepmPfadminLsFinancialSumLsDetails_lsContactsPanel.refresh(restriction);
		
		this.abRepmPfadminLsFinancialSum_tabs.selectTab("abRepmPfadminLsFinancialSum_tabDetails");
		
		this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.show(valueExistsNotEmpty(row.getFieldValue("ls.bl_id")));
		this.abRepmPfadminLsFinancialSumLsDetails_propPanel.show(valueExistsNotEmpty(row.getFieldValue("ls.pr_id")));
		this.abRepmPfadminLsFinancialSumLsDetails_lsDescrPanel.refresh(restriction);
		this.abRepmPfadminLsFinancialSum_tabs.enableTab("abRepmPfadminLsFinancialSum_tabDetails", true);
		
	},
	
	abRepmPfadminLsFinancialSumLsDetails_bldgPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.getFieldValue('bl.bldg_photo'))) {
			this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
		}else{
			this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.fields.get(this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.fields.indexOfKey('image_field')).dom.src = null;
			this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.fields.get(this.abRepmPfadminLsFinancialSumLsDetails_bldgPanel.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
		}
	},
	
	abRepmPfadminLsFinancialSumLsDetails_propPanel_afterRefresh: function(){
		if (valueExistsNotEmpty(this.abRepmPfadminLsFinancialSumLsDetails_propPanel.getFieldValue('property.prop_photo'))) {
			this.abRepmPfadminLsFinancialSumLsDetails_propPanel.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			this.abRepmPfadminLsFinancialSumLsDetails_propPanel.fields.get(this.abRepmPfadminLsFinancialSumLsDetails_propPanel.fields.indexOfKey('image_field')).dom.src = null;
			this.abRepmPfadminLsFinancialSumLsDetails_propPanel.fields.get(this.abRepmPfadminLsFinancialSumLsDetails_propPanel.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
		}
	}
})

/**
 * Apply filter restriction to overview panel
 * 
 * @param {Object} crtFilter - current filter settings
 * @param {Object} printableRestriction - current printable restriction
 * @param {String} displayVAT - current VAT Option
 * @param {Object} displayCurrency - current Multi currency settings
 */
function onApplyFilter(crtFilter, printableRestriction, displayVAT, displayCurrency){
	if(crtFilter == undefined){
		crtFilter = readFilter();
	}

	// we need to run  AbCommonResources-CostService-summarizeLeaseCosts job
	var controller = View.controllers.get('abRepmPfadminLsFinancialSumCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('abRepmPfadminLsFinancialSum_gridPanel');
	// job parameters
	var dateFrom = crtFilter.get('date_start').value;
	var dateTo = crtFilter.get('date_end').value;
	var period = "YEAR";
    var isFromCosts = false;
    var isFromScheduledCosts = false;
    var isFromRecurringCosts = false;
	var isActiveRecurringCosts = 1;
	var costFor = crtFilter.get('cost_for').value;
	if( costFor === 'fiscal' || costFor === 'calendar'){
		period = "YEAR";
	}else if( costFor === 'quarter1' || costFor === 'quarter2' || costFor === 'quarter3' || costFor === 'quarter4'){
		period = "QUARTER";
	}else if( costFor === 'month'){
		period = "MONTH";
	}else{
		period = "DATE_RANGE";
	}
	var costFrom = crtFilter.get('cost_from').value;
	for(var i=0; i< costFrom.length; i++){
		switch(costFrom[i]){
			case 'recurring': {isFromRecurringCosts = true; break;}
			case 'scheduled': {isFromScheduledCosts = true; break;}
			case 'cost': {isFromCosts = true; break;}
		}
	}
	
	// get console restriction for overview panel
	var isSqlStringRestriction = true;
	getRestrictionForOverview(controller, crtFilter, true, true, isSqlStringRestriction);
	
	// MC and VAT variables
	controller.displayVAT = displayVAT;
	controller.displayCurrency = displayCurrency;
	
	var currencyVatParams = {
			"vat": displayVAT.type,
			"type": displayCurrency.type,
			"code": displayCurrency.code,
			"rateType": displayCurrency.exchangeRateType
	};
	
	var reportDataSource = View.dataSources.get('abRepmPfadminLsFinancialSum_ds_report');
	
	try {
		var jobId = Workflow.startJob('AbCommonResources-CostService-summarizeLeaseCosts', dateFrom, dateTo, period, isFromCosts, isFromScheduledCosts, isFromRecurringCosts, isActiveRecurringCosts, currencyVatParams);
	    View.openJobProgressBar(getMessage('msg_summarize_costs'), jobId, '', function(status) {
	    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
	    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
	    		return true;
	    	}

	    	for(param in controller.parameters){
				overviewPanel.addParameter(param, controller.parameters[param]);
				reportDataSource.addParameter(param, controller.parameters[param]);
			}
			overviewPanel.addParameter("user_name", View.user.name);
			// set currency
			overviewPanel.getDataSource().fieldDefs.each(function(fieldDef){
				if(valueExists(fieldDef.currency)){
					fieldDef.currency = displayCurrency.code;
				}
			});
			for (var i = 0; i < overviewPanel.fieldDefs.length; i++) {
				if (valueExists(overviewPanel.fieldDefs[i].currency) || overviewPanel.fieldDefs[i].id == 'ls.vf_net_income') {
					overviewPanel.fieldDefs[i].currency = displayCurrency.code;
					overviewPanel.config.fieldDefs[i].currency = displayCurrency.code;
				}
				
			}
			
			//set area conversion factor
			overviewPanel.addParameter("area_conversion_factor", 1/controller.areaUnitsConversionFactor);
			
			var displayUnit = "";
			if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]==1){
				displayUnit = " " + View.user.areaUnits.title;
			}
			var columns = overviewPanel.columns;
			var fieldDefs = overviewPanel.fieldDefs;
			for(var index in columns){
				if(columns[index].id=="ls.vf_area_negotiated"){
					columns[index].name = getMessage("vf_area_negotiated_title") + displayUnit;
				}
			}
			for(var index in fieldDefs){
				if(fieldDefs[index].id=="ls.vf_area_negotiated"){
					fieldDefs[index].title = getMessage("vf_area_negotiated_title") + displayUnit;
				}
			}
			
			if(isSqlStringRestriction){
				overviewPanel.addParameter("filter_restriction", controller.restriction);
				overviewPanel.refresh();
			}else{
				overviewPanel.refresh(controller.restriction);
			}
			if (valueExistsNotEmpty(msgOverviewNote)){
				overviewPanel.setInstructions(msgOverviewNote);
			}
	    });
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * create report from details panel
 * @param {Object} commandObject
 * @param {Object} reportView
 */
function onReport(){
	var controller = View.controllers.get('abRepmPfadminLsFinancialSumCtrl');
	/*
	 * we must remove some field from printable restriction
	 * for details report
	 */
	var printableRestriction = getCustomPrintableRestriction(controller.printableRestriction);
	var row = controller.row;
	var isBuilding = valueExistsNotEmpty(row.getFieldValue("ls.bl_id"));
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-pfadmin-ls-financial-sum-rpt',
		callerView: 'ab-repm-pfadmin-ls-financial-sum.axvw',
		dataSource: 'abRepmPfadminLsFinancialSum_ds_grid',
		printableRestriction: printableRestriction,
		files:[]
	};
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.ls_id', row.getFieldValue("ls.ls_id"), '=');
	if(isBuilding){
		restriction.addClause('ls.bl_id', row.getFieldValue("ls.bl_id"), '=');
		var objRestr = {permanent: null, temporary: restriction, parameters: null};
		var rptFileCfg = getRptFileConfig('bl', objRestr);
	}else{
		restriction.addClause('ls.pr_id', row.getFieldValue("ls.pr_id"), '=');
		var objRestr = {permanent: null, temporary: restriction, parameters: null};
		var rptFileCfg = getRptFileConfig('property', objRestr);
	}
	reportConfig.files.push(rptFileCfg);
	onPaginatedReport(reportConfig);
}

/**
 * create paginated report from details panel
 */
function onDocXDetails(){
	var controller = View.controllers.get('abRepmPfadminLsFinancialSumCtrl');
	onDocX('abRepmPfadminLsFinancialSum_gridPanel', controller.ctry_code);
}
/**
 * create paginated report from overview panel
 */
function onDocXSum(){
	onDocX('abRepmPfadminLsFinancialSum_gridPanel', null);
}

/**
 * create paginated report 
 */
function onDocX(panelId, ctry_code){
	var controller = View.controllers.get('abRepmPfadminLsFinancialSumCtrl');
	/*
	 * KB 3029212 Ioan  don't export if there is no data available
	 */
	var objPanel = View.panels.get(panelId);
	if (objPanel.gridRows.length == 0) {
		View.showMessage(getMessage('msg_docx_nodata'));
		return;
	}
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-pfadmin-ls-financial-sum-rpt',
		callerView: 'ab-repm-pfadmin-ls-financial-sum.axvw',
		dataSource: 'abRepmPfadminLsFinancialSumDetails_ds_grid',
		printableRestriction: controller.printableRestriction,
		files:[]
	};
	var consoleRestr = 	copyObject(controller.restriction);
	if(valueExistsNotEmpty(ctry_code)){
		consoleRestr.addClause('bl.ctry_id', controller.ctry_code, '=', ')AND(');
		consoleRestr.addClause('property.ctry_id', controller.ctry_code, '=', 'OR');
	}
	var parameters = controller.parameters;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.bl_id', '', 'IS NOT NULL', ')AND(', false);
	var objRestr = {permanent: consoleRestr, temporary: restriction, parameters: parameters};
	var rptFileCfg = getRptFileConfig('bl', objRestr);
	reportConfig.files.push(rptFileCfg);
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.pr_id', '', 'IS NOT NULL', ')AND(', false);
	var objRestr = {permanent: consoleRestr, temporary: restriction, parameters: parameters};
	var rptFileCfg = getRptFileConfig('property', objRestr);
	reportConfig.files.push(rptFileCfg);
	
	onPaginatedReport(reportConfig);
}

/**
 * gets RptFileConfig object for building or property
 * @param {Object} whatFor Values in "bl", "property"
 * @param {Object} restriction
 */
function getRptFileConfig(whatFor, restriction){
	var controller = View.controllers.get('abRepmPfadminLsFinancialSumCtrl');
	var areaUnitsConversionFactor = controller.areaUnitsConversionFactor;
	
	if (whatFor == "bl") {
		return new RptFileConfig(
			'ab-repm-pfadmin-ls-financial-sum-ls-details-bl-rpt.axvw',
			restriction,
			'ls.bl_id',
			{parameters: [
						{name: 'lsId', type: 'value', value: 'ls.ls_id'},
						{name: 'owned', type: 'text', value: getMessage("owned")},
						{name: 'leased', type: 'text', value: getMessage("leased")},
						{name: 'neither', type: 'text', value: getMessage("neither")}]
			},
			[
				new RptFileConfig(
					'ab-repm-pfadmin-ls-financial-sum-ls-details-ls-rpt.axvw',
					null,
					'ls.bl_id',
					{parameters: [
								{name: 'lsId', type: 'value',	value: 'ls.ls_id'},
								{name: 'areaUnitsConversionFactor', type: 'verbatim', value: areaUnitsConversionFactor}]
					},
					null)
			]);
	}
	else {
		return new RptFileConfig(
			'ab-repm-pfadmin-ls-financial-sum-ls-details-prop-rpt.axvw',
			restriction,
			'ls.pr_id',
			{parameters: [
						{name: 'lsId', type: 'value', value: 'ls.ls_id'},
						{name: 'owned', type: 'text', value: getMessage("owned")},
						{name: 'leased', type: 'text', value: getMessage("leased")},
						{name: 'neither', type: 'text', value: getMessage("neither")}]
			},
			[
				new RptFileConfig(
					'ab-repm-pfadmin-ls-financial-sum-ls-details-ls-rpt.axvw',
					null,
					'ls.pr_id',
					{parameters: [
								{name: 'lsId', type: 'value',	value: 'ls.ls_id'},
								{name: 'areaUnitsConversionFactor', type: 'verbatim', value: areaUnitsConversionFactor}]
					},
					null)
			]);
	}
}
