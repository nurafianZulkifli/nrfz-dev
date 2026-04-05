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
let currentDayType = 'weekdays'; // Track current day type across all formats
let hasDirections = false;

// First pass: check if file has "From" headers (multi-direction format)
hasDirections = lines.some(line => line.startsWith('From'));

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is a standalone day type label
    if (dayTypeMap[line] && line.split('\t').length === 1) {
        currentDayType = dayTypeMap[line];
        continue;
    }
    
    if (hasDirections) {
        // Multi-direction format
        
        // Check for direction line
        if (line.startsWith('From')) {
            currentDirection = line.split('\t')[0].replace('From ', '').trim();
            directionFreqs[currentDirection] = {};
            headerLine = null; // Reset header for this direction
            continue;
        }
        
        // Check for time period header line (contains time periods like 6:30am, 8.31am, etc.)
        if (!headerLine && (line.includes('6:30am') || line.includes('8.31am') || line.includes('5.00pm') || line.includes('After'))) {
            const parts = line.split('\t').map(h => h.trim());
            // Check if first part is a day type
            if (dayTypeMap[parts[0]]) {
                currentDayType = dayTypeMap[parts[0]];
                headerLine = parts.slice(1); // Time periods
            } else {
                // First part is already a time period
                headerLine = parts;
            }
            continue;
        }
        
        // Parse frequency data for current direction
        if (currentDirection && headerLine && line) {
            const parts = line.split('\t').map(p => p.trim());
            
            // Check if this line is just a day type label
            if (parts.length === 1 && dayTypeMap[parts[0]]) {
                currentDayType = dayTypeMap[parts[0]];
                continue;
            }
            
            // Check if this line contains frequencies
            if (parts.length >= headerLine.length || parts[0].includes('–') || parts[0].includes('-')) {
                const dayType = currentDayType;
                
                if (!directionFreqs[currentDirection][dayType]) {
                    directionFreqs[currentDirection][dayType] = {};
                }
                
                // Map frequencies to time periods (all parts are frequencies)
                for (let j = 0; j < parts.length && j < headerLine.length; j++) {
                    const timePeriod = timePeriodMap[headerLine[j]];
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
            const parts = line.split('\t').map(h => h.trim());
            // Check if first part is a day type
            if (dayTypeMap[parts[0]]) {
                currentDayType = dayTypeMap[parts[0]];
                headerLine = parts.slice(1); // Skip first column with day type
            } else {
                headerLine = parts; // All parts are time periods
            }
            continue;
        }
        
        // Parse data lines for simple format
        if (headerLine && line) {
            const parts = line.split('\t').map(p => p.trim());
            const dayTypeKey = parts[0];
            const dayType = dayTypeMap[dayTypeKey];
            
            // Check if this is a day label or just raw frequency data (daily)
            const isFrequencyData = !dayType && parts[0] && (parts[0].includes('–') || parts[0].includes('-')) || /\d/.test(parts[0]);
            
            if (dayType) {
                // Has day label in this line
                currentDayType = dayType;
                
                if (!freq_detail[currentDayType]) {
                    freq_detail[currentDayType] = {};
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
                        
                        freq_detail[currentDayType][timePeriod] = frequency;
                    }
                }
            } else if (isFrequencyData) {
                // Use current day type tracking
                if (!freq_detail[currentDayType]) {
                    freq_detail[currentDayType] = {};
                }
                
                // Map frequencies to time periods
                for (let j = 0; j < parts.length; j++) {
                    const timePeriod = timePeriodMap[headerLine[j]];
                    if (timePeriod && parts[j]) {
                        const frequency = parts[j]
                            .replace(' mins', '')
                            .replace('–', '-')
                            .replace(' – ', '-')
                            .replace(/ - /g, '-')
                            .trim();
                        
                        freq_detail[currentDayType][timePeriod] = frequency;
                    }
                }
            }
        }
    }
}

// Check if all day types have identical frequencies (daily pattern)
// Helper function to check if a frequency object is daily (all day types identical)
const checkIfDaily = (freqObj) => {
    const dayTypes = ['weekdays', 'saturdays', 'sundays_holidays'];
    if (!dayTypes.every(dt => freqObj[dt])) return false;
    
    const firstDayFreqs = JSON.stringify(freqObj['weekdays']);
    return dayTypes.every(dt => JSON.stringify(freqObj[dt]) === firstDayFreqs);
};

// Helper function to simplify frequency to Daily if applicable
const simplifyToDaily = (freqObj) => {
    if (checkIfDaily(freqObj)) {
        return { "Daily": freqObj['weekdays'] };
    }
    return freqObj;
};

// Convert to numbered directions (1, 2, etc.) if using direction format
let output = {};

if (hasDirections) {
    const result = {};
    const directions = Object.keys(directionFreqs);
    
    directions.forEach((direction, index) => {
        result[String(index + 1)] = simplifyToDaily(directionFreqs[direction]);
    });
    
    output = { "direction_freqs": result };
} else {
    output = { "freq_detail": simplifyToDaily(freq_detail) };
}

console.log(JSON.stringify(output, null, 2));

// Optionally save to file
const outputPath = path.join(__dirname, '../json/Freq-formatted.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`\nFormatted JSON saved to: ${outputPath}`);
