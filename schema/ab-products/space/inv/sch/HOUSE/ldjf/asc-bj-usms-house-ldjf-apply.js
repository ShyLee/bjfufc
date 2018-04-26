

var ascZzfJfApplyController = View.createController('ascZzfJfApplyController', {
	
	//职务系列
	ZWSCORE: {
		'科员':{'任职分':1,'职龄分/年':0.5},
		'副科级':{'任职分':3,'职龄分/年':0.8},
		'正科级':{'任职分':4,'职龄分/年':1},
		'副处级':{'任职分':7,'职龄分/年':1.5},
		'正处级':{'任职分':10,'职龄分/年':2}
	},
	
	//职称系列、工勤系列
	ZCSCORE: {
		'初级':{'任职分':1,'职龄分/年':0.5},
		'中级':{'任职分':4,'职龄分/年':1},
		'副高级':{'任职分':7,'职龄分/年':1.5},
		'正高级':{'任职分':10,'职龄分/年':2},
		'中级工':{'任职分':1,'职龄分/年':0.5},
		'高级工':{'任职分':3,'职龄分/年':0.8},
		'技师':{'任职分':4,'职龄分/年':1},
		'高级技师':{'任职分':7,'职龄分/年':1.5}
	},
	
	
	
	emInfoForm_afterRefresh:function(){
		this.showLvliInfo("1=1", "1=1");
		
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.date_apply",new Date());
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_parents",0);
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_children",0);
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_rz",0);
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_zl",0);
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_gl",0);
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_xl",0);
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_total",0);
	},
	
	emInfoForm_onSave:function(){
		if(!this.emInfoForm.canSave()){
			return;
		}
		this.emInfoForm.save();
		this.emInfoForm.refresh(null,true);
		View.showMessage("申请成功!");
	},
	
	changeChild:function(){
		this.calcCscore();
		this.calTotalScore();
	},
	
	changeSworker: function(){
		this.calcPscore();
		this.calTotalScore();
	},
	
	showLvliInfo:function(archive_id,em_id){
		if(valueExistsNotEmpty(em_id)){
			this.zwGridPanel.addParameter('jgh', em_id);
			this.zcGridPanel.addParameter('jgh', em_id);
		}
		if(valueExistsNotEmpty(archive_id)){
			this.zwGridPanel.addParameter('archive_id', archive_id);
			this.zcGridPanel.addParameter('archive_id', archive_id);
		}
		
		this.zwGridPanel.refresh();
		this.zcGridPanel.refresh();
		
		var res = new Ab.view.Restriction();
	    res.addClause("sc_zf_em_gzjl.archive_id", archive_id, "=");
		this.gzjlGridPanel.refresh(res);
		
		var res2 = new Ab.view.Restriction();
	    res2.addClause("sc_zf_em_jyjl.archive_id", archive_id, "=");
		this.jyjlGridPanel.refresh(res2);
	},
	/**
	 * 北林积分政策
	 * 
	 * */
	calcScore:function(){
		var em_id = this.emInfoForm.getFieldValue("bjfu_zzf_jf.em_id");
		
		if(!valueExistsNotEmpty(em_id)){//没选员工
			return;
		}
		
		var date_apply = this.emInfoForm.getFieldValue("bjfu_zzf_jf.date_apply");
		var apply_year = parseInt(date_apply.split("-")[0]);
		
		//双职工分
		this.calcPscore();
		//子女分
		this.calcCscore();
		//任职分
		this.calcRZscore();
		//职龄分与工龄分
		this.calcZlGlscore(apply_year);
		
		//学龄分
		this.calcXlScore();
		//总分
		this.calTotalScore();
	},
	calTotalScore: function(){
		var score_parents = this.emInfoForm.getFieldValue("bjfu_zzf_jf.score_parents");
		var score_children = this.emInfoForm.getFieldValue("bjfu_zzf_jf.score_children");
		var score_rz = this.emInfoForm.getFieldValue("bjfu_zzf_jf.score_rz");
		var score_zl = this.emInfoForm.getFieldValue("bjfu_zzf_jf.score_zl");
		var score_gl = this.emInfoForm.getFieldValue("bjfu_zzf_jf.score_gl");
		var score_xl = this.emInfoForm.getFieldValue("bjfu_zzf_jf.score_xl");
		
		var total = parseInt(score_parents) + parseInt(score_children) + parseInt(score_rz)  + parseInt(score_zl) + parseInt(score_gl) + parseInt(score_xl);
		
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_total",total);
	},
	calcPscore:function(){
		var is_sworker = this.emInfoForm.getFieldValue("bjfu_zzf_jf.is_sworker");
		if(is_sworker == "1"){
			this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_parents",3);
		}else{
			this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_parents",0);
		}
	},
	calcCscore:function(){
		var has_children = this.emInfoForm.getFieldValue("bjfu_zzf_jf.has_children");
		if(has_children != "2"){//无
			this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_children",3);
		}else{//有子女或怀孕
			this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_children",0);
		}
	},
	calcRZscore: function(){
		var zw_jb_name = this.emInfoForm.getFieldValue("bjfu_zzf_jf.zw_jb_name");
		var zc_jb_name = this.emInfoForm.getFieldValue("bjfu_zzf_jf.zc_jb_name");
		var score_zw = 0;
		var score_zc = 0;
		if(valueExistsNotEmpty(zw_jb_name)){
			score_zw = this.ZWSCORE[zw_jb_name]['任职分'];
		}
		if(valueExistsNotEmpty(zc_jb_name)){
			score_zc = this.ZCSCORE[zc_jb_name]['任职分'];
		}
		
		if(score_zw > score_zc){
			this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_rz",score_zw);
		}else{
			this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_rz",score_zc);
		}
		
	},
	calcZlGlscore:function(apply_year){
		var gzYearMap = new Map();//工作的年份
		
		var zwZlMap = new Map();//职务职龄分
		var zcZlMap = new Map();//职称职龄分
		
		var recordNum = this.gzjlGridPanel.gridRows.items.length;
		for(var i=0; i<recordNum; i++){
			var date_begin = this.gzjlGridPanel.gridRows.items[i].getFieldValue("sc_zf_em_gzjl.date_begin");
			var date_end = this.gzjlGridPanel.gridRows.items[i].getFieldValue("sc_zf_em_gzjl.date_end");
			
			var yyyy_s = parseInt(date_begin.getFullYear());
			var yyyy_e = parseInt(date_end.getFullYear());
			
			if(i+1 == recordNum){//最后一条工作经历
				yyyy_e = apply_year;
			}
			
			while(yyyy_s <= yyyy_e){
				var value = gzYearMap.get(gzYearMap);
				if(value == null){
					gzYearMap.put(yyyy_s,yyyy_s);
				}
				yyyy_s++;
			}
		}
		
		var recordNum2 = this.zwGridPanel.gridRows.items.length;
		/**
		 * 算法思想是：
		 *  第一条记录直接插进map中
		 *  第二条之后【含第二条】的记录插进map中
		 *  插入第一条第二条之间年份的记录【值为第一条的值】
		 * 
		 * */
		for(var i=0; i<recordNum2; i++){
			var zw_jb_name = this.zwGridPanel.gridRows.items[i].getFieldValue("sc_zf_em_zwjl.zw_jb_name");
			var get_date = this.zwGridPanel.gridRows.items[i].getFieldValue("sc_zf_em_zwjl.get_date");
			
			var score_zw = 0;
			if(valueExistsNotEmpty(zw_jb_name)){
				score_zw = this.ZWSCORE[zw_jb_name]['职龄分/年'];
			}
			var yyyy_e = parseInt(get_date.split("-")[0]);
			zwZlMap.put(yyyy_e,score_zw);
			if(i !=0 ){//存在区间值的可能性
				var yyyy_t = yyyy_e;
				var value = null;
				var n = 0;
				do{
					n++;
					yyyy_t--;
					value = zwZlMap.get(yyyy_t);
				}while(value == null && n<20);//防止死循环，一个人不可能提职二十次【针对 第一条记录与第二条记录是同一年份的特殊情况】
				 
				yyyy_t++;
				//插入区间值
				while(yyyy_t < yyyy_e){
					zwZlMap.put(yyyy_t,value);
					yyyy_t++;
				}
			}
			
			if(i+1 == recordNum2){//计算最近升职到申请日期区间的值
				var yyyy_t = apply_year;
				var value = null;
				var n = 0;
				do{
					n++;
					yyyy_t--;
					value = zwZlMap.get(yyyy_t);
				}while(value == null && n<20);//防止死循环，一个人不可能提职二十次【针对 第一条记录与第二条记录是同一年份的特殊情况】
				 
				yyyy_t++;
				//插入区间值
				while(yyyy_t < apply_year){
					zwZlMap.put(yyyy_t,value);
					yyyy_t++;
				}
			}
			
		}
		
		var recordNum3 = this.zcGridPanel.gridRows.items.length;
		/**
		 * 算法思想是：
		 *  第一条记录直接插进map中
		 *  第二条之后【含第二条】的记录插进map中
		 *  插入第一条第二条之间年份的记录【值为第一条的值】
		 * 
		 * */
		for(var i=0; i<recordNum3; i++){
			var zc_jb_name = this.zcGridPanel.gridRows.items[i].getFieldValue("sc_zf_em_zcjl.zc_jb_name");
			var get_date = this.zcGridPanel.gridRows.items[i].getFieldValue("sc_zf_em_zcjl.get_date");
			
			var score_zc = 0;
			if(valueExistsNotEmpty(zc_jb_name)){
				score_zc = this.ZCSCORE[zc_jb_name]['职龄分/年'];
			}
			var yyyy_e = parseInt(get_date.split("-")[0]);
			zcZlMap.put(yyyy_e,score_zc);
			if(i !=0 ){//存在区间值的可能性
				var yyyy_t = yyyy_e;
				var value = null;
				var n = 0;
				do{
					n++;
					yyyy_t--;
					value = zcZlMap.get(yyyy_t);
				}while(value == null && n<20);//防止死循环，一个人不可能提职二十次【针对 第一条记录与第二条记录是同一年份的特殊情况】
				 
				yyyy_t++;
				//插入区间值
				while(yyyy_t < yyyy_e){
					zcZlMap.put(yyyy_t,value);
					yyyy_t++;
				}
			}
			
			if(i+1 == recordNum3){//计算最近升职到申请日期区间的值
				var yyyy_t = apply_year;
				var value = null;
				var n = 0;
				do{
					n++;
					yyyy_t--;
					value = zcZlMap.get(yyyy_t);
				}while(value == null && n<20);//防止死循环，一个人不可能提职二十次【针对 第一条记录与第二条记录是同一年份的特殊情况】
				 
				yyyy_t++;
				//插入区间值
				while(yyyy_t < apply_year){
					zcZlMap.put(yyyy_t,value);
					yyyy_t++;
				}
			}
			
		}
		
		//按工作经历，合计职龄分，工龄分
		var score_zl = 0;
		var score_gl = 0;
		
		for(var i = 0; i<gzYearMap.getSize(); i++){
			var key = gzYearMap.getKey(i);//年份
			
			var s1 = zwZlMap.get(key);
			if(s1 == null){//此工作年没有职务
				s1=0;
			}
			var s2 = zcZlMap.get(key);
			if(s2 == null){//此工作年没有职称
				s2=0;
			}
			
			if(s1 > s2){
				score_zl += s1;
			}else{
				score_zl += s2;
			}
			
			score_gl++;
		}
		
		
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_zl",score_zl);
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_gl",score_gl);
		
	},
	
	
//	学龄分：全日制大专以上院校、高中毕业后上中专在读期间每年记学龄1分；初中毕业上四年制中专的学龄计1分。已计入工龄的学习年限不重复计算为学龄分。
	calcXlScore: function(){
		var recordNum = this.jyjlGridPanel.gridRows.items.length;
		
		var score_xl = 0;
		for(var i=0; i<recordNum; i++){
			//0;高中;1;专科;2;本科;3;研究生;4;博士生;5;博士后
			var xl = this.jyjlGridPanel.gridRows.items[i].getFieldValue("sc_zf_em_jyjl.xl");
			//0;否;1;是
			var is_zz = this.jyjlGridPanel.gridRows.items[i].getFieldValue("sc_zf_em_jyjl.is_zz");
			
			var date_begin = this.jyjlGridPanel.gridRows.items[i].getFieldValue("sc_zf_em_jyjl.date_begin");
			var date_end = this.jyjlGridPanel.gridRows.items[i].getFieldValue("sc_zf_em_jyjl.date_end");
			
			var yyyy_s = parseInt(date_begin.getFullYear());
			var yyyy_e = parseInt(date_end.getFullYear());
			
			if(is_zz == '0' && xl != '0'){
				while(yyyy_s <= yyyy_e){
					score_xl++;
					yyyy_s++;
				}
			}
		}
		this.emInfoForm.setFieldValue("bjfu_zzf_jf.score_xl",score_xl);
		
	}
	


});

function Map(){
	var struct = function(key,value){
		this.key = key;
		this.value = value;
	}
	this.arr = new Array();
	
	this.put = function(key,value){
		for(var i=0; i < this.arr.length; i++){
			if(this.arr[i].key === key){
				this.arr[i].value = value;
				return;
			}
		}
		this.arr[this.arr.length] = new struct(key,value);
	}
	
	this.get = function(key){
		for(var i = 0; i < this.arr.length; i++){
			if(this.arr[i].key === key){
				return this.arr[i].value;
			}
		}
		return null;
	}
	
	this.remove = function(key){
		var v;
		for(var i = 0; i<this.arr.length; i++){
			v = this.arr.pop();
			if(v.key === key){
				continue;
			}
			this.arr.unshift(v);
		}
	}
	
	this.getSize = function(){
		return this.arr.length;
	}
	
	this.getKey = function(i){
		return this.arr[i].key;
	}
	
	this.getMaxValue = function(){
		if(this.getSize <= 0){
			return null;
		}
		var v = this.arr[0].value;
		for(var i = 1; i<this.arr.length; i++){
			if(v <= this.arr[i].value){
				v = this.arr[i].value;
			}
		}
		return v;
	}
	
	this.isEmpty = function(){
		return this.arr.length <= 0;
	}
}


/***
 * 自动带出个人信息（从私房人员库中，注意字段设计不一致），配偶信息，已租赁房屋信息
 * 
 * */
function initBaiscInfo(fieldName,selectedValue,previousValue){
	//1;男;2;女
	if(fieldName=='bjfu_zzf_jf.xb'){
		if( selectedValue =='男' ){
			ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.xb",'1');
		}else if( selectedValue =='女' ){
			ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.xb",'2');
		}
		return false;
	}
	
	if(fieldName=='bjfu_zzf_jf.archive_id'){
		ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.archive_id",selectedValue);
		
		addOtherEmInfo(selectedValue);
		return false;
	}
	
	if(fieldName=='bjfu_zzf_jf.dv_name'){
		ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.dv_name",selectedValue);
		
		ascZzfJfApplyController.calcScore();//所有数据计算完整开始加分。
		return false;
	}
}

/***
 * 自动带出剩余的个人信息
 * */
function addOtherEmInfo(archive_id){
	if(valueExistsNotEmpty(archive_id)){
		var restriction = "sc_zf_em.archive_id='" + archive_id + "'";
        var parameters = {
            tableName: 'sc_zf_em',
            fieldNames: toJSON(['sc_zf_em.em_id','sc_zf_em.gzbm', 'sc_zf_em.is_sworker', 'sc_zf_em.mphone',  'sc_zf_em.date_come_sch', 'sc_zf_em.zw_jb_name', 'sc_zf_em.zc_jb_name', 'sc_zf_em.zw_name', 'sc_zf_em.zc_name']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	var	em_id = result.data.records[0]['sc_zf_em.em_id'];
	        var	gzbm = result.data.records[0]['sc_zf_em.gzbm'];
	        var	is_sworker = result.data.records[0]['sc_zf_em.is_sworker'];//1;是;2;否
	        var	mphone = result.data.records[0]['sc_zf_em.mphone'];
	        var date_come_sch = result.data.records[0]['sc_zf_em.date_come_sch'];
	        var	zw_jb_name = result.data.records[0]['sc_zf_em.zw_jb_name'];
	        var	zc_jb_name = result.data.records[0]['sc_zf_em.zc_jb_name'];
	        var	zw_name = result.data.records[0]['sc_zf_em.zw_name'];
	        var	zc_name = result.data.records[0]['sc_zf_em.zc_name'];
        	
	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.gzbm",gzbm);
	        
	        if(is_sworker == '是'){
	        	ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.is_sworker",'1');
	        }else if(is_sworker == '否'){
	        	ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.is_sworker",'2');
	        }
	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.phone",mphone);
	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.date_come_sch",date_come_sch);
	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.zw_jb_name",zw_jb_name);
	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.zc_jb_name",zc_jb_name);
	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.zw_name",zw_name);
	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.zc_name",zc_name);
        }
        
        //从配偶表带出现配偶信息 
        var restriction = "sc_zf_em_po.archive_id ='" + archive_id + "' and sc_zf_em_po.status = '1'";
        var parameters = {
            tableName: 'sc_zf_em_po',
            fieldNames: toJSON(['sc_zf_em_po.xm', 'sc_zf_em_po.sfzh']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	var xm = result.data.records[0]['sc_zf_em_po.xm'];
 	        var	sfzh = result.data.records[0]['sc_zf_em_po.sfzh'];
 	        
 	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.po_xm",xm);
	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.po_sfzh",sfzh);
        }
        
        //产权房信息
        var restriction = "sc_zf_cq.archive_id='" + archive_id + "'";
        var parameters = {
            tableName: 'sc_zf_cq',
            fieldNames: toJSON(['sc_zf_cq.em_id','sc_zf_cq.zf_type_name', 'sc_zf_cq.rm_addr','sc_zf_cq.bl_id','sc_zf_cq.fl_id','sc_zf_cq.rm_id','sc_zf_cq.bl_name']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	var	rm_addr = result.data.records[0]['sc_zf_cq.rm_addr'];
	        var	zf_type_name = result.data.records[0]['sc_zf_cq.zf_type_name'];
	        var	bl_id = result.data.records[0]['sc_zf_cq.bl_id'];
	        var	fl_id = result.data.records[0]['sc_zf_cq.fl_id'];
	        var	rm_id = result.data.records[0]['sc_zf_cq.rm_id'];
	        var	bl_name = result.data.records[0]['sc_zf_cq.bl_name'];
	        
	        var addr = bl_id + "~" + fl_id + "~" + rm_id +"|" + rm_addr;
	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.rm_addr",addr);
	        ascZzfJfApplyController.emInfoForm.setFieldValue("bjfu_zzf_jf.zf_type_name",zf_type_name);
	    }
        
        ascZzfJfApplyController.showLvliInfo(archive_id,em_id);
	}
}

//获取年月
function getYMFormDate(date){
	var yyyy = date.getFullYear();
	var mm = date.getMonth() + 1;
	if(mm < 10){
		mm = '0' + mm;
	}
	
	return '' + yyyy + mm;
}

function dateToString(date){
	return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
}




