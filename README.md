# 90gQGuessr

Guess the minecraft ingame location based off a 360 panorama view and use the map to guess the location.  

a game has 5 rounds. 5000 score per round max, the closer the more points. (count in chunks?)  
If the guess is within 1-2 chunks it should be considered perfect.  

achivements?

## /
Should actually be a home page. no weird state changes. if you go `/` you always get the home page.
Play button, quick how to like stamdle, maybe daily in the future? but fuck dates?  
More detailed instructions, also on how scoring works.  

"Karta från map.90gq.se" at in the corner next to version and stats.  
AND SEND STATS TO SERVER !!!   

## /play
The actual game, always start a new game when entering this site. the game is valid as long as the tab is open.  
so just hold the game data in mem. no localstorage and shit, except for additions to stats.  
generate a game id and use that to send stats to server so the server knows exact what stats came from what game.  


## locations
the locations should be in `/static/locations/(index)/panorama_x.png`.  
and then a master records file at `/src/lib/loc_metadata.json`.  

this metadata file should contain the index and what coord it is related to.  
this is hidden in the lib dir so users cant fetch the master location file of all guessable locations  
when a play round is loaded, the server fetches 5 random locations from the metadata.  

metadata should just be like an array of objects, and each object has the location asset index and the coords in a number[]  

photos should have no resourcepacks, no mods that effect visuals, taken on main acc so no ones sus.  

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
node build
```

*Insert information regarding `./src/lib/server/loc_metadata.json` and `./static/locations/*/*.webp`*

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
```

### **Image Converter**
*This is only used in development to convert panorama pngs to webp*

```bash
cd /image_converter # Directory for the converter
cargo build --release # Build the binary

# Run it with an input and output arg
./target/release/image_converter.exe -i "./conversions/in" -o "/conversions/out"
```


