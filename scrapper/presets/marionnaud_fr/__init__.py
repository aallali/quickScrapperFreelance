# empty
import random
import math
import json
import re
import os
import traceback
from utils import json_utils
from utils import days_diff_calculator
from bs4 import BeautifulSoup

dirname = os.path.dirname(__file__)

def gPath(path):
    return os.path.join(dirname, path)

class Website:
    def __init__(self) -> None:

        self.perPageSize = 101
        self.baseUrl =  "https://www.marionnaud.fr" 
        self.website = "marionnaud.fr"
    
        uas = [
            'Mozilla/5.0 (X11; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0', 
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36',
            ]
        self.headers = {
            'User-Agent':random.choice(uas),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            }
        self.loadPaginations()
     
 
    def setUrl(self, url):
        self.url = url
        self.fullUrl = self.baseUrl + url
        
    def setPage(self, response):
        self.response = response
        self.page = BeautifulSoup(response.content, "html.parser")
 

    def loadCategories(self):
        return json_utils.loadFile(gPath('./data/categories.json'))

    def loadPaginations(self):
        self.pages = dict(json_utils.loadFile(gPath('./data/pages.json')))
     
        return list(self.pages.keys())

    def loadProducts(self):
        productsList = json_utils.loadFile(gPath('./data/products.json'))
        allProds = {}
        for p in productsList:
            allProds[p['id']] = p
        return allProds
    
    def updatePaginationsInJSON(self):
       
        json_utils.updateFile(gPath('./data/pages.json'), self.pages)
        
    def updateProductsInJSON(self, productsDict):
        productsList = []
    
        for key in productsDict.keys():
            productsDict[key]['id'] = key
            productsList.append(productsDict[key])
      
        json_utils.updateFile(gPath('./data/products.json'), productsList)
        
        return True
    
    def updateStatus(self):
        
        productsList = []
        productsDict = self.loadProducts()
        for key in productsDict.keys():
           
            productsDict[key]['id'] = key
            daysDiff = days_diff_calculator.days_between(productsDict[key]['updated_at'], None)
            if daysDiff > 0:
                productsDict[key]['statu'] = 'deleted'
            productsList.append(productsDict[key])
      
        json_utils.updateFile(gPath('./data/products.json'), productsList)
        
        return True
    def getPaginations(self):
     
        paginations = dict()
        
        totalProductsText = self.page.find("label", class_="totalResults").text
        
        totalProductsRgx = re.findall(r'[0-9 ]+', totalProductsText)
        totalProductsRgx = "".join(totalProductsRgx)
        
        totalProductsNumber = int(totalProductsRgx)
        
        totalPagesNumber =  math.ceil(totalProductsNumber/self.perPageSize)
        
        for i in range(0, totalPagesNumber):
            paginations[f"{self.url}/?page={str(i)}"] = False

        pages = paginations.keys()
   
        for page in pages:
            self.pages[page] = False #self.pages.get(page) or paginations[page]
        
         
        json_utils.updateFile(gPath('./data/pages.json'),  self.pages)
        return  paginations.keys()

    def getProduct(self, prodElement):

        img = prodElement.find("img", class_="primImg").attrs['data-src']
 
        price = prodElement.find("span", class_="lineinner").text
        price = price.strip().replace("€", ".")
        price = float(price)
    
        product = {
            'id': prodElement.find("div", class_="daily-offer-block daily-offer-countdown").attrs['data-product-id'],
            'name': " ".join([
                prodElement.find("div", class_="range_name").text, 
                prodElement.find("div", class_="product_name").text
                ]).strip(),
            'url': prodElement.find("a", class_="ProductInfoAnchor").attrs['href'].replace(self.baseUrl, ""),
            'brand': prodElement.find("div", class_="brand").text.strip(),
            'image': "https://www.marionnaud.fr" + img,
            'price': price,
            'categoryUrl': self.url.split("/?page=")[0],
            'listUrl': self.url,
            'website': self.website
        }
 
        return product
    
    def getProductsList(self):
 
        products = self.page\
        .find("ul", class_="product-listing")
        
        if not products:
            return []
        
        products = products.find_all("div", class_="productMainLink")


        finalListProducts = []
        for prod in [products[0]]:
           
            try:
                prod = self.getProduct(prod)
                if prod:
                    finalListProducts.append(prod)
            except Exception as err:
                print(traceback.format_exc())
                print(err)
       
                print("---------------------------------")
                print("---------------------------------")
                print("---------------------------------")

                pass
                 
        return finalListProducts