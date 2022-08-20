#!/usr/bin/python

import sqlite3
import string
import datetime


class DB:
    def __init__(self, dbName:string):
        self.dbName = dbName
        self.connection = None
    def connect(self):
        try:
            # Making a connection between sqlite3 database and Python Program
            self.connection = sqlite3.connect(self.dbName)
            # If sqlite3 makes a connection with python program then it will print "Connected to SQLite"
            # Otherwise it will show errors
            print(f"Connected to SQLite, db : {self.dbName}")
        except sqlite3.Error as error:
            print("Failed to connect with sqlite3 database", error)
            
    def disconnect(self):
        self.connection.close()
        print("Database closed.")
        
    def createTables(self):
        try:
            self.connection.execute('''CREATE TABLE `PRODUCTS` (
            `id` VARCHAR(20) NOT NULL,
            `name` VARCHAR(20) NOT NULL,
            `brand` VARCHAR(20),
            `image` VARCHAR(20),
            `price` FLOAT(20) NOT NULL,
            `statu` VARCHAR(20),
            
            `website` VARCHAR(20) NOT NULL,
            `url` VARCHAR(20) NOT NULL,
            `categoryUrl` VARCHAR(20) NOT NULL,
            `lindex` INT(20) NOT NULL,
            `listUrl` VARCHAR(20) NOT NULL,
            
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`));''')
            print("Table : products , has been created.")
        except sqlite3.OperationalError as err:
            print(err)

        
    def addProduct(self, product):
        """
        create product from given object
        """
        query ="INSERT INTO PRODUCTS (id, name, brand, image, url, price, website, statu, categoryUrl, listUrl, lindex) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
        params = (product['id'],
            product['name'],
            product['brand'],
            product['image'],
            product['url'],
            product['price'],
            product['website'],
            product['statu'],
            product['categoryUrl'],
            product['listUrl'],
            product['lindex'])

        try:
            self.connection.execute(query, params)
            self.connection.commit()
        except (sqlite3.OperationalError, sqlite3.IntegrityError) as err:
            print(err)
        return True
    
    def updateProduct(self, product):
        """
        create product from given object
        """
        query ="""UPDATE PRODUCTS SET name=?, brand=?, image=?, url=?, price=?, website=?, statu=?, categoryUrl=?, listUrl=?, lindex=?,updated_at=? WHERE id=?;"""
        params = (
            product['name'],
            product['brand'],
            product['image'],
            product['url'],
            product['price'],
            product['website'],
            product['statu'],
            product['categoryUrl'],
            product['listUrl'],
            product['lindex'],
            str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            product['id'])

        try:
            self.connection.execute(query, params)
            self.connection.commit()
        except (sqlite3.OperationalError, sqlite3.IntegrityError) as err:
            print(err)
        return True
    
    def updateAllToDeleted(self):
        """
        create product from given object
        """
        query ="UPDATE PRODUCTS SET statu='deleted'"

        try:
            self.connection.execute(query)
            self.connection.commit()
        except (sqlite3.OperationalError, sqlite3.IntegrityError) as err:
            print(err)
        return True
    
    def findProductWithID(self, id):
        prod  = list(self.connection.execute('SELECT * FROM PRODUCTS WHERE id = ?', [id]))
        """
        find products with given filter in query
        """
        if len(prod) > 0:
            return prod[0]
        return None
    
    def getListsWithDeletedProducts(self):
        """
        return all lists that have deleted products
        """
        data = self.connection.execute('''SELECT DISTINCT(listUrl) FROM PRODUCTS WHERE statu="deleted"''')
        
        return list([l[0] for l in data])
    def getAllProducts(self):
        """
        return all products from table
        """
        data = self.connection.execute('''SELECT * FROM PRODUCTS''')
        return list([{
                       'id': l[0] ,
                       'name': l[1] ,
                       'brand': l[2] ,
                       'image': l[3] ,
                       'price': l[4] ,
                       'statu': l[5] ,
                       'website': l[6] ,
                       'url': l[7] ,
                       'categoryUrl': l[8] ,
                       'index': l[9] ,
                       'listUrl': l[10] ,
                       'updated_at': l[11] ,
                       'created_at': l[12] 
                      } for l in data])
        

 