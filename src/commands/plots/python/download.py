import fastf1 as ff1
import sys
# Enable the cache
ff1.Cache.enable_cache('src/commands/plots/python/cache') # Argument is the name of the folder
# Choose the session
Year = int(sys.argv[0+1])
GP = sys.argv[1+1]
Session = sys.argv[2+1]

session = ff1.get_session(Year, GP, Session)

session.load()