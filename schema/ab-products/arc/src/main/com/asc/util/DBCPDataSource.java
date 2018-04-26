package com.asc.util;

import java.io.InputStream;
import java.util.Properties;

import javax.sql.DataSource;

import org.apache.commons.dbcp.BasicDataSourceFactory;

public class DBCPDataSource {
    private static InputStream inStream;
    private static Properties pro=null;
    private static DataSource datasource;
   
   static {
       inStream=DBCPDataSource.class.getResourceAsStream("mydbcp.properties");
       pro=new Properties();
       try {
           pro.load(inStream);
           datasource=BasicDataSourceFactory.createDataSource(pro);
       } catch (Exception e) {
           e.printStackTrace();
       }
    }
    private DBCPDataSource(){
      
    }
   
    public static DataSource getDataSource(){
       return datasource;
    }
   

   
   
}
