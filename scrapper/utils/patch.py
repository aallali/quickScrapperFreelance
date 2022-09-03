
import datetime
 
# initial fresh date of current time via the format : YYYY-mm-DD HH-MM-SS to be used as reference


def patchProduct(prodInDB, prod):
    nowDate = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    prod['categoryUrl'] = [prod['categoryUrl']]
    prod['listUrl'] = [prod['listUrl']]
    
    if prodInDB:
        if prod['price'] != prodInDB['price']:
            prodInDB['oldPrice'] = prodInDB['price']
            prodInDB['price'] = prod['price']
            prodInDB['statu'] = 'changed'
        else:
            prodInDB['statu'] = 'stable'
            
        prodInDB['id'] = prod['id']
        prodInDB['brand'] = prod['brand']
        prodInDB['name'] = prod['name']
        prodInDB['brand'] = prod['brand']
        prodInDB['image'] = prod['image']
        prodInDB['url'] = prod['url']
        prodInDB['categoryUrl'] = list(set(prod['categoryUrl'] + prodInDB['categoryUrl'] ))
        prodInDB['listUrl'] = list(set(prod['listUrl'] + prodInDB['listUrl'] ))
        prodInDB['updated_at'] = nowDate
        return prodInDB
    else:
        prod['statu'] = 'new'
        prod['created_at'] = nowDate
        prod['updated_at'] = nowDate
        return prod