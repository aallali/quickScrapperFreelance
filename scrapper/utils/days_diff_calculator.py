
from datetime import datetime

def days_between(d1, d2):
    d2 = d2 or  str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    d1 = datetime.strptime(d1, "%Y-%m-%d %H:%M:%S")
    d2 = datetime.strptime(d2, "%Y-%m-%d %H:%M:%S") 
       
    return abs((d2 - d1).days)
   