package com.assettracker.utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    private static final String URL = "jdbc:sqlite:itams.db";
    
    public static Connection getConnection() throws SQLException, ClassNotFoundException {
        // Load the SQLite JDBC driver
        Class.forName("org.sqlite.JDBC");
        
        // Establish and return the connection
        return DriverManager.getConnection(URL);
    }
}
