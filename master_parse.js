const fs = require('fs');
const path = require('path');

const baseDir = 'story/world/locations';
const files = [
    'businesses.html', 'datacenters.html', 'government.html', 'homes.html', 'infrastructure.html', 'underworld.html'
];

const width = 3543;
const height = 1994;
const cx = width / 2;
const cy = height / 2;

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    return Math.abs(hash);
}

function getCoords(city, type, id) {
    const h1 = hashString(id + "x");
    const h2 = hashString(id + "y");

    if (city === "Lagos") {
        // PER USER ORDER: TOP LEFT OR CENTER OF LAGOS ONLY
        const zone = h1 % 2; // 0 for center, 1 for top-left
        if (zone === 0) {
            // CENTER CLUSTER
            return {
                x: Math.round(cx + (h1 % 400) - 200),
                y: Math.round(cy + (h2 % 400) - 200)
            };
        } else {
            // TOP LEFT CLUSTER
            return {
                x: Math.round(200 + (h1 % 800)),
                y: Math.round(200 + (h2 % 600))
            };
        }
    }
    
    const typeStr = type.toLowerCase();
    const isCore = ["corporate", "ai lab", "government", "datacenter", "financial", "bank", "plaza", "studio", "research"].some(t => typeStr.includes(t));
    const isInfra = ["power", "bunker", "relay", "cell", "satellite", "uplink"].some(t => typeStr.includes(t));
    const isWarehouse = typeStr.includes("warehouse") || typeStr.includes("depot");

    if (isCore) {
        // Inner 25%
        return {
            x: Math.round(cx + (h1 % (width * 0.25)) - (width * 0.125)),
            y: Math.round(cy + (h2 % (height * 0.25)) - (height * 0.125))
        };
    } else if (isInfra) {
        // Extreme Edges
        const angle = (h1 % 360) * (Math.PI / 180);
        const rx = (width * 0.42) + (h2 % (width * 0.05));
        const ry = (height * 0.42) + (h1 % (height * 0.05));
        return {
            x: Math.round(cx + Math.cos(angle) * rx),
            y: Math.round(cy + Math.sin(angle) * ry)
        };
    } else if (isWarehouse) {
        // Near "Highways" (x=800 or x=2700 corridors)
        const highwayX = (h1 % 2 === 0) ? 800 : 2700;
        return {
            x: Math.round(highwayX + (h1 % 200) - 100),
            y: Math.round(100 + (h2 % (height - 200)))
        };
    } else {
        // Periphery Ring
        const angle = (h1 % 360) * (Math.PI / 180);
        const rx = (width * 0.28) + (h2 % (width * 0.12));
        const ry = (height * 0.28) + (h1 % (height * 0.12));
        return {
            x: Math.round(cx + Math.cos(angle) * rx),
            y: Math.round(cy + Math.sin(angle) * ry)
        };
    }
}

let allLocations = {};

files.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Split by City (H2)
    const cityParts = content.split(/<h2>/i);
    cityParts.shift(); // Remove intro

    cityParts.forEach(part => {
        const cityEnd = part.indexOf('</h2>');
        let city = part.substring(0, cityEnd).trim().replace(/ \(.*?\)/g, '').split(',')[0].trim();
        
        if (!allLocations[city]) {
            allLocations[city] = { orgs: [], homes: [], gov: [], crews: [], datacenters: [], infrastructure: [], warehouses: [] };
        }

        // Split by Entry
        const entries = part.split(/<div class="property-entry">/i);
        entries.shift();

        entries.forEach(entry => {
            const nameMatch = entry.match(/<h3>(.*?)<\/h3>/i);
            const typeMatch = entry.match(/<li><strong>Type:<\/strong>\s*(.*?)<\/li>/i);
            
            if (nameMatch && typeMatch) {
                const name = nameMatch[1].trim().replace(/<[^>]*>?/gm, '');
                const typeRaw = typeMatch[1].trim();
                const id = (city.substring(0,3) + "_" + hashString(name)).toLowerCase().replace(/[^a-z0-9_]/g, '');
                const coords = getCoords(city, typeRaw, id);
                
                const locObj = { id, name, type: typeRaw, x: coords.x, y: coords.y };

                if (file === 'businesses.html') allLocations[city].orgs.push(locObj);
                else if (file === 'homes.html') allLocations[city].homes.push(locObj);
                else if (file === 'government.html') allLocations[city].gov.push(locObj);
                else if (file === 'underworld.html') allLocations[city].crews.push(locObj);
                else if (file === 'datacenters.html') allLocations[city].datacenters.push(locObj);
                else if (file === 'infrastructure.html') {
                    if (typeRaw.toLowerCase().includes('warehouse')) allLocations[city].warehouses.push(locObj);
                    else allLocations[city].infrastructure.push(locObj);
                }
            }
        });
    });
});

// Final Polish: Ensure Warehouse Minimums
Object.keys(allLocations).forEach(city => {
    if (allLocations[city].warehouses.length < 3) {
        for (let i = allLocations[city].warehouses.length + 1; i <= 4; i++) {
            const id = `wh_gen_${city.toLowerCase()}_${i}`;
            const coords = getCoords(city, "Warehouse", id);
            allLocations[city].warehouses.push({
                id, name: `${city} Logistics Center ${i}`, type: "Warehouse", x: coords.x, y: coords.y
            });
        }
    }
});

fs.writeFileSync('story/world/cities/locations.json', JSON.stringify(allLocations, null, 2));
console.log(`SUCCESS: Processed ${Object.keys(allLocations).length} cities.`);
