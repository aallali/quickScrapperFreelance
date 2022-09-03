import json

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