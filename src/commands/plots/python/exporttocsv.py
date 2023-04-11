import numpy as np
import pandas as pd
import fastf1 as ff1

from sys import argv

# Enable the cache
ff1.Cache.enable_cache('src/commands/plots/python/cache') 

# Load the session data
year = int(argv[1])
gp = argv[2]
session = argv[3]

quali = ff1.get_session(year, gp, session)

# Get the laps
laps = quali.load_laps(with_telemetry=True)

driver = argv[4]
laps_driver = laps.pick_driver(driver)

lapN = int(argv[5])
lap = laps_driver[laps_driver['LapNumber'] == lapN].iloc[0]

telemetry = lap.get_telemetry()
telemetry.to_csv(f'src/commands/plots/python/{year}_{gp}_{session}_{driver}_Lap{lapN}.csv')
