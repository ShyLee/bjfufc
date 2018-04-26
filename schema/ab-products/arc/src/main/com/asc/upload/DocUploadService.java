package com.asc.upload;

import java.io.*;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;
import java.util.Calendar;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.sql.DataSource;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.fileupload.*;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.archibus.config.*;
import com.archibus.context.ContextStore;
import com.archibus.context.utility.EventHandlerContextTemplate;
import com.archibus.utility.*;
import com.asc.data.DbUtils;

public class DocUploadService extends HttpServlet {
    private static final long serialVersionUID = 1L;
    String path = null;
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
      this.path = getServletContext().getRealPath("/upload/doc");
    }
    
    @Override
    public void doGet(final HttpServletRequest request, final HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        final PrintWriter out = response.getWriter();
        out.println("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">");
        out.println("<HTML>");
        out.println("  <HEAD><TITLE>A Servlet</TITLE></HEAD>");
        out.println("  <BODY>");
        out.print("不支持get上传");
        out.println("  </BODY>");
        out.println("</HTML>");
        out.flush();
        out.close();
    }
    
    @Override
    public void doPost(final HttpServletRequest req, final HttpServletResponse resp)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        Date today = new Date();
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        String uploadDate = format.format(today);
        final String id = req.getParameter("selectedNode");
        String url=getURLById(id);
        String realPath=this.path+File.separator+"temp";
        final File tempForder = new File(realPath);
        if (!tempForder.exists()) {
            tempForder.mkdirs();
        }
        final DiskFileItemFactory f = new DiskFileItemFactory();
        f.setSizeThreshold(1024 * 10);
        f.setRepository(tempForder);
        final ServletFileUpload sf = new ServletFileUpload(f);
        try {
            final List<FileItem> list = sf.parseRequest(req);
            for (final FileItem fi : list) {
                if (fi.isFormField()) {
                    // String val = fi.getString("UTF-8"); //设置uTF-8获取表单的值
                    // System.err.println(val);
                } else {
                    String fileName = fi.getName();
                    String ext = fileName.substring(fileName.lastIndexOf("."));
                    String gid=DocUtils.generateId();
                    String dburl=url+File.separator+fileName;
                    
                    fi.getContentType();
                    final InputStream in = fi.getInputStream();
                    in.available();
                    final String destFolder = this.path+ url;
                    FileUtil.createFoldersIfNot(destFolder);
                    FileCopy.copy(in, new File(destFolder + File.separator + fileName));
                    fi.delete();
                    insertDB(gid,id,fileName,ext,dburl,uploadDate);
                }
            }
        } catch (final FileUploadException e) {
            e.printStackTrace();
        }
    }
    
    private void insertDB(String gid, String id, String fileName, String ext, String dburl,String uploadDate) {
        Connection conn;
        try {
            conn = DbUtils.getConnection();
            QueryRunner query = new QueryRunner();
            String url = "";
            String sql = "insert into sc_doc_center(id,pid,type,name,url,doc_type,upload_date) values(?,?,?,?,?,?,?)";
            query.update(conn, sql, gid, id, 1, fileName, dburl,ext,uploadDate);
            conn.commit();
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void getContext() {
        final CoreUserSessionTemplate template = new CoreUserSessionTemplate();
        template.execute(new Runnable() {
            public void run() {
                prepareContext();
            }
        });
    }
    
    private void prepareContext() {
        final ConfigManager.Immutable configManager = ContextStore.get().getConfigManager();
        final List<Project.Immutable> projects = configManager.getProjects();
        for (final Project.Immutable project : projects) {
            if (project.isOpen()) {
                ContextStore.get().setProject(project);
                ContextStore.get().setUserSession(project.loadCoreUserSession());
            }
        }
        if (ContextStore.get().getEventHandlerContext() == null) {
            ContextStore.get().setEventHandlerContext(
                EventHandlerContextTemplate.prepareEventHandlerContext());
        }
    }
    
    private String getURLById(String id){
        DataSource ds = DbUtils.getDataSource();
        QueryRunner query = new QueryRunner(ds);
        Map map=null;
        try {
            map = query.query("select url from sc_doc_center  where id = '" + id + "'",
                new MapHandler());
        } catch (SQLException e) {
            e.printStackTrace();
        }
        String url = (String) map.get("url");
        if (url == null) {
            return "";
        }
        return url;
    }
}
