
from config import websitesList

arguments= dict({
    0: ["categories", "pages"],
    1: websitesList + ["all"]
})

def showHelp():
        print(
    f"""
_________________________________________________________________
HELP:
-----------------------------------------------------------------
    usage : [python] [main.py] [arg1] [arg2]
        arg1 options : {arguments[0]}
        arg2 options : {arguments[1]}
-----------------------------------------------------------------
    e.g   : - [python main.py categories sephora_fr]
                => will scrap categories of sephora.fr store
                    
            - [python main.py pages example_com]
                => will scrap paginations of example_com store
                    
            - [python main.py categories all]
                => will scrap categories of all stores in config
_________________________________________________________________
    """)
    

def parseArguments(argv):
    if len(argv) == 3:
        scrapingType = argv[1]
        targetWeb = argv[2]
        
        if scrapingType in arguments[0] and targetWeb in arguments[1]:
            return dict({
                'scrapingType' : scrapingType,
                'targetWeb' : targetWeb
            })
        else:
            print("Invalid arguments! (check help message)")
            return None
    else:
        print("Invalid arguments! (2 required)")
        return None