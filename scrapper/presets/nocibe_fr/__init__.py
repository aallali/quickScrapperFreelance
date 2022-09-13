
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

        self.perPageSize = 48
        self.baseUrl =  "https://www.nocibe.fr" 
        self.website = "nocibe.fr"
    
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
        
        totalProductsText = self.page.find(class_="prodlist__head-amount").text
        totalProductsRgx = re.findall(r'\d+', totalProductsText)
        totalProductsNumber = list(map(int, totalProductsRgx))[0]
        totalPagesNumber =  math.ceil(totalProductsNumber/self.perPageSize)
        
        for i in range(1, totalPagesNumber + 1):
            paginations[f"{self.url}/I-Page{str(i)}_48?Paging=true"] = False

        pages = paginations.keys()
   
        for page in pages:
            self.pages[page] = False #self.pages.get(page) or paginations[page]
        
         
        json_utils.updateFile(gPath('./data/pages.json'),  self.pages)
        return  paginations.keys()

    def getProduct(self, prodElement):
 
        img = prodElement.find("img", class_="proditem__img-img").attrs
        
        price = (prodElement.find("div", class_="proditem__price-only-price") or\
            prodElement.find("div", class_="proditem__price-last-price")).text
        price = price.strip()
        r = re.compile(r'(\d[\d.,]*)\b')
        price = [x.replace(',', '') for x in re.findall(r, price)][0].strip()
        price = float(price)
        
        product = {
            'id': prodElement.find("a", class_="proditem__link").attrs['data-beaver-id'],
            'name': " ".join([l.text for l in prodElement.findAll("span", class_="proditem__infos-name")]),
            'url': prodElement.find("a", class_="proditem__link").attrs['href'].replace(self.baseUrl, ""),
            'brand': prodElement.find("strong", class_="proditem__infos-name").text,
            'image': img.get('src').replace("300x300", "1000x1000"),
            'price': price,
            'categoryUrl': self.url.split("/I-Page")[0],
            'listUrl': self.url,
            'website': self.website
        }
     
        return product
    
    def getProductsList(self):
 
        products = self.page.find(class_="prodlist__list-wrap")
        
        if not products:
            return []
        
        products = products.find_all(class_="proditem proditem__after-story")

        finalListProducts = []
        for prod in products:
           
            try:
                prod = self.getProduct(prod)
                if prod:
                    finalListProducts.append(prod)
            except Exception as err:
                print(traceback.format_exc())
                print(err)
                print(prod)
                print("---------------------------------")
                print("---------------------------------")
                print("---------------------------------")

                pass
                 
        return finalListProducts