import fastf1 as ff1
from fastf1 import plotting
from matplotlib import pyplot as plt
import sys

from requests import session

plotting.setup_mpl()

# Enable the cache
ff1.Cache.enable_cache('src/commands/plots/python/cache') # Argument is the name of the folder

Year = int(sys.argv[1])
GP = sys.argv[2]
Session = sys.argv[3]

Driver1 = sys.argv[4]
Driver2 = sys.argv[5]

session = ff1.get_session(Year, GP, Session)
session.load()

Driver1_laps = session.laps.pick_driver(Driver1)
Driver2_laps = session.laps.pick_driver(Driver2)

team_driver_1 = Driver1_laps['Team'].iloc[0]
team_driver_2 = Driver2_laps['Team'].iloc[0]

try:
    color_driver_1 = sys.argv[6]
    if sys.argv[6] == "default":
        color_driver_1 = ff1.plotting.team_color(team_driver_1)
except:
    color_driver_1 = ff1.plotting.team_color(team_driver_1)

try:
    color_driver_2 = sys.argv[7]
    if sys.argv[7] == "default":
        color_driver_2 = ff1.plotting.team_color(team_driver_2)
except:
    color_driver_2 = ff1.plotting.team_color(team_driver_2)


fig, ax = plt.subplots()
ax.plot(Driver1_laps['LapNumber'], Driver1_laps['LapTime'], label=Driver1, color=color_driver_1) # type: ignore
ax.plot(Driver2_laps['LapNumber'], Driver2_laps['LapTime'], label=Driver2, color=color_driver_2) # type: ignore
ax.set_title(f"Lap times comparison {Driver1} vs. {Driver2} - {GP} {Year} {Session}", {'fontsize': 11})
ax.set_xlabel("Lap Number\nF1 Telemetry Discord Bot - Developed by LapsTime, Flip and Walshaw", {'fontsize': 7.5})
ax.set_ylabel("Lap Time")
ax.legend(loc="upper left")
plt.savefig('src/commands/plots/python/Figure.png')