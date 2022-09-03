import requests
import time
import random
from config import websitesInstances
from utils import patch
import sys

    
class TargetWebsite:
    def __init__(self, target) -> None:
        self.websiteInstance = websitesInstances[target]
        self.baseUrl = self.websiteInstance.baseUrl
        self.headers = self.websiteInstance.headers
        self.target = target
        self.session = requests.Session()
        self.isShutdown = False
        self.running = True
    
    def shutdown(self):
        self.isShutdown = True
        
    def myGet(self, url, headers):
    
        time.sleep(random.choice([1, 2, 3]))
        print(f"url : {url}")
        try:
            page = self.session.get(url,headers=headers,timeout=10)
            # lastCookies = session.cookies
            if page.status_code == 404:
                err = f"404: {url}"
                print(err)
                return 404
            return page
        except:
            print(f"err : {url}")
            self.session = requests.Session()
        return None
    
    def isRunning(self):
        if self.isShutdown:
            self.running = False
        return self.running
            
            
    
    def scrapCategories(self, erredCategories = []):

        s = time.time()
    
        categories = erredCategories or self.websiteInstance.loadCategories()
        for category in categories:
            if not self.isRunning():
                return True
            # request the url and return the req response
            res = self.myGet(self.baseUrl + category, self.headers)
           
            if res == None: # check if the request blocked and add the url to erred categories list to re-scrap (recursion)
                erredCategories.append(category)
            elif res != 404:
                self.websiteInstance.setUrl(category)
                self.websiteInstance.setPage(res)
                # generate list of possible paginations of the given category
                self.websiteInstance.getPaginations()
                if len(erredCategories) > 0 and category in erredCategories:
                    erredCategories.remove(category)
        
        if len(erredCategories) > 0:
            return self.scrapCategories(erredCategories)
        minutesSpent = int((time.time()-s)/60)
        print(f"{self.target} : categories : ALL FRESH | time spent {minutesSpent} minutes")
        return True
    
    def scrapOnePagination(self, pageUrl):
        res = self.myGet(self.baseUrl+pageUrl, self.headers)
        if res is None:
            raise "Error request"
        elif res != 404:
            self.websiteInstance.setUrl(pageUrl)
            self.websiteInstance.setPage(res)
            pageProducts = self.websiteInstance.getProductsList()
            self.updateProducts(pageProducts)
            self.websiteInstance.pages[pageUrl] = True
            self.websiteInstance.updatePaginationsInJSON()
            return pageProducts
        else:
            return []
    
    def scrapAllPages(self):
        s = time.time()
        
        self.websiteInstance.loadPaginations()
        isCorrupted = False
        for page,scrapped in self.websiteInstance.pages.items():
            if not self.isRunning():
                return True
            if not scrapped:
                try:
                    self.scrapOnePagination(page)
                except IOError:
                    type, value, traceback = sys.exc_info()
                    print('Error opening %s: %s' % (value.filename, value.strerror))
                    isCorrupted = True

        if isCorrupted:
            return self.scrapAllPages()
        
        self.websiteInstance.updateStatus()
        minutesSpent = int((time.time()-s)/60)
        print(f"{self.target} : paginations : ALL FRESH | time spent {minutesSpent} minutes")
        return True             

    
    def updateProducts(self, products):
    
        dbProductsDict = self.websiteInstance.loadProducts()

        for product in products:
            
            p = patch.patchProduct(dbProductsDict.get(product['id']), product)
            dbProductsDict[p['id']] = p

        self.websiteInstance.updateProductsInJSON(dbProductsDict)
        return True
        