package com.asc.data;

import com.archibus.datasource.SqlUtils;

public class UpdateAzfHistroy {
    
    public void updateHistroy() {
        String sql =
                "INSERT INTO sc_azf_detail (archive_id,azf_price, date_azf_begin,dv_id,dv_name,em_id,email,"
                        + "gzbm,month,mphone, po_name, po_sfzh,sfzh, stop_reason,xb,xm,year, zc_id, zc_name, zw_id,zw_name,months)"
                        + "  SELECT archive_id,azf_price,date_azf_begin,dv_id,dv_name,em_id, email,"
                        + "gzbm, month, mphone, po_name, po_sfzh, sfzh, stop_reason, xb,xm,year,zc_id, zc_name, zw_id,zw_name,months"
                        + "  FROM azf_detail";
        SqlUtils.executeUpdate("sc_azf_detail", sql);
        SqlUtils.commit();
        
        String sql1 =
                "update sc_azf_em set total_month = (select azf_total_v.total_month from azf_total_v where sc_azf_em.archive_id = azf_total_v.archive_id),"
                        + " total_price = (select azf_total_v.total_price from azf_total_v where sc_azf_em.archive_id = azf_total_v.archive_id)";
        SqlUtils.executeUpdate("sc_azf_em", sql1);
        SqlUtils.commit();
    }
}
