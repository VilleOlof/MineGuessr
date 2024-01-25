# 90gQGuessr

> Like GeoGuessr but for Minecraft.

Guess the Minecraft ingame location based off a 360 panorama view and use the map to guess the location.  

## TODO
[ ] - achivements?  
[/] - database panel with auth for checking db data  
[ ] - better mobile for /panel  
[ ] - Make games server-sided  
[ ] - Daily mode (server-sided date)  
[ ] - More Panorama screenshots  

# Setup & Start


### **Website**
```bash
# This is to install npm packages for the website itself
npm run install
```

```bash
# Run the website in dev mode
npm run dev
```
```bash
# Run the website in production
npm run build
node -r dotenv/config build
```

#### **.env**

```sh
DATABASE_URL = "file:./db.sqlite" # Local sqlite db
PUBLIC_MAP_URL = "http://127.0.0.1:40401" # Url to Map Proxy
ORIGIN = "http://localhost:5173" # Self
PUBLIC_ORIGIN = "http://localhost:5173" # Self
PORT = 40400 # Just for production
PANEL_PASSWORD = "password123" # For the /panel page

# For discord auth
DISCORD_CLIENT_ID = ""
DISCORD_CLIENT_SECRET = ""
DISCORD_REDIRECT_URL = ""
```

#### **Location Metadata**

For the site to know what locations exist and their coords/panorama index.  
It needs a `loc_metadata.json` file located in `./src/lib/server/`  

It should look something like this, an array of objects that have the fields `id`, `coordinates`.  
And `coordinates` is just an array of first `x` and then `z`.  

```json
[
  {
    "id": 0,
    "coordinates": [
      102562,
      -32164
    ]
  },
  {
    "id": 1,
    "coordinates": [
      102522,
      -32328
    ]
  },
]
```

#### **Panorama Screenshots**

The site also needs screenshots for each location to show.  
Located at `./static/locations/`, each panorama view is one folder that has 6 screenshots.  
These 6 screenshots gets used like a skybox cubemap, and each folder name should be its panorama index.  
So the Location Metadata can find the correct panorama and display it.  

These screenshots can be taken ingame with mods like *[Panoramica](https://modrinth.com/mod/panoramica)*  
Screenshots should also be taken with minimal resourcepacks and effects.   

### **Map Proxy**
> [!IMPORTANT]  
> The Map Proxy needs to be running for the websites map to work!

```bash
cd /map_proxy # Directory for the map proxy
cargo build --release # Build the binary

# Start it
./target/release/map_proxy.exe
```
The Map Proxy also needs a `Config.toml` file with the following content:
```toml
map_url = "https://map.90gq.se"
port = 40401 # Be sure this matches ./src/lib/index.ts:5
redis_url = "redis://localhost:6379/"
cache_time = 3600 # How long caches stay valid in redis
```

*Do note that the map proxy needs a redis server to connect to*

### **Image Converter**
*This is only used in development to convert panorama pngs to webp*

```bash
cd /image_converter # Directory for the converter
cargo build --release # Build the binary

# Run it with an input and output arg
./target/release/image_converter.exe -i "./conversions/in" -o "/conversions/out"
```


