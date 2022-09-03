 
import sys
from utils import parseArguments, showHelp,launchJob

   
            
if __name__ == "__main__":
    showHelp()
    options = parseArguments(sys.argv)
    if options:
        message = f"You choosed to scrap {options['scrapingType']} of {options['targetWeb']}"
        print(f"#####{'#' * (len(message) + 2)}#####")
        print(f"##### {message} #####")
        print(f"#####{'#' * (len(message) + 2)}#####")
        launchJob(options)
   
    