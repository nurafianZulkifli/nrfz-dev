const fs = require('fs');
const path = require('path');

// Read the Freq.txt file
const filePath = path.join(__dirname, '../json/Freq.txt');
const content = fs.readFileSync(filePath, 'utf-8');

// Time period mapping
const timePeriodMap = {
    '6:30am–8.30am': '06:30-08:30',
    '8.31am–4.59pm': '08:31-16:59',
    '5.00pm–7.00pm': '17:00-19:00',
    'After 7.00pm': '19:01-23:59'
};

// Day type mapping
const dayTypeMap = {
    'Weekdays': 'weekdays',
    'Mondays – Thursdays': 'weekdays',
    'Mondays – Fridays': 'weekdays',
    'Fridays': 'fridays',
    'Saturdays': 'saturdays',
    'Sundays / Public Holidays': 'sundays_holidays'
};

// Parse the file
const lines = content.split('\n').map(line => line.trim()).filter(line => line);

let directionFreqs = {};
let freq_detail = {};
let currentDirection = null;
let headerLine = null;
let hasDirections = false;

// First pass: check if file has "From" headers (multi-direction format)
hasDirections = lines.some(line => line.startsWith('From'));

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (hasDirections) {
        // Multi-direction format
        if (line.startsWith('From')) {
            currentDirection = line.split('\t')[0].replace('From ', '').trim();
            directionFreqs[currentDirection] = {};
            // Get header from the same line
            const parts = line.split('\t');
            headerLine = parts.slice(1).map(h => h.trim());
            continue;
        }
        
        // Parse data lines for multi-direction format
        if (headerLine && line && currentDirection) {
            const parts = line.split('\t').map(p => p.trim());
            const dayTypeKey = parts[0];
            const dayType = dayTypeMap[dayTypeKey];
            
            if (dayType) {
                if (!directionFreqs[currentDirection][dayType]) {
                    directionFreqs[currentDirection][dayType] = {};
                }
                
                // Map frequencies to time periods
                for (let j = 1; j < parts.length; j++) {
                    const timePeriod = timePeriodMap[headerLine[j - 1]];
                    if (timePeriod && parts[j]) {
                        const frequency = parts[j]
                            .replace(' mins', '')
                            .replace('–', '-')
                            .replace(' – ', '-')
                            .replace(/ - /g, '-')
                            .trim();
                        
                        directionFreqs[currentDirection][dayType][timePeriod] = frequency;
                    }
                }
            }
        }
    } else {
        // Simple single-table format (backward compatible)
        if (line.includes('Loop Service') || line.includes('From Yio') || line.includes('From Upper') || line.includes('6:30am')) {
            headerLine = line.split('\t').map(h => h.trim()).slice(1); // Skip first column
            continue;
        }
        
        // Parse data lines for simple format
        if (headerLine && line) {
            const parts = line.split('\t').map(p => p.trim());
            const dayTypeKey = parts[0];
            const dayType = dayTypeMap[dayTypeKey];
            
            if (dayType) {
                if (!freq_detail[dayType]) {
                    freq_detail[dayType] = {};
                }
                
                // Map frequencies to time periods
                for (let j = 1; j < parts.length; j++) {
                    const timePeriod = timePeriodMap[headerLine[j - 1]];
                    if (timePeriod && parts[j]) {
                        const frequency = parts[j]
                            .replace(' mins', '')
                            .replace('–', '-')
                            .replace(' – ', '-')
                            .replace(/ - /g, '-')
                            .trim();
                        
                        freq_detail[dayType][timePeriod] = frequency;
                    }
                }
            }
        }
    }
}

// Convert to numbered directions (1, 2, etc.) if using direction format
let output = {};

if (hasDirections) {
    const result = {};
    const directions = Object.keys(directionFreqs);
    
    directions.forEach((direction, index) => {
        result[String(index + 1)] = directionFreqs[direction];
    });
    
    output = { "direction_freqs": result };
} else {
    output = { "freq_detail": freq_detail };
}

console.log(JSON.stringify(output, null, 2));

// Optionally save to file
const outputPath = path.join(__dirname, '../json/Freq-formatted.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`\nFormatted JSON saved to: ${outputPath}`);
