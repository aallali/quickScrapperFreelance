#!/usr/bin/python
from tracemalloc import start
from lxml import etree
from io import StringIO
import requests
import time
import re
import math
import json
import datetime
import random
import re
import sys
from db.db import DB
# initial fresh date of current time via the format : YYYY-mm-DD HH-MM-SS to be used as reference
todayDate = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
perPageSize = 100
# Set explicit HTMLParser
parser = etree.HTMLParser()
session = requests.Session()
db = DB('./db/data.db')
lastCookies = {}
db.connect()
db.createTables()
 
# 

def loadFile(file):
    """
    load data from .json file into variable
    """
    f = open(file)
    # returns JSON object as 
    # a dictionary
    data = json.load(f)
    f.close()
    return data

def updateFile(file, data):
    """
    save json data into file
    """
    with open(file, "w") as outfile: 
        json.dump(data, outfile)
    return False
    
def saveProducts(products):
    """
    save the products into the file after making some checks and changes
    1 - load data from db then check search for each product scrapped if it exists in db 
        if found :
                - check if price changed
                - update statu with changed or stable in case price changed
                - update price:date with current date so we keep the track of scrapping time
        if not found:
                - add the product to db with statu : new
    """
    
 
    for product in products:
        baseUrl = "https://www.sephora.fr"
        doc = db.findProductWithID(product['id'])
        product['website'] = baseUrl
        product['categoryUrl'] = product['sourceCaregoryUrl'].split("?")[0].replace(baseUrl, "")
        product['listUrl'] = product['sourceCaregoryUrl'].replace(baseUrl, "")
        product['url'] = product['url'].replace(baseUrl, "")
        if not doc:
            product['statu'] = "new"
            db.addProduct(product)
            
        else:
        
            if doc[4] != product['price']:
                product['statu'] = 'changed'
                
            else:
                product['statu'] = 'stable'
            db.updateProduct(product)
 
def getTotalPages(e):
    """
    e : the html dom to search in with xpath
    get total products from page from the text in top of products , eg : (859 Produits)
    every page list 28 products
    every pagination is suffixed by (?page=x)
    total pages = (total products in category)859 / (total products listed in first page)28
    return number of pages
    """
    totalProductsTxt = e.xpath("//div[@class='results-hits']")[0].text
    totalProductsRgx = re.findall(r'\d+', totalProductsTxt)
    totalProductsNumber = list(map(int, totalProductsRgx))[0]
    return math.ceil(totalProductsNumber/perPageSize) #math ceil to take the upper number when there is  decimal eg: 5.64 => 6

def getAllProducts(e):
    """
    extract all products divs from the current page
    return list of products  as html dom
    """
    ul = e.xpath("//ul[@id='search-result-items']")
    li = e.xpath("//li[contains(@class, 'grid-tile')]//div[contains(@class, 'product-tile') and @data-itemid and @data-tcproduct]")
    return li

def getAllPaginationsUrls(url, totalPaginationUrls):
    """
    from base url of category + number of pages in this category
    we build a list of pagination urls bases om the details given
    return array of strings
    """
    urls = []
    
    for i in range(totalPaginationUrls):
     
        # startIndex = i * perPageSize
       
        urls.append(f"{url}?page={i+1}&sz={perPageSize}&format=page-element")
    
    # load all urls to be scrapped from urls.json 
    # try to merge the data stored with new one to avoid duplication
    #
    #
    #
    #
    data = loadFile("data/urls.json")
    data = [l['url'] for l in data]
    urlsSet = set(data)
    urlsSet.update(tuple(urls))
    allurls = list(urlsSet)
    allurls = [{'url': l, 'success': False} for l in allurls]
    
    updateFile("data/urls.json", allurls)
    #
    #
    #
    #
    # the steps above are not necessary usefull for the moments since we just store data but dont use it for scraping
    # but i stored them in file so in case we needed that in future, ill have the base structure ready
    return allurls

def setUrlSuccess(url):
    data = loadFile("data/urls.json")
    for l in data:
        if url == l['url']:
            l['success'] = True
            
    updateFile("data/urls.json", data)
    
def updateUrlsStatus(stat):
    data = loadFile("data/urls.json")
    for l in data:
        l['success'] = stat
            
    updateFile("data/urls.json", data)
    
def loadCategoriesUrlsToScrap():
    
    """
    all the cateogories urls (not paginations !!!) in this file will be fetched and 
    scrapped from page 1 to page final
    """
    return loadFile("data/categories.json")

def extractProductData(prod, categoryUrl, index):
    """
    extract the product's data from the the single html dome of the product li 
    (check getAllProducts() function to understand)
    data collected : id,name,image,url,price(date,price),index,statu,sourceCaregoryUrl
    where : 
        - price.date : the date where this product has been checked and got the price collected
        - index      :  the order of the product in the list of that single page
        - status     : 
            + new     : when the product newly added to category
            + deleted : when the product has been removed
            + changed : when the product's price has been changed
            + stable  : if the product's price hasn't been changed since last scrap
    """
    data = {
        'id' : '', #done
        'name' : '', #done
        'brand': '', #done
        'image' : '',  #done
        'url' : '', #done
        'price' : 0,  #done
        'lindex': index,  #done
        'statu': 'new|deleted|changed|stable', #done
        'sourceCaregoryUrl': categoryUrl  #done
    }
    
    # i reload the single product html into etree again
    # so i root got reset to that single product and not whole html page
    prod = etree.parse(StringIO(etree.tostring(prod).decode()), parser=parser)
    # extract id from the 'data-product-id' tag existing in div tag
    data['id'] = prod.xpath("//div[@data-product-id]")[0].get('data-product-id')

    # extract the namee/url from 'a' tag 
    href = prod.xpath("//a[@data-name and @title]")[0]
    data['name'] = href.get("title")
    data['url'] = href.get('href')
    data['brand'] = prod.xpath('//span[@class="product-brand"]')[0].text.strip()
    
    # get the image url and remove the params from url to get best quality image
    img = prod.xpath("//img[contains(@class, 'product-first-img')]")[0]
    data['image'] = (img.get("data-src") or img.get("src")).split("?")[0]

    # set the time of this scrapping which is declared globally every time the script executed
 
    
    # extract price from html as text and trim spaces
    price = prod.xpath("//div[@class='product-pricing']//span")[0].text.strip()
    data['price'] = price.strip()
    if price:
        r = re.compile(r'(\d[\d.,]*)\b')
        data['price'] = [x.replace('.', '') for x in re.findall(r, price)][0].strip()
        data['price'] = float(data['price'].replace(",", "."))
    
    
    return data

def printStatsOfDB():

    _db = loadFile("data/products.json")
    
    deleted = [l for l in _db if l['statu'] == 'deleted']
    newProds = [l for l in _db if l['statu'] == 'new']
    changed = [l for l in _db if l['statu'] == 'changed']
    stable = [l for l in _db if l['statu'] == 'stable']
    print(f"""
    Stats of this scrapping :
    New : {len(newProds)}
    Deleted : {len(deleted)}
    Changed : {len(changed)}
    Stable  : {len(stable)}
    
          """)
    
def myGet(url):
    # global lastCookies
    """
    costum function that initiat a GET request with costum USER-AGENT header (without it the website block the requests)
    then load the response into etree html parser
    return tree of html dom
    TODO: make the user agent random from list of user agents will be gived hardcoded
    """
    uas = ['Mozilla/5.0 (X11; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0', 
           'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36',
            ]
    r = session.get(url ,headers={
            'User-Agent':random.choice(uas),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': url.split("?")[0]
            },timeout=10)
   
    # lastCookies = session.cookies
    html = r.content.decode("utf-8")
    tree = etree.parse(StringIO(html), parser=parser)
    return tree

def scrapMainCategories():
    db.updateAllToDeleted()
    updateFile("data/urls.json", [])
    categoriesUrls_ = loadCategoriesUrlsToScrap()

    # loop through the categories urls
    for cat in categoriesUrls_:
        print(cat)
        
        # fetch the category and get the html
        tree = myGet(cat)
        
        print(f"Total Pages : {getTotalPages(tree)}")
        
        # generate list of all paginations urls
        getAllPaginationsUrls(cat, getTotalPages(tree))
        
def scrapPagination(urls):
    global session
    
    paginations = []
    if urls:
        paginations = [f"https://www.sephora.fr{l}" for l in  urls]
    else:
        paginations = loadFile("./data/urls.json")
        paginations = [l['url'] for l in paginations if not l['success']]
        
 
    print(f"Total paginations : {len(paginations)}")
    
    s = time.time()

    # loop through the paginations
    for (i,page) in enumerate(paginations):
        if i % 10 == 0:
            session = requests.Session()
        
        sucess = False
        tries = 5
        while tries > 0 and not sucess:
                # fetch the page and return html
            try:
                tree =  myGet(page) 
                sucess = True
            except requests.exceptions.Timeout as err: 
                if tries == 5:
                    print(f"Error : {page}")
                # print(err)
                time.sleep(5 + (5-tries) * 2)
                tries -= 1
        if tries <= 0:
            print(f"BYPASSED : {page}")
            continue
       
       
        # extract list of the products's html
        products = getAllProducts(tree)
        
        # intiat variable where to store the final products data after extraction and cleaning
        productsCleaned = []
        
        # loop through the products list (html formal)
        for (x,prod) in enumerate(products):
            
            # extract the cleaned product data from each product dom via extractProductData
            pddt = extractProductData(prod, page, x)
            
            # push the product to the list of products
            productsCleaned.append(pddt)
            
        # save the products to local file 'products.json'

        
        saveProducts(productsCleaned)  
        
        # print(f"Total Products in  page {i + 1} is: {len(productsCleaned)}")
        randomWaitingTime = random.choice([1,2,3,4,5])
        # print(f"waitng time at {i} is : {randomWaitingTime}")
        if not urls:
            setUrlSuccess(page)
        minutesSpent = int((time.time()-s)/60)
        print(f"urls scrapped : {i+1}/{len(paginations)}  | [{minutesSpent} minuten]\r")
        if minutesSpent >= 13:
            sys.exit(1)
        time.sleep(randomWaitingTime)
 
"""
mainCats
paginationsContinue
paginationsFresh
scrapDeleted
data
"""

def mainCats():
    scrapMainCategories()
    return 

def paginationsFresh():
    updateUrlsStatus(False)
    scrapPagination(None)
    return 

def paginationsContinue():
    scrapPagination(None)
    return


def scrapDeleted():
    delLists = db.getListsWithDeletedProducts()
     
    updateUrlsStatus(False)
    scrapPagination(delLists)
    return 

def getData():
    data = db.getAllProducts()
    for l in data:
        del l['website']
        del l['index']
    updateFile("./data/products.json", data)
    printStatsOfDB()
    print("data extraction")
    return 

if __name__ == "__main__":

    if len(sys.argv) > 1:
        if sys.argv[1] == "mainCats":
            scrapMainCategories()
        elif sys.argv[1] == "paginationsContinue":
            scrapPagination(None)
        elif sys.argv[1] == "paginationsFresh":
            updateUrlsStatus(False)
            scrapPagination(None)
        elif sys.argv[1] == "scrapDeleted":
            scrapDeleted()
        elif sys.argv[1] == "data":
            getData()
            
    db.disconnect()
    
 

"""
all function created are : 
===>
    def loadFile(file)
    def updateFile(file, data)
    def saveProducts(products)
    def getTotalPages(e)
    def getAllProducts(e)
    def getAllPaginationsUrls(url, totalPaginationUrls)
    def setUrlSuccess(url)
    def updateUrlsStatus(stat)
    def loadCategoriesUrlsToScrap()
    def extractProductData(prod, categoryUrl, index)
    def printStatsOfDB()
    def myGet(url)
    def scrapMainCategories()
    def scrapPagination(urls)
===>
"""

