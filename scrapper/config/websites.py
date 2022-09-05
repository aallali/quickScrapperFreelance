
from presets import sephora_fr
from presets import nocibe_fr
websitesInstances = {
    'sephora_fr' : sephora_fr.Website(),
    'nocibe_fr' : nocibe_fr.Website()
}


websitesList = list(websitesInstances.keys())