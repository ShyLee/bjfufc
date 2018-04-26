package com.archibus.service.school;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

public class ParcellandService extends JobBase {
    EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    
    public void parcellandXiaZhang(final JSONObject record) {
        this.status.setResult(new JobResult("Parcelland XiaZhang"));
        this.status.setTotalNumber(100);
        final String landCode = record.getString("sc_parcelland_xz.land_code");
        
        // 1 将宗地数据拷贝到sc_parcelland_xz表中
        this.copyRecordToParcellandXZ(landCode);
        this.status.setCurrentNumber(40);
        
        // 2 补充保存表sc_parcelland_xz 有关宗地下账的数据字段------------------------------HML
        this.saveDataToParcellandXZ(record);
        this.status.setCurrentNumber(80);
        
        // 3 修改宗地表中sc_parcelland.accounted的值为已下帐。
        this.setAccTypeToYxz(landCode);
        this.status.setCurrentNumber(100);
        
    }
    
    /**
     * 将宗地数据拷贝到sc_parcelland_xz表中
     * */
    private void copyRecordToParcellandXZ(final String landCode) {
        
        final String[] fields_list =
                { "land_code", "name", "area_tudi", "site_id", "assets_num", "assets_name",
                        "atype_code", "atype_name", "use_status", "land_type", "use_dp",
                        "operator", "accounted", "chanqx_sid", "srcid", "date_build", "cgzzxs_id",
                        "quansxz_id", "quanszh", "quanszm", "date_faz", "quans_czr",
                        "parcelland_address", "area_land", "measure_unit", "certificate",
                        "account_proof", "value_type", "value_book", "value_original", "value_net",
                        "avg_price", "area_ziyong", "value_ziyong", "area_rent", "value_rent",
                        "area_lend", "value_lend", "area_invest", "value_invest", "area_danbao",
                        "value_danbao", "area_other", "value_other", "quanszm_fj",
                        "other_document", "description" };
        String sql = "insert into sc_parcelland_xz (";
        
        final StringBuffer blField = new StringBuffer();
        final StringBuffer scBlXzField = new StringBuffer();
        
        for (int i = 0; i < fields_list.length; i++) {
            if (i != fields_list.length - 1) {
                scBlXzField.append(fields_list[i]);
                scBlXzField.append(",");
                blField.append("sc_parcelland.");
                blField.append(fields_list[i]);
                blField.append(",");
            } else {
                scBlXzField.append(fields_list[i]);
                blField.append("sc_parcelland.");
                blField.append(fields_list[i]);
            }
        }
        sql =
                sql + scBlXzField.toString() + ") select " + blField.toString()
                        + " from  sc_parcelland where sc_parcelland.land_code=" + "'" + landCode
                        + "'";
        
        SqlUtils.executeUpdate("sc_parcelland_xz", sql);
        SqlUtils.commit();
    }
    
    /**
     * 2 补充保存表sc_parcelland_xz 有关宗地下账的数据字段
     * */
    private void saveDataToParcellandXZ(final JSONObject record) {
        
        final String land_code = record.getString("sc_parcelland_xz.land_code");
        final String date_xiazhang = record.getString("sc_parcelland_xz.date_xiazhang");
        final String date_approved = record.getString("sc_parcelland_xz.date_approved");
        final String approved_by = record.getString("sc_parcelland_xz.approved_by");
        final String approved_dv = record.getString("sc_parcelland_xz.approved_dv");
        final String approved_doc = record.getString("sc_parcelland_xz.approved_doc");
        final String value_net = record.getString("sc_parcelland_xz.value_net");
        final String handle_modality = record.getString("sc_parcelland_xz.handle_modality");
        final String operator_xiazhang = record.getString("sc_parcelland_xz.operator_xiazhang");
        final String date_operate = record.getString("sc_parcelland_xz.date_operate");
        final String disposal_proceeds = record.getString("sc_parcelland_xz.disposal_proceeds");
        
        final String sql =
                "update sc_parcelland_xz set date_xiazhang = to_date('" + date_xiazhang
                        + "','yyyy-mm-dd')," + "date_approved = to_date('" + date_approved
                        + "','yyyy-mm-dd')," + "approved_by = '" + approved_by + "',"
                        + "approved_dv = '" + approved_dv + "'," + "approved_doc = '"
                        + approved_doc + "'," + "value_net = '" + value_net + "',"
                        + "handle_modality = '" + handle_modality + "'," + "operator_xiazhang = '"
                        + operator_xiazhang + "'," + "date_operate = '" + date_operate + "',"
                        + "disposal_proceeds = '" + disposal_proceeds + "'," + "accounted = 'N'"
                        + " where sc_parcelland_xz.land_code = '" + land_code + "'";
        
        SqlUtils.executeUpdate("sc_parcelland_xz", sql);
        SqlUtils.commit();
    }
    
    /**
     * 3 修改宗地表中sc_parcelland.accounted的值为已下帐。
     * */
    private void setAccTypeToYxz(final String land_code) {
        
        final String sql =
                "update sc_parcelland set accounted = 'N'" + " where sc_parcelland.land_code = '"
                        + land_code + "'";
        
        SqlUtils.executeUpdate("sc_parcelland", sql);
        SqlUtils.commit();
    }
}
