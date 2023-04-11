import fastf1 as ff1
from fastf1 import plotting
from matplotlib import pyplot as plt
import pandas as pd
import numpy as np
from matplotlib.colors import ListedColormap
from matplotlib.collections import LineCollection
import sys

# Enable the cache
ff1.Cache.enable_cache('src/commands/plots/python/cache') # Argument is the name of the folder

# Enable plotting settings
ff1.plotting.setup_mpl()  # type: ignore 

print(sys.argv)

# Choose the session
Year1 = int(sys.argv[0+1])
GP = sys.argv[1+1]
Session1 = sys.argv[2+1]
Year2 = int(sys.argv[3+1])
Session2 = sys.argv[5+1]

session1 = ff1.get_session(Year1, GP, Session1)
session2 = ff1.get_session(Year2, GP, Session2)

# Download the data
session1.load()
session2.load()

driver_S1 = sys.argv[7+1]

laps_driver_S1 = session1.laps.pick_driver(driver_S1)
laps_driver_S2 = session2.laps.pick_driver(driver_S1)

lap = sys.argv[10]

lap_driver_S1 = ''
lap_driver_S2 = ''

if lap == 'Fastest':
    lap_driver_S1 = laps_driver_S1.pick_fastest()
    lap_driver_S2 = laps_driver_S2.pick_fastest()
else:
    lap = int(sys.argv[10+1])
    lap_driver_S1 = laps_driver_S1[laps_driver_S1['LapNumber'] == lap].iloc[0]
    lap_driver_S2 = laps_driver_S2[laps_driver_S2['LapNumber'] == lap].iloc[0]

telemetry_driver_S1 = lap_driver_S1.get_telemetry()
telemetry_driver_S2 = lap_driver_S2.get_telemetry()

# Delta time
delta_time, ref_tel, compare_tel = ff1.utils.delta_time(lap_driver_S1, lap_driver_S2)   # type: ignore 

# Identify team color
team_driver_S1 = laps_driver_S1['Team'].iloc[0]
team_driver_S2 = laps_driver_S2['Team'].iloc[0]

try:
    color_S1 = sys.argv[7+1]
    if sys.argv[7+1] == "default":
        color_S1 = ff1.plotting.team_color(team_driver_S1)
except:
    color_S1 = ff1.plotting.team_color(team_driver_S1)

try:
    color_S2 = sys.argv[8+1]
    if sys.argv[8+1] == "default":
        color_S2 = ff1.plotting.team_color(team_driver_S2)
except:
    color_S2 = ff1.plotting.team_color(team_driver_S2)  # type: ignore


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

drs_DriverS1 = [];
drs_DriverS2 = [];


# Edit DRS data

# 0 = Disbled
# 1 = Not Eligible
# 2 = Eligible
# 3 = Enabled

for drs_Item in telemetry_driver_S1['DRS']:
    if drs_Item == 8:
        drs_DriverS1.append(2)
    else:
        if drs_Item < 8:
            drs_DriverS1.append(0)
        else:
            if drs_Item % 2 == 0:
                drs_DriverS1.append(3)
            else:
                drs_DriverS1.append(1)

for drs_Item in telemetry_driver_S2['DRS']:
    if drs_Item == 8:
        drs_DriverS2.append(2)
    else:
        if drs_Item < 8:
            drs_DriverS2.append(0)
        else:
            if drs_Item % 2 == 0:
                drs_DriverS2.append(3)
            else:
                drs_DriverS2.append(1)

# Set the title of the plot
ax[0].title.set_text(f"Telemetry comparison {driver_S1} - {GP} - {Year1} {Session1} vs {Year2} {Session2} - Lap {lap}")  # type: ignore

# Subplot 1: The delta
ax[0].plot(ref_tel['Distance'], delta_time, color=color_S1)
ax[0].axhline(0)
ax[0].set(ylabel=f"Gap to {Session2} - {Year2} (s)")

# Subplot 2: Speed
ax[1].plot(telemetry_driver_S1['Distance'], telemetry_driver_S1['Speed'], label=Session1, color=color_S1)
ax[1].plot(telemetry_driver_S2['Distance'], telemetry_driver_S2['Speed'], label=Session2, color=color_S2)
ax[1].set(ylabel="Speed")

# Subplot 3: Throttle
ax[2].plot(telemetry_driver_S1['Distance'], telemetry_driver_S1['Throttle'], label=Session1, color=color_S1)
ax[2].plot(telemetry_driver_S2['Distance'], telemetry_driver_S2['Throttle'], label=Session2, color=color_S2)
ax[2].set(ylabel="Throttle")

# Subplot 4: Braking
ax[3].plot(telemetry_driver_S1['Distance'], telemetry_driver_S1['Brake'], label=Session1, color=color_S1)
ax[3].plot(telemetry_driver_S2['Distance'], telemetry_driver_S2['Brake'], label=Session2, color=color_S2)
ax[3].set(ylabel="Braking")

# Subplot 5: Gear
ax[4].plot(telemetry_driver_S1['Distance'], telemetry_driver_S1['nGear'], label=Session1, color=color_S1)
ax[4].plot(telemetry_driver_S2['Distance'], telemetry_driver_S2['nGear'], label=Session2, color=color_S2)
ax[4].set(ylabel="Gear")

# Subplot 6: RPM
ax[5].plot(telemetry_driver_S1['Distance'], telemetry_driver_S1['RPM'], label=Session1, color=color_S1)
ax[5].plot(telemetry_driver_S2['Distance'], telemetry_driver_S2['RPM'], label=Session2, color=color_S2)
ax[5].set(ylabel="RPM")

# Subplot 6: DRS
ax[6].plot(telemetry_driver_S1['Distance'], drs_DriverS1, label=f'{Session1} - {Year1}', color=color_S1)
ax[6].plot(telemetry_driver_S2['Distance'], drs_DriverS2, label=f'{Session2} - {Year2}', color=color_S2)
ax[6].set(ylabel="DRS", xlabel='F1 Telemetry Discord Bot - Developed by LapsTime, Flip and Walshaw')
ax[6].axhline(3)
ax[6].legend(loc="lower left")

plt.savefig('src/commands/plots/python/Figure.png')