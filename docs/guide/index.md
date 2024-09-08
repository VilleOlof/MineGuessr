# Setup Guide

This will hopefully, guide you through setting up MineGuessr on your own world.

## **Prerequisites**

The following are required to run MineGuessr:
- [BlueMap](https://bluemap.bluecolored.de/) (V3.x+) installed on your Minecraft server
- [Bun](https://bun.sh/) or ([NodeJS](https://nodejs.org/en/download) + [Bun](https://bun.sh/))
- **Experience with the command line and basic programming**

*A note on the bluemap version: I've only tested with V3 and V4. V5 should work, but I can't guarantee it.*

## **Setup**

First, clone the repository:
```bash
git clone https://github.com/VilleOlof/MineGuessr.git
cd MineGuessr
```

*Or download directly from [Github](https://github.com/VilleOlof/MineGuessr)*

And then we will go over the different parts of the project.  
And set them up one by one, starting with the Map Proxy.  

## **Map Proxy**

> [!TIP]
> But if you can change the CORS settings for your BlueMap Webserver, you can skip this step.  

If you can't change the CORS settings on your BlueMap server, you will need to run the Map Proxy.  
This is a small Rust program that acts as a middleman between the website and the BlueMap server.

You can download a linux binary from the [releases page](https://github.com/VilleOlof/MineGuessr/releases) on Github.

### **Configuration**

The Map Proxy needs a `Config.toml` when running.
```toml
# Config.toml
map_url = "https://bluecolored.de/bluemap" # URL to the BlueMap webserver
port = 40401 # Port the Map Proxy will run on

# Optional, enables caching of assets
redis_url = "redis://localhost:6379/"
cache_time = 3600 # Default: 3600 if not set
```
### **Running**

```bash
# Simply run the binary after setting up the config
./map_proxy
```

## **The Website**

The website is built with SvelteKit & Prisma.  

### **Configuration**

We start by installing the dependencies:
::: code-group

```bash [Bun]
bun install
```

```bash [NodeJS]
npm install
```

:::

The website then also needs 2 configuration files:
- `.env` for the environment variables
- `src/lib/server/loc_metadata.json` for the locations metadata

Optional:  
- `src/lib/server/places.json` for the places metadata
- `src/lib/server/userLabel.json` for user labels

These files don't exist by default and need to be created.

#### **.env**

```sh
# .env

DATABASE_URL = "file:./db.sqlite" # Local sqlite db

# Url to BlueMap Webserver
# Or, if you're running the Map Proxy, the URL to that
PUBLIC_MAP_URL = "http://127.0.0.1:40401"

# Public URL to the website
PUBLIC_ORIGIN = "http://localhost:5173" 

# Port the website will run on in production
PORT = 40400 

# Multiplayer options

# If no URL is set, multiplayer will be disabled
# Multiplayer also requires the `PUBLIC_DISCORD_ENABLED` to be set to true
PUBLIC_MP_URL = "localhost:40402" # Without http(s)://
# Optional, If the multiplayer client is in development mode
PUBLIC_MP_DEV = false 

# Discord OAuth2

# If set to nothing or false, Discord OAuth2 will be disabled
PUBLIC_DISCORD_ENABLED = true

DISCORD_CLIENT_ID = ""
DISCORD_CLIENT_SECRET = ""

# This should be the same as `PUBLIC_ORIGIN` + `/discord`
DISCORD_REDIRECT_URL = ""

# Required for users "Avatar" to be shown
# This is found under "Bot" for your application
DISCORD_BOT_TOKEN = ""

# Name of the world, will be shown in the main menu
PUBLIC_WORLD_NAME = "World Name"
```

#### **loc_metadata.json**

This file contains all the locations that the website can choose from.  
Add entries to this file to add more locations to the website.

```json
# src/lib/server/loc_metadata.json

[
    {
        // The panorama folder 'name' index
        "id": 0,
        // The coordinates of the location (x, z)
        "coordinates": [
            102562,
            -32164
        ]
    },
    {
        "id": 1,
        "coordinates": [
            102562,
            -32164
        ]
    }
    // ...
]
```

> [!CAUTION]
> This file alone isn't enough to add a location to the website.  
> We'll talk more about adding locations in the next section.

Then we'll setup the database:
::: code-group

```bash [Bun]
bunx prisma db push
```

```bash [NodeJS]
npx prisma db push
```

:::

> [!NOTE]
> This is a locally ran SQLite Database

### **Building and Running**

::: code-group

```bash [Bun]
# Build
bun run build
# Start the website
bun -r dotenv/config ./build
```

```bash [NodeJS]
# Build 
npm run build
# Start the website
node -r dotenv/config ./build
```

:::

## **Adding Locations**

Adding locations to the website is a manual process.  

When adding a location, you need to:
- Add the location to `loc_metadata.json`, with the correct coordinates
- Add the panorama images to a `/static/locations/[index]` folder

### Panorama Images

To take easy panorama screenshots directly in Minecraft,  
you can use any mod, like [Panoramica](https://modrinth.com/mod/panoramica)  
*To fully hide the effect icons, you can use the resourcepack `no-effect-icons` in the repo.*

These will be outputted as 6 images, one for each side of the cube.  
But normally these are in formats like `.png` or `.jpg`, and need to be converted to `.webp`.  

### Image Converter

Luckily, this repo contains a little Rust program to convert them automatically.  

You can find prebuilt binaries for Windows & Linux in the [releases page](https://github.com/VilleOlof/MineGuessr/releases)
```bash
./image_converter.exe -i "path/to/panorama_folders" -o "path/to/output_folder"
```

You can optionally, pass a `-s` flag to specify a starting index for the panoramas.

Now you just need to move the outputted folders to `/static/locations`.

### Metadata

And as mentioned earlier, you need to add the location to `loc_metadata.json`.  
With the id being the name of the folder in `/static/locations`, and the coordinates of the location.  

## **Multiplayer Server**

> [!NOTE]
>This is fully optional and doesn't impact the singeplayer aspect

The website needs a seperate server to handle multiplayer games.  

### **Configuration**

The server needs a `.env` file with the following content:
```sh
PORT = 40402 # Port the server will run on

# This should point to the same database as the website
DB = "../prisma/db.sqlite"

# Development, optional
DEV = false # If the server is in development mode
TEST_AUTH_TOKEN = "test" # Token for testing purposes, instead of Discord OAuth2
DISABLE_GAME_IDLE = false # If a lobby should be closed after a certain time
```

### **Running**

This must be ran with Bun, since it's in Typescript, and uses the Bun API.

```bash
# Start the server
bun run start
```

## **Discord OAuth2**

The website uses Discord OAuth2 for user authentication.  
You can find your `CLIENT_ID` & `CLIENT_SECRET` in your [Discord Application](https://discord.com/developers/applications) under `OAuth2`.  

For the `REDIRECT_URL`, you'll have to add `{PUBLIC_ORIGIN}/discord` to the OAuth2 Redirects.  

Discord OAuth2 is optional and enables multiplayer & leaderboards on the website.

## **Optional Configs**

There is some optional configuration that can be done to the website.

```json
# src/lib/server/userLabel.json

{
  "label_name": "hex_color", // Structure
  "cool_dev": "#ff0000",     // Example
}
```
These are used to identify special users and are shown in the `/top` page.  

```json
# src/lib/server/places.json

{
  // Name, and coordinates (x, z)
  "Main City": [10, -42],
  "Far away place": [-1251, 14011]
}
```
If you have common places you want to add to the website, you can add them here.  
These will appear in a dropdown menu on the map when playing.  