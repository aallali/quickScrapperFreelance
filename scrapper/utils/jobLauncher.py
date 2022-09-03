from libraries import TargetWebsite
from config import websitesList
import signal
import sys
import time

targetInst = {}

class ExitHandler:
    def __init__(self):
        pass
    def __call__(self, signo, frame):
        global targetInst
        print("\nShutdown ..., please wait")
        targetInst.shutdown()

        while targetInst.isRunning():
            time.sleep(1)
    
        print("BYE!")
        sys.exit()

   
        
def launchJob(options):
    global targetInst
    signal.signal(signal.SIGINT, ExitHandler())

    if options['targetWeb'] == "all":
        for store in websitesList:
            targetInst = TargetWebsite(store)
            if options['scrapingType'] == "categories":
                targetInst.scrapCategories()
            if options['scrapingType'] == "pages":
                targetInst.scrapAllPages()
    else:
        targetInst = TargetWebsite(options['targetWeb'])
        if options['scrapingType'] == "categories":
            targetInst.scrapCategories()
        if options['scrapingType'] == "pages":
            targetInst.scrapAllPages()
            
            