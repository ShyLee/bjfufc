package com.asc.upload;

public class TreeItem {
    private String id;
    
    private String name;
    
    private String pid;
    
    private String isParent;
    
    private String open;
    
    public String getOpen() {
        return this.open;
    }
    
    public void setOpen(final String open) {
        this.open = open;
    }
    
    public String getIsParent() {
        return this.isParent;
    }
    
    public void setIsParent(String isParent) {
        this.isParent = isParent;
    }
    
    /**
     * Getter for the id property.
     * 
     * @see id
     * @return the id property.
     */
    public String getId() {
        return this.id;
    }
    
    /**
     * Setter for the id property.
     * 
     * @see id
     * @param id the id to set
     */
    
    public void setId(final String id) {
        this.id = id;
    }
    
    /**
     * Getter for the name property.
     * 
     * @see name
     * @return the name property.
     */
    public String getName() {
        return this.name;
    }
    
    /**
     * Setter for the name property.
     * 
     * @see name
     * @param name the name to set
     */
    
    public void setName(final String name) {
        this.name = name;
    }
    
    /**
     * Getter for the pid property.
     * 
     * @see pid
     * @return the pid property.
     */
    public String getPid() {
        return this.pid;
    }
    
    /**
     * Setter for the pid property.
     * 
     * @see pid
     * @param pid the pid to set
     */
    
    public void setPid(final String pid) {
        this.pid = pid;
    }
    
    /** {@inheritDoc} */
    
    @Override
    public String toString() {
        return "TreeItem [id=" + this.id + ", name=" + this.name + ", pid=" + this.pid + "]";
    }
    
}
