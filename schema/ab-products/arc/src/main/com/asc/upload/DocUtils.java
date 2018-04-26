package com.asc.upload;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.sql.DataSource;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapHandler;

import com.asc.data.DbUtils;

public class DocUtils {
    public static String generateId() {
        SimpleDateFormat df = new SimpleDateFormat("yyyyMMdd");
        String date = df.format(new Date());
        int random = (int) (Math.random() * 1000);
        return date + random;
    }
}
