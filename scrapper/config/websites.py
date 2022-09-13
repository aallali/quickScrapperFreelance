
from presets import sephora_fr
from presets import nocibe_fr
from presets import marionnaud_fr

websitesInstances = {
    'sephora_fr' : sephora_fr.Website(),
    'nocibe_fr' : nocibe_fr.Website(),
    'marionnaud_fr': marionnaud_fr.Website()
}


websitesList = list(websitesInstances.keys())