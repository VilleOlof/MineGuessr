# Setup Guide

This will hopefully, guide you through setting up MineGuessr on your own world.

## **Prerequisites**

The following are required to run MineGuessr:
- [BlueMap](https://bluemap.bluecolored.de/) installed on your Minecraft server
- [Rust](https://doc.rust-lang.org/cargo/getting-started/installation.html)
- [Bun](https://bun.sh/) or [NodeJS](https://nodejs.org/en/download) + [Bun](https://bun.sh/)
- [a Discord Application](https://discord.com/developers/applications) for OAuth2
- **Experience with the command line and basic programming**

*We don't provide any prebuilt binaries and everything needs to be built / ran from source*

## **Setup**

First, clone the repository:
```bash
git clone https://github.com/VilleOlof/90gqguessr.git
cd 90gqguessr
```

*Or download directly from [Github](https://github.com/VilleOlof/90gqguessr)*

And then we will go over the different parts of the project.  
And set them up one by one, starting with the Map Proxy.  

## **Map Proxy**

> [!TIP]
> But if you can change the CORS settings for your BlueMap Webserver, you can skip this step.  

If you can't change the CORS settings on your BlueMap server, you will need to run the Map Proxy.  
This is a small Rust program that acts as a middleman between the website and the BlueMap server.


```bash
cd map_proxy # Directory for the map proxy
```

### **Configuration**

The Map Proxy needs a `Config.toml` when building the binary.  
```toml
# Config.toml
map_url = "https://bluecolored.de/bluemap" # URL to the BlueMap webserver
port = 40401 # Port the Map Proxy will run on
redis_url = "redis://localhost:6379/" # Redis URL for caching assets
cache_time = 3600 # How long caches stay valid in redis
```

### **Building and Running**

> [!IMPORTANT]
> A Redis server is required to run the Map Proxy.

```bash
# Build the binary
cargo build --release 
# Start it
./target/release/map_proxy.exe

# Or simply:
cargo r -r
```

## **The Website**

The website is built with SvelteKit & Prisma.  

### **Configuration**

We start by installing the dependencies:
::: code-group

```bash [NodeJS]
npm install
```

```bash [Bun]
bun install
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

# Discord OAuth2
DISCORD_CLIENT_ID = ""
DISCORD_CLIENT_SECRET = ""

# This should be the same as `PUBLIC_ORIGIN` + `/discord`
DISCORD_REDIRECT_URL = ""
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

```bash [NodeJS]
npx prisma db push
```

```bash [Bun]
bunx prisma db push
```
> [!NOTE]
> This is a locally ran SQLite Database

:::

### **Building and Running**

```bash
# Build
npm run build
# Start the website
node -r dotenv/config build

# Note, we haven't tested the website with Bun
```

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
```bash
cd image_converter
cargo r -r -- -i "path/to/panorama_folders" -o "path/to/output_folder"
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
DATABASE_URL = "../prisma/db.sqlite"

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
You can find your `CLIENT_ID` & `CLIENT_SECRET` in your Discord Application under `OAuth2`.  

For the `REDIRECT_URL`, you'll have to add `{PUBLIC_ORIGIN}/discord` to the OAuth2 Redirects.  


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