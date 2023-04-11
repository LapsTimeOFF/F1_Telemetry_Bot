import sys

import fastf1 as ff1
import numpy as np
import pandas as pd
from fastf1 import plotting
from matplotlib import pyplot as plt
from matplotlib.collections import LineCollection
from matplotlib.colors import ListedColormap

# Enable the cache
# Argument is the name of the folder
ff1.Cache.enable_cache('src/commands/plots/python/cache')

# Enable plotting settings
ff1.plotting.setup_mpl()  # type: ignore

print(sys.argv)

# Choose the session
Year = int(sys.argv[0+1])
GP = sys.argv[1+1]
Session = sys.argv[2+1]

session = ff1.get_session(Year, GP, Session)

# Download the data
session.load()

driver_1, driver_2, driver_3, driver_4 = sys.argv[3 +
                                                  1], sys.argv[4+1], sys.argv[5+1], sys.argv[6+1]

laps_driver_1 = session.laps.pick_driver(driver_1)
laps_driver_2 = session.laps.pick_driver(driver_2)
laps_driver_3 = session.laps.pick_driver(driver_3)
laps_driver_4 = session.laps.pick_driver(driver_4)

lap = sys.argv[11+1]

if lap == 'Fastest':
    lap_driver_1 = laps_driver_1.pick_fastest()
    lap_driver_2 = laps_driver_2.pick_fastest()
    lap_driver_3 = laps_driver_3.pick_fastest()
    lap_driver_4 = laps_driver_4.pick_fastest()
else:
    lap = int(sys.argv[11+1])
    lap_driver_1 = laps_driver_1[laps_driver_1['LapNumber'] == lap].iloc[0]
    lap_driver_2 = laps_driver_2[laps_driver_2['LapNumber'] == lap].iloc[0]
    lap_driver_3 = laps_driver_3[laps_driver_3['LapNumber'] == lap].iloc[0]
    lap_driver_4 = laps_driver_4[laps_driver_4['LapNumber'] == lap].iloc[0]

telemetry_driver_1 = lap_driver_1.get_telemetry()
telemetry_driver_2 = lap_driver_2.get_telemetry()
telemetry_driver_3 = lap_driver_3.get_telemetry()
telemetry_driver_4 = lap_driver_4.get_telemetry()

# Delta time
# delta_time, ref_tel, compare_tel = ff1.utils.delta_time(lap_driver_1, lap_driver_2)   # type: ignore

# Identify team color
team_driver_1 = laps_driver_1['Team'].iloc[0]
team_driver_2 = laps_driver_2['Team'].iloc[0]
team_driver_3 = laps_driver_3['Team'].iloc[0]
team_driver_4 = laps_driver_4['Team'].iloc[0]

try:
    color_1 = sys.argv[7+1]
    if sys.argv[7+1] == "default":
        color_1 = ff1.plotting.team_color(team_driver_1)
except:
    color_1 = ff1.plotting.team_color(team_driver_1)

try:
    color_2 = sys.argv[8+1]
    if sys.argv[8+1] == "default":
        color_2 = ff1.plotting.team_color(team_driver_2)
except:
    color_2 = ff1.plotting.team_color(team_driver_2)  # type: ignore

try:
    color_3 = sys.argv[9+1]
    if sys.argv[9+1] == "default":
        color_3 = ff1.plotting.team_color(team_driver_3)
except:
    color_3 = ff1.plotting.team_color(team_driver_3)  # type: ignore

try:
    color_4 = sys.argv[10+1]
    if sys.argv[10+1] == "default":
        color_4 = ff1.plotting.team_color(team_driver_4)
except:
    color_4 = ff1.plotting.team_color(team_driver_4)  # type: ignore


# Set the size of the plot
plt.rcParams['figure.figsize'] = [20, 15]

# 7 plots
# - Delta
# - Speed
# - Throttle
# - Braking
# - Gear
# - RPM
# - DRS
fig, ax = plt.subplots(7, gridspec_kw={'height_ratios': [1, 3, 2, 1, 1, 2, 1]})

drs_Driver1 = []
drs_Driver2 = []
drs_Driver3 = []
drs_Driver4 = []


# Edit DRS data

# 0 = Disbled
# 1 = Not Eligible
# 2 = Eligible
# 3 = Enabled

for drs_Item in telemetry_driver_1['DRS']:
    if drs_Item == 8:
        drs_Driver1.append(2)
    else:
        if drs_Item < 8:
            drs_Driver1.append(0)
        else:
            if drs_Item % 2 == 0:
                drs_Driver1.append(3)
            else:
                drs_Driver1.append(1)

for drs_Item in telemetry_driver_2['DRS']:
    if drs_Item == 8:
        drs_Driver2.append(2)
    else:
        if drs_Item < 8:
            drs_Driver2.append(0)
        else:
            if drs_Item % 2 == 0:
                drs_Driver2.append(3)
            else:
                drs_Driver2.append(1)

for drs_Item in telemetry_driver_3['DRS']:
    if drs_Item == 8:
        drs_Driver3.append(2)
    else:
        if drs_Item < 8:
            drs_Driver3.append(0)
        else:
            if drs_Item % 2 == 0:
                drs_Driver3.append(3)
            else:
                drs_Driver3.append(1)

for drs_Item in telemetry_driver_4['DRS']:
    if drs_Item == 8:
        drs_Driver4.append(2)
    else:
        if drs_Item < 8:
            drs_Driver4.append(0)
        else:
            if drs_Item % 2 == 0:
                drs_Driver4.append(3)
            else:
                drs_Driver4.append(1)

# Set the title of the plot
ax[0].title.set_text(
    f"Telemetry comparison {driver_1} vs. {driver_2} vs. {driver_3} vs. {driver_4} - {GP} {Year} {Session}")  # type: ignore

# Subplot 2: Speed
ax[1].plot(telemetry_driver_1['Distance'],
           telemetry_driver_1['Speed'], label=driver_1, color=color_1)
ax[1].plot(telemetry_driver_2['Distance'],
           telemetry_driver_2['Speed'], label=driver_2, color=color_2)
ax[1].plot(telemetry_driver_3['Distance'],
           telemetry_driver_3['Speed'], label=driver_3, color=color_3)
ax[1].plot(telemetry_driver_4['Distance'],
           telemetry_driver_4['Speed'], label=driver_4, color=color_4)
ax[1].set(ylabel="Speed")
# ax[1].legend(loc="lower left")

# Subplot 3: Throttle
ax[2].plot(telemetry_driver_1['Distance'],
           telemetry_driver_1['Throttle'], label=driver_1, color=color_1)
ax[2].plot(telemetry_driver_2['Distance'],
           telemetry_driver_2['Throttle'], label=driver_2, color=color_2)
ax[2].plot(telemetry_driver_3['Distance'],
           telemetry_driver_3['Throttle'], label=driver_3, color=color_3)
ax[2].plot(telemetry_driver_4['Distance'],
           telemetry_driver_4['Throttle'], label=driver_4, color=color_4)
ax[2].set(ylabel="Throttle")
# ax[2].legend(loc="lower left")

# Subplot 4: Braking
ax[3].plot(telemetry_driver_1['Distance'],
           telemetry_driver_1['Brake'], label=driver_1, color=color_1)
ax[3].plot(telemetry_driver_2['Distance'],
           telemetry_driver_2['Brake'], label=driver_2, color=color_2)
ax[3].plot(telemetry_driver_3['Distance'],
           telemetry_driver_3['Brake'], label=driver_3, color=color_3)
ax[3].plot(telemetry_driver_4['Distance'],
           telemetry_driver_4['Brake'], label=driver_4, color=color_4)
ax[3].set(ylabel="Braking")
# ax[3].legend(loc="lower left")

# Subplot 5: Gear
ax[4].plot(telemetry_driver_1['Distance'],
           telemetry_driver_1['nGear'], label=driver_1, color=color_1)
ax[4].plot(telemetry_driver_2['Distance'],
           telemetry_driver_2['nGear'], label=driver_2, color=color_2)
ax[4].plot(telemetry_driver_3['Distance'],
           telemetry_driver_3['nGear'], label=driver_3, color=color_3)
ax[4].plot(telemetry_driver_4['Distance'],
           telemetry_driver_4['nGear'], label=driver_4, color=color_4)
ax[4].set(ylabel="Gear")
# ax[4].legend(loc="lower left")

# Subplot 6: RPM
ax[5].plot(telemetry_driver_1['Distance'],
           telemetry_driver_1['RPM'], label=driver_1, color=color_1)
ax[5].plot(telemetry_driver_2['Distance'],
           telemetry_driver_2['RPM'], label=driver_2, color=color_2)
ax[5].plot(telemetry_driver_3['Distance'],
           telemetry_driver_3['RPM'], label=driver_3, color=color_3)
ax[5].plot(telemetry_driver_4['Distance'],
           telemetry_driver_4['RPM'], label=driver_4, color=color_4)
ax[5].set(ylabel="RPM")
# ax[5].legend(loc="lower left")

# Subplot 6: DRS
ax[6].plot(telemetry_driver_1['Distance'],
           drs_Driver1, label=driver_1, color=color_1)
ax[6].plot(telemetry_driver_2['Distance'],
           drs_Driver2, label=driver_2, color=color_2)
ax[6].plot(telemetry_driver_3['Distance'],
           drs_Driver3, label=driver_3, color=color_3)
ax[6].plot(telemetry_driver_4['Distance'],
           drs_Driver4, label=driver_4, color=color_4)
ax[6].set(ylabel="DRS",
          xlabel='F1 Telemetry Discord Bot - Developed by LapsTime, Flip and Walshaw')
ax[6].set(ylabel="DRS")
ax[6].axhline(3)
ax[6].legend(loc="lower left")

plt.savefig('src/commands/plots/python/Figure.png')
