from lxml import etree
from io import StringIO
import requests
import time
import re
import math
import json
import datetime


# initial fresh date of current time via the format : YYYY-mm-DD HH-MM-SS to be used as reference
todayDate = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

# Set explicit HTMLParser
parser = etree.HTMLParser()


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
    db = loadFile("products.json")
    
    # loop through products scrapped
    for product in products:
        found = False
        # loop through products already stored in db and check if products exists via id+sourceCaregoryUrl
        # we check the 'sourceCaregoryUrl' also because there is some products listed in two different categories  
        # in other word : same products listed in two diefferent categories or more
        for p in db:
            if p['id'] == product['id'] and p['sourceCaregoryUrl'] == product['sourceCaregoryUrl']:
                # print(p['id'] ,product['id'])
                if p['price']['price'] != product['price']['price']:
                    p['price']['price'] = product['price']['price']
                    p['statu'] = "changed"
                else:
                    p['statu'] = "stable"
                    
                p['price']['date'] = product['price']['date']
                found = True
                break
        if not found:
            product['statu'] = 'new'
            db.append(product)
    updateFile("products.json", db)
    
    
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
    return math.ceil(totalProductsNumber/28) #math ceil to take the upper number when there is  decimal eg: 5.64 => 6

def getAllProducts(e):
    """
    extract all products divs from the current page
    return list of products  as html dom
    """
    ul = e.xpath("//ul[@id='search-result-items']")
    li = ul[0].xpath("//li[contains(@class, 'grid-tile')]//div[contains(@class, 'product-tile') and @data-itemid and @data-tcproduct]")
    return li

def getAllPaginationsUrls(url, totalPaginationUrls):
    """
    from base url of category + number of pages in this category
    we build a list of pagination urls bases om the details given
    return array of strings
    """
    urls = []
    for i in range(totalPaginationUrls):
        urls.append(f"{url}?page={i+1}")
    
    # load all urls to be scrapped from urls.json 
    # try to merge the data stored with new one to avoid duplication
    #
    #
    #
    #
    data = loadFile("urls.json")
 
    urlsSet = set(data)
    urlsSet.update(tuple(urls))
    allurls = list(urlsSet)
    allurls.sort()
    updateFile("urls.json", allurls)
    #
    #
    #
    #
    # the steps above are not necessary usefull for the moments since we just store data but dont use it for scraping
    # but i stored them in file so in case we needed that in future, ill have the base structure ready
    return urls

def loadCategoriesUrlsToScrap():
    
    """
    all the cateogories urls (not paginations !!!) in this file will be fetched and 
    scrapped from page 1 to page final
    """
    return loadFile("categories.json")

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
        'image' : '',  #done
        'url' : '',
        'price' :   #done
            {
                'date': '',  #done
                'price': 0  #done
            },
        'index': index,  #done
        'statu': 'new|deleted|changed|stable', 
        'sourceCaregoryUrl': categoryUrl  #done
    }
    
    # i reload the single product html into etree again
    # so i root got reset to that single product and not whole html page
    prod = etree.parse(StringIO(etree.tostring(prod).decode()), parser=parser)
    # extract id from the 'data-product-id' tag existing in div tag
    data['id'] = prod.xpath("//div[@data-product-id]")[0].get('data-product-id')

    # extract the namee/url from 'a' tag 
    href = prod.xpath("//a[@data-name and @title]")[0]
    data['name'] = href.get('title')
    data['url'] = href.get('href')
    
    # get the image url and remove the params from url to get best quality image
    img = prod.xpath("//img[contains(@class, 'product-first-img')]")[0]
    data['image'] = (img.get("data-src") or img.get("src")).split("?")[0]

    # set the time of this scrapping which is declared globally every time the script executed
    data['price']['date'] = todayDate 
    
    # extract price from html as text and trim spaces
    price = prod.xpath("//div[@class='product-pricing']//span")[0].text.strip()
    data['price']['price'] =  price

    return data

def checkMissingProducts():
    """
    load all products saved in local file and compare each date of price of them with today date 
    if there is difference (we compare YYYY-MM-DD) we consider the produdct as missing 
    then switch its statu
    """
    db = loadFile("products.json")
    
    for p in db:
        if p['price']['date'].split(" ")[0] < todayDate.split(" ")[0]:
            p['statu'] = 'deleted'
    updateFile("products.json", db)
    
    
def myGet(url):
    """
    costum function that initiat a GET request with costum USER-AGENT header (without it the website block the requests)
    then load the response into etree html parser
    return tree of html dom
    TODO: make the user agent random from list of user agents will be gived hardcoded
    """
    r = requests.get(url ,headers={
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0'
            }, timeout=10)
    html = r.content.decode("utf-8")
    tree = etree.parse(StringIO(html), parser=parser)
    return tree

def scrappe():
    """
    the scrappe function which is the main function here 
    all code wrapped inside while not sucess so it keeps retrying when there is error
    TODO : re-work this part to handle the error correctly
    1 - get categories urls from 'categories.json' 
            via loadCategoriesUrlsToScrap() function
            
    2 - fetch each one of them and collect the paginations urls 
            via getTotalPages() + getAllPaginationsUrls()
            
    3 - fetch each one of the pagination urls and collect all products data listed there 
            via myGet() + getAllProducts() + extractProductData
            
    4 - store the products into the database
            via saveProducts()
        
    * there is a waiting time of 1 second between each request
    """
    sucess = False
    while not sucess:
        s=time.time()
        try:
            print("try")
            # load categories to be scrapped
            categoriesUrls = loadCategoriesUrlsToScrap()

            # loop through the categories urls
            for cat in categoriesUrls:
                print(cat)
                # fetch the category and get the html
                tree = myGet(cat)
                
                print(f"Total Pages : {getTotalPages(tree)}")
                
                # generate list of all paginations urls
                paginations = getAllPaginationsUrls(cat,getTotalPages(tree))
            
                # loop through the paginations
                for (i,page) in enumerate(paginations):
                    
                    # fetch the page and return html
                    tree =  myGet(page)
                    
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
                    time.sleep(1)
            
            sucess = True
        except requests.exceptions.Timeout as err: 
            print(err) 
            # sleep some sec/min and retry here!

        
        print ('Time taken to execute the code - ' + str((time.time()-s)/60) + ' Minuten')

        time.sleep(2)
    # Example call
    

         
print("Start scraping ...")   
scrappe()


print("Check deleted products if any ...")
checkMissingProducts()
print("#DONE")


print(f"total of products scrapped : {len(loadFile('products.json'))})")



"""
all function created are : 
===>
    def loadFile(file)
    def updateFile(file, data)
    def saveProducts(products)
    def getTotalPages(e)
    def getAllProducts(e)
    def getAllPaginationsUrls(url, totalPaginationUrls)
    def loadCategoriesUrlsToScrap()
    def extractProductData(prod, categoryUrl, index)
    def checkMissingProducts()
    def myGet(url)
    def scrappe()
===>
"""