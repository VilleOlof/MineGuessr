# 90gQGuessr

> Like GeoGuessr but for Minecraft.

**Play it here: [90gqguessr.se](https://90gqguessr.se)**

Guess the Minecraft ingame location based off a 360 panorama view and use the map to guess the location.  
This site should be pretty modular and easy to setup for other worlds, assuming the design is changed.  

## TODO BEFORE VID
[X] - Multiplayer Finish State  
[X] - Multiplayer Error State  
[X] - Multiplayer Aborted State  
[ ] - Multiplayer Homepage  
[X] - Move places dropdown to gitignored metadata file  
[ ] - Convert EVERYTHING to english  
[ ] - Rebrand site to non 90gq  
[ ] - More and better documentation for setup etc, VitePress?  
[ ] - Setup on alternative test domains and test with friends  

## TODO
[ ] - achivements?  
[/] - database panel with auth for checking db data  
[ ] - better mobile for /panel  
[ ] - More Panorama screenshots  
[ ] - Leaderboards for each daily  
[ ] - Profile
[ ] - Duels  
[LATER] - Make games server-sided  

# Setup & Start


### **Website**
```bash
# This is to install npm packages for the website itself
npm run install
npx prisma db push # Push the database schema to the db
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

# For discord auth
DISCORD_CLIENT_ID = ""
DISCORD_CLIENT_SECRET = ""
DISCORD_REDIRECT_URL = ""
```

#### **userLabel.json**
Located in `./src/lib/server/`, this file contains all the custom user labels.  
These are *currently* just handed out manually through `/panel` and are used to identify special users.  

These labels are *currently* just shown in the `/top` page.  

```json
{
  "label_name": "hex_color", // Structure
  "cool_dev": "#ff0000",     // Example
}
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

#### **Places Metadata**

Sometimes you might want to have a view preset locations to choose from.  
(Specially if it's a big world!)  

This can be achieved by having a `places.json` file located in `./src/lib/server/`  

```json
{
  "Main City": [10, -42],
  "Far away place": [-1251, 14011]
}
```

The key is the name of the place and the value is an array of `x` and `z` coordinates.  

#### **Panorama Screenshots**

The site also needs screenshots for each location to show.  
Located at `./static/locations/`, each panorama view is one folder that has 6 screenshots.  
These 6 screenshots gets used like a skybox cubemap, and each folder name should be its panorama index.  
So the Location Metadata can find the correct panorama and display it.  

These screenshots can be taken ingame with mods like *[Panoramica](https://modrinth.com/mod/panoramica)*  
Screenshots should also be taken with minimal resourcepacks and effects.   
Theres a resourcepack in the repo called `no-effect-icons` that removes all status effect icons.  

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
map_url = "https://example-bluemapsite.com"
port = 40401 # Be sure this matches the PUBLIC_MAP_URL in the .env file
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


