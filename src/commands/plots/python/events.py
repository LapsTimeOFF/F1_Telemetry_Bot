import fastf1 as ff1 # type: ignore
from fastf1 import plotting # type: ignore
from matplotlib import pyplot as plt # type: ignore
import pandas as pd # type: ignore
import numpy as np # type: ignore
import sys
from datetime import datetime
import pytz # type: ignore

# Enable the cache
ff1.Cache.enable_cache('src/commands/plots/python/cache') 

events = ff1.get_event_schedule(int(sys.argv[1]))

def first(num,s):
    return s[:num]

for event in range(0, 24):
# for event in len(events):
    weType = 'Unknown week-end type.'
    if events['EventFormat'][event] == 'conventional':
        weType = 'Classic GP'
    if events['EventFormat'][event] == 'sprint':
        weType = 'Sprint GP'
    if events['EventFormat'][event] == 'testing':
        weType = 'Pre-Season Test'


    passed = '+ [TO COME]'
    if datetime.now() > events['EventDate'][event]:
        passed = '- [COMPLETE]'
        
    print(f'{passed}', events['Country'][event],'|', events['OfficialEventName'][event],'|', weType) #,'|', events['EventDate'][event])