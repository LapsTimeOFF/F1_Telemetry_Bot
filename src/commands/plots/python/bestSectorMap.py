import fastf1 as ff1
import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from fastf1 import plotting
from matplotlib.colors import ListedColormap
from matplotlib.collections import LineCollection

import sys

ff1.Cache.enable_cache('src/commands/plots/python/cache')

Year = int(sys.argv[1])
GP = sys.argv[2]
Session = sys.argv[3]

session = ff1.get_session(Year, GP, Session)
session.load()

ff1.plotting.setup_mpl()  # type: ignore

driver_1, driver_2 = sys.argv[4], sys.argv[5]

laps_driver_1 = session.laps.pick_driver(driver_1)
laps_driver_2 = session.laps.pick_driver(driver_2)

lap = sys.argv[6]

if lap == 'Fastest':
    lap_driver_1 = laps_driver_1.pick_fastest()
    lap_driver_2 = laps_driver_2.pick_fastest()
else:
    lap = int(sys.argv[6])
    lap_driver_1 = laps_driver_1[laps_driver_1['LapNumber'] == lap].iloc[0]
    lap_driver_2 = laps_driver_2[laps_driver_2['LapNumber'] == lap].iloc[0]

telemetry_driver_1 = lap_driver_1.get_telemetry()
telemetry_driver_2 = lap_driver_2.get_telemetry()

# Delta time between both drivers

delta_time, ref_tel, compare_tel = ff1.utils.delta_time(lap_driver_1, lap_driver_2)  # type: ignore

team_driver_1 = laps_driver_1['Team'].iloc[0]
team_driver_2 = laps_driver_2['Team'].iloc[0]

color_1 = ff1.plotting.team_color(team_driver_1)  # type: ignore
if team_driver_1 != team_driver_2:
    color_2 = ff1.plotting.team_color(team_driver_2)  # type: ignore
else:
    if team_driver_1 == 'Ferrari':
        color_2 = ff1.plotting.team_color('Mercedes')  # type: ignore
    else:
        color_2 = ff1.plotting.team_color('Ferrari')  # type: ignore

# merge the telemetry from both drivers
telemetry_driver_1['Driver'] = driver_1
telemetry_driver_2['Driver'] = driver_2

telemetry = pd.concat([telemetry_driver_1, telemetry_driver_2])

# calculate the minisectors
num_minisectors = 100
total_distance = max(telemetry['Distance'])

minisector_length = total_distance / num_minisectors

minisectors = [0]

for mini in range (0, (num_minisectors -1)):
    minisectors.append(minisector_length * (mini +1))
    
# minisectors

# Assign a minisector number to every row of the telemetry data
telemetry['Minisector'] = telemetry['Distance'].apply(
    lambda dist: (
        int((dist // minisector_length) + 1)
    )
)

# Calculate minisector speeds per driver
average_speed = telemetry.groupby(['Minisector', 'Driver'])['Speed'].mean().reset_index()
# average_speed

# Per minisector, find the fastest driver
fastest_driver = average_speed.loc[average_speed.groupby(['Minisector'])['Speed'].idxmax()]   # type: ignore
fastest_driver = fastest_driver[['Minisector', 'Driver']].rename(columns={'Driver': 'Fastest_driver'})
# fastest_driver

# merge the fastest_driver dataframe to the telemetry dataframe on minisector
telemetry = telemetry.merge(fastest_driver, on=['Minisector'])
telemetry = telemetry.sort_values(by=['Distance'])

#Since our plot can only work with integers, we need to convert the driver abbreviations to integers (1 or 2)
telemetry.loc[telemetry['Fastest_driver'] == driver_1, 'lap_driver_int'] = 1
telemetry.loc[telemetry['Fastest_driver'] == driver_2, 'lap_driver_int'] = 2

# get the x and y coordinates
x = np.array(telemetry['X'].values)
y = np.array(telemetry['Y'].values)

# Convert the coordinates to points, and then concat them into segments
points = np.array([x, y]).T.reshape(-1, 1, 2)
segments = np.concatenate([points[:-1], points[1:]], axis=1)
lap_driver_array = telemetry['lap_driver_int'].to_numpy().astype(float)

# the segments we just created can now be colored according to the fastest driver in a minisector
cmap = ListedColormap([color_1, color_2])  # type: ignore
lc_comp = LineCollection(segments, norm=plt.Normalize(1, cmap.N+1), cmap=cmap)  # type: ignore
lc_comp.set_array(lap_driver_array)
lc_comp.set_linewidth(10)

# Create the plot
# plt.title(f"Fastest micro sector comparison Telemetry comparison {driver_1} vs. {driver_2} - {GP} {Year} {Session}")

plt.title(f'F1 Telemetry Discord Bot - Developed by LapsTime, Flip and Walshaw\nFastest micro sector comparison {driver_1} vs. {driver_2} - {GP} {Year} {Session}', {'fontsize': 7.5})  # type: ignore
# plt.suptitle(f'F1 Telemetry Discord Bot - Developed by LapsTime, Flip and Walshaw\nFastest micro sector comparison {driver_1} vs. {driver_2} - {GP} {Year} {Session}', size=7.5, y=1)
plt.rcParams['figure.figsize'] = [30,20]
plt.gca().add_collection(lc_comp)
plt.axis('equal')
plt.box(False)
plt.tick_params(labelleft=False, left=False, labelbottom=False, bottom=False)

# add a colorbar as a legend
cbar = plt.colorbar(mappable=lc_comp, boundaries=np.arange(1,4))
#cbar.ax.set_yticklabels([driver_1, driver_2])
#cbar.set_ticks(1, 2)
cbar.set_ticklabels([driver_1, driver_2, ""])
plt.savefig('src/commands/plots/python/Figure.png')